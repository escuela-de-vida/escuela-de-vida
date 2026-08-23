import { createClient } from "@/lib/supabase/server";
import { toISODate } from "@/lib/dates";

export type HeatmapInstance = {
  id: string;
  scheduled_date: string;
  status: "pendiente" | "hecho" | "no_hecho" | "reprogramado";
  points_awarded: number | null;
  task: {
    id: string;
    title: string;
    points_base: number;
    duration_minutes: number | null;
    category: { id: string; name: string; color: string } | null;
  } | null;
};

export async function getTaskInstancesForRange(
  studentId: string,
  from: Date,
  to: Date,
): Promise<HeatmapInstance[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("task_instances")
    .select(
      `id, scheduled_date, status, points_awarded,
       task_templates ( id, title, points_base, duration_minutes,
         categories ( id, name, color ) )`,
    )
    .eq("student_id", studentId)
    .gte("scheduled_date", toISODate(from))
    .lte("scheduled_date", toISODate(to))
    .order("scheduled_date", { ascending: true });

  if (error || !data) return [];

  return data.map((row) => {
    const template = Array.isArray(row.task_templates)
      ? row.task_templates[0]
      : row.task_templates;
    const category = template
      ? Array.isArray(template.categories)
        ? template.categories[0]
        : template.categories
      : null;

    return {
      id: row.id,
      scheduled_date: row.scheduled_date,
      status: row.status as HeatmapInstance["status"],
      points_awarded: row.points_awarded,
      task: template
        ? {
            id: template.id,
            title: template.title,
            points_base: template.points_base,
            duration_minutes: template.duration_minutes,
            category: category
              ? { id: category.id, name: category.name, color: category.color }
              : null,
          }
        : null,
    };
  });
}

export async function getPointsTotal(studentId: string): Promise<number> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("points_ledger")
    .select("points")
    .eq("student_id", studentId);

  return (data ?? []).reduce((sum, row) => sum + row.points, 0);
}

/** Racha = días consecutivos (hasta hoy) con al menos una tarea "hecho". */
export async function getStreak(studentId: string): Promise<number> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("task_instances")
    .select("scheduled_date")
    .eq("student_id", studentId)
    .eq("status", "hecho")
    .order("scheduled_date", { ascending: false })
    .limit(400);

  if (!data || data.length === 0) return 0;

  const doneDays = new Set(data.map((row) => row.scheduled_date));
  let streak = 0;
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);

  while (doneDays.has(toISODate(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}
