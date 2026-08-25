import { createClient } from "@/lib/supabase/server";
import { toISODate } from "@/lib/dates";
import { getEvidenceSignedUrl } from "@/lib/storage/evidence";
import { getTodaysRoutine, getWeeklySplit, type BodyConfig } from "@/lib/body/routine";

export type BodyDashboardData = {
  config: BodyConfig;
  todaysTaskInstanceId: string | null;
  todaysTaskStatus: "pendiente" | "hecho" | "no_hecho" | "reprogramado" | null;
  routine: ReturnType<typeof getTodaysRoutine>;
  weeklySplit: ReturnType<typeof getWeeklySplit>;
  doneWeekdays: number[];
  recentSessions: {
    id: string;
    day_type: string;
    felt: string | null;
    rounds_completed: number;
    points_awarded: number;
    created_at: string;
  }[];
  progressPhotos: { id: string; url: string; created_at: string }[];
};

export async function getBodyDashboardData(
  familyId: string,
  studentId: string,
  categoryTaskTemplateId: string,
): Promise<BodyDashboardData> {
  const supabase = await createClient();
  const today = new Date();
  const todayISO = toISODate(today);
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 6);

  const [{ data: configRow }, { data: todaysInstance }, { data: weekInstances }, { data: sessions }] =
    await Promise.all([
      supabase
        .from("student_body_config")
        .select("weight_kg, age_years, days_per_week")
        .eq("student_id", studentId)
        .maybeSingle(),
      supabase
        .from("task_instances")
        .select("id, status")
        .eq("student_id", studentId)
        .eq("template_id", categoryTaskTemplateId)
        .eq("scheduled_date", todayISO)
        .maybeSingle(),
      supabase
        .from("task_instances")
        .select("scheduled_date, status")
        .eq("student_id", studentId)
        .eq("template_id", categoryTaskTemplateId)
        .gte("scheduled_date", toISODate(weekAgo))
        .lte("scheduled_date", todayISO),
      supabase
        .from("body_workout_sessions")
        .select("id, day_type, felt, rounds_completed, points_awarded, created_at")
        .eq("student_id", studentId)
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

  const config: BodyConfig = {
    weightKg: configRow?.weight_kg ?? null,
    ageYears: configRow?.age_years ?? null,
    daysPerWeek: configRow?.days_per_week ?? 3,
  };

  const doneWeekdays = (weekInstances ?? [])
    .filter((i) => i.status === "hecho")
    .map((i) => new Date(`${i.scheduled_date}T00:00:00`).getDay());

  const { data: photoRows } = await supabase
    .from("submissions")
    .select("id, file_url, created_at")
    .eq("student_id", studentId)
    .eq("type", "foto")
    .contains("metadata", { kind: "progreso_cuerpo" })
    .order("created_at", { ascending: false })
    .limit(12);

  const progressPhotos = await Promise.all(
    (photoRows ?? []).map(async (row) => ({
      id: row.id,
      url: row.file_url ? await getEvidenceSignedUrl(row.file_url, 600) : null,
      created_at: row.created_at,
    })),
  );

  return {
    config,
    todaysTaskInstanceId: todaysInstance?.id ?? null,
    todaysTaskStatus: (todaysInstance?.status as BodyDashboardData["todaysTaskStatus"]) ?? null,
    routine: getTodaysRoutine(config, today),
    weeklySplit: getWeeklySplit(config.daysPerWeek),
    doneWeekdays,
    recentSessions: sessions ?? [],
    progressPhotos: progressPhotos.filter(
      (p): p is { id: string; url: string; created_at: string } => Boolean(p.url),
    ),
  };
}
