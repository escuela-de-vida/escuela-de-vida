import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

export type ChecklistItem = {
  id: string;
  label: string;
  points: number;
  duration_minutes: number;
};

/** Mismo criterio que task_templates.recurrence_days: null = todos los días. */
export function isDueToday(recurrenceDays: number[] | null, date: Date): boolean {
  if (!recurrenceDays || recurrenceDays.length === 0) return true;
  return recurrenceDays.includes(date.getDay());
}

/**
 * Los items de checklist que corresponden HOY para una tarea — cada uno
 * puede tener sus propios días (ej. "Uñas" solo miércoles y domingo). Si
 * la tarea no tiene ningún item configurado, la tarea sigue funcionando
 * como un timer simple (retrocompatible).
 */
export async function getTodaysChecklistItems(
  supabase: SupabaseClient<Database>,
  taskTemplateId: string,
  date: Date,
): Promise<ChecklistItem[]> {
  const { data } = await supabase
    .from("task_checklist_items")
    .select("id, label, points, duration_minutes, recurrence_days")
    .eq("task_template_id", taskTemplateId)
    .eq("active", true)
    .order("order_index", { ascending: true });

  return (data ?? [])
    .filter((item) => isDueToday(item.recurrence_days, date))
    .map((item) => ({
      id: item.id,
      label: item.label,
      points: item.points,
      duration_minutes: item.duration_minutes,
    }));
}
