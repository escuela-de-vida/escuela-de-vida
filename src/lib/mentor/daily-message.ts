import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getTaskInstancesForRange, getStreak } from "@/lib/dashboard/queries";
import { addDays, startOfDay, toISODate } from "@/lib/dates";
import { quoteOfTheDay } from "./quotes";

export type DailyMessage = {
  id: string;
  title: string;
  body: string;
  read_at: string | null;
};

/**
 * Mensaje diario del mentor (sección 5.2) — se dispara en el primer login
 * del día. Armado con datos reales del alumno (sección 8: hoy vive como
 * plantilla determinística; cuando haya GEMINI_API_KEY se puede sumar
 * una pasada de Claude encima de este mismo esqueleto sin cambiar el resto
 * del flujo).
 */
export async function getOrCreateDailyMessage(
  studentId: string,
  familyId: string,
  displayName: string,
): Promise<DailyMessage> {
  const supabase = await createClient();
  const today = startOfDay(new Date());
  const todayISO = toISODate(today);

  const { data: existing } = await supabase
    .from("notifications")
    .select("id, title, body, read_at")
    .eq("user_id", studentId)
    .eq("type", "mensaje_diario")
    .gte("created_at", today.toISOString())
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existing) {
    return {
      id: existing.id,
      title: existing.title,
      body: existing.body ?? "",
      read_at: existing.read_at,
    };
  }

  const yesterday = addDays(today, -1);
  const [yesterdayInstances, todayInstances, streak] = await Promise.all([
    getTaskInstancesForRange(studentId, yesterday, yesterday),
    getTaskInstancesForRange(studentId, today, today),
    getStreak(studentId),
  ]);

  const doneYesterday = yesterdayInstances.filter((i) => i.status === "hecho").length;
  const totalYesterday = yesterdayInstances.length;

  let opening: string;
  if (totalYesterday === 0) {
    opening = "Hoy arrancamos de cero — vamos con todo.";
  } else if (doneYesterday === totalYesterday) {
    opening = `Ayer cerraste ${doneYesterday} de ${totalYesterday} tareas y tu racha va por ${streak} ${streak === 1 ? "día" : "días"} — nada mal.`;
  } else if (doneYesterday === 0) {
    opening = "Ayer costó arrancar y no pasa nada — se recupera hoy sin drama.";
  } else {
    opening = `Ayer completaste ${doneYesterday} de ${totalYesterday} tareas — lo que quedó no se pierde, se recupera hoy.`;
  }

  const pending = todayInstances
    .filter((i) => i.status === "pendiente")
    .slice(0, 3)
    .map((i) => i.task?.title)
    .filter((t): t is string => Boolean(t));

  const priorities =
    pending.length > 0
      ? `Hoy: ${pending.join(", ")}.`
      : "Hoy todavía no hay tareas generadas — mirá el mapa del día cuando aparezcan.";

  const quote = quoteOfTheDay(today);
  const firstName = displayName.split(" ")[0];
  const body = `${opening} ${priorities} "${quote}"`;

  const admin = createAdminClient();
  const { data: created, error } = await admin
    .from("notifications")
    .insert({
      family_id: familyId,
      user_id: studentId,
      type: "mensaje_diario",
      title: `Buen día, ${firstName}`,
      body,
    })
    .select("id, title, body, read_at")
    .single();

  if (error || !created) {
    return { id: `local-${todayISO}`, title: `Buen día, ${firstName}`, body, read_at: null };
  }

  return {
    id: created.id,
    title: created.title,
    body: created.body ?? body,
    read_at: created.read_at,
  };
}
