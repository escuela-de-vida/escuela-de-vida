import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

/**
 * Encuentra la fecha originalmente programada de una instancia, siguiendo
 * la cadena de rescheduled_from_id hacia atrás. La cadena nunca supera ~2
 * saltos en la práctica (la ventana de gracia es de 72hs), pero el tope de
 * 5 es una salvaguarda defensiva.
 */
export async function findOriginalScheduledDate(
  supabase: SupabaseClient<Database>,
  instanceId: string,
  scheduledDate: string,
): Promise<string> {
  let currentId = instanceId;
  let currentDate = scheduledDate;

  for (let hops = 0; hops < 5; hops++) {
    const { data } = await supabase
      .from("task_instances")
      .select("id, scheduled_date, rescheduled_from_id")
      .eq("id", currentId)
      .single();

    if (!data?.rescheduled_from_id) break;

    const parentId: string = data.rescheduled_from_id;
    const { data: parent } = await supabase
      .from("task_instances")
      .select("scheduled_date")
      .eq("id", parentId)
      .single();

    if (!parent) break;
    currentId = parentId;
    currentDate = parent.scheduled_date;
  }

  return currentDate;
}
