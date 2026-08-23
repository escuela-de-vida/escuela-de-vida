import { createAdminClient } from "@/lib/supabase/admin";
import { toISODate } from "@/lib/dates";
import { findOriginalScheduledDate } from "./chain";
import { daysBetween } from "./points";

export type SweepResult = {
  closed: number;
  rescheduled: number;
};

/**
 * Recorre las task_instances "pendiente" con scheduled_date anterior a hoy
 * y aplica la regla de 72hs (sección 6.4):
 *   - Si ya pasaron 3+ días desde la fecha ORIGINAL (no la de la última
 *     reprogramación): cierra la instancia como no_hecho, 0 puntos, sin
 *     generar deuda.
 *   - Si todavía está dentro de la ventana de gracia: la marca
 *     "reprogramado" y le da al alumno una instancia fresca para hoy — o
 *     bien crea una nueva, o bien engancha la ya generada hoy por el motor
 *     diario si la tarea es de recurrencia diaria (evita duplicar).
 */
export async function sweepOverdueInstances(
  today: Date = new Date(),
): Promise<SweepResult> {
  const supabase = createAdminClient();
  const isoToday = toISODate(today);

  const { data: overdue } = await supabase
    .from("task_instances")
    .select("id, family_id, template_id, student_id, scheduled_date")
    .eq("status", "pendiente")
    .lt("scheduled_date", isoToday);

  if (!overdue || overdue.length === 0) {
    return { closed: 0, rescheduled: 0 };
  }

  let closed = 0;
  let rescheduled = 0;

  for (const instance of overdue) {
    const originalDate = await findOriginalScheduledDate(
      supabase,
      instance.id,
      instance.scheduled_date,
    );
    const daysLate = daysBetween(originalDate, isoToday);

    if (daysLate >= 3) {
      await supabase
        .from("task_instances")
        .update({ status: "no_hecho", points_awarded: 0 })
        .eq("id", instance.id);
      closed += 1;
      continue;
    }

    const { data: todays } = await supabase
      .from("task_instances")
      .select("id, rescheduled_from_id")
      .eq("template_id", instance.template_id)
      .eq("student_id", instance.student_id)
      .eq("scheduled_date", isoToday)
      .maybeSingle();

    if (todays) {
      if (!todays.rescheduled_from_id) {
        await supabase
          .from("task_instances")
          .update({ rescheduled_from_id: instance.id })
          .eq("id", todays.id);
      }
    } else {
      await supabase.from("task_instances").insert({
        family_id: instance.family_id,
        template_id: instance.template_id,
        student_id: instance.student_id,
        scheduled_date: isoToday,
        status: "pendiente",
        rescheduled_from_id: instance.id,
      });
    }

    await supabase
      .from("task_instances")
      .update({ status: "reprogramado" })
      .eq("id", instance.id);
    rescheduled += 1;
  }

  return { closed, rescheduled };
}
