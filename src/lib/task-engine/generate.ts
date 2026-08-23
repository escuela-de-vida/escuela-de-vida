import { createAdminClient } from "@/lib/supabase/admin";
import { toISODate } from "@/lib/dates";
import { shouldGenerateToday } from "./recurrence";

export type GenerateResult = {
  created: number;
  skippedExisting: number;
  templatesConsidered: number;
};

/**
 * Genera las task_instances del día para cada plantilla activa cuya
 * recurrencia corresponda hoy, para cada alumno elegible de la familia.
 * Un alumno es elegible si la tarea no tiene track, o si el alumno tiene
 * asignado ese track (sección 7.8 — student_tracks).
 *
 * Idempotente: el UNIQUE (template_id, student_id, scheduled_date) hace que
 * reintentos o corridas duplicadas del cron no generen filas de más.
 */
export async function generateInstancesForToday(
  today: Date = new Date(),
): Promise<GenerateResult> {
  const supabase = createAdminClient();
  const isoToday = toISODate(today);

  const { data: templates } = await supabase
    .from("task_templates")
    .select("id, family_id, recurrence, track_id")
    .eq("active", true);

  if (!templates || templates.length === 0) {
    return { created: 0, skippedExisting: 0, templatesConsidered: 0 };
  }

  const due = templates.filter((t) => shouldGenerateToday(t.recurrence, today));
  if (due.length === 0) {
    return { created: 0, skippedExisting: 0, templatesConsidered: templates.length };
  }

  const familyIds = [...new Set(due.map((t) => t.family_id))];
  const { data: students } = await supabase
    .from("users")
    .select("id, family_id")
    .eq("role", "student")
    .in("family_id", familyIds);

  const studentsByFamily = new Map<string, string[]>();
  for (const s of students ?? []) {
    studentsByFamily.set(s.family_id, [
      ...(studentsByFamily.get(s.family_id) ?? []),
      s.id,
    ]);
  }

  const trackIds = [...new Set(due.map((t) => t.track_id).filter(Boolean))] as string[];
  const { data: assignments } =
    trackIds.length > 0
      ? await supabase
          .from("student_tracks")
          .select("student_id, track_id")
          .in("track_id", trackIds)
          .is("ended_at", null)
      : { data: [] as { student_id: string; track_id: string }[] };

  const studentsByTrack = new Map<string, Set<string>>();
  for (const a of assignments ?? []) {
    if (!studentsByTrack.has(a.track_id)) studentsByTrack.set(a.track_id, new Set());
    studentsByTrack.get(a.track_id)!.add(a.student_id);
  }

  type NewInstance = {
    family_id: string;
    template_id: string;
    student_id: string;
    scheduled_date: string;
    status: "pendiente";
  };
  const rows: NewInstance[] = [];

  for (const template of due) {
    const familyStudents = studentsByFamily.get(template.family_id) ?? [];
    const eligible = template.track_id
      ? familyStudents.filter((id) =>
          studentsByTrack.get(template.track_id!)?.has(id),
        )
      : familyStudents;

    for (const studentId of eligible) {
      rows.push({
        family_id: template.family_id,
        template_id: template.id,
        student_id: studentId,
        scheduled_date: isoToday,
        status: "pendiente",
      });
    }
  }

  if (rows.length === 0) {
    return { created: 0, skippedExisting: 0, templatesConsidered: templates.length };
  }

  const { data: inserted, error } = await supabase
    .from("task_instances")
    .upsert(rows, {
      onConflict: "template_id,student_id,scheduled_date",
      ignoreDuplicates: true,
    })
    .select("id");

  if (error) throw new Error(error.message);

  return {
    created: inserted?.length ?? 0,
    skippedExisting: rows.length - (inserted?.length ?? 0),
    templatesConsidered: templates.length,
  };
}
