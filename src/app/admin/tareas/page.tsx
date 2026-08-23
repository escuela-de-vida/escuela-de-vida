import { createClient } from "@/lib/supabase/server";
import { TaskManager } from "./task-manager";

export default async function TareasPage() {
  const supabase = await createClient();
  const [{ data: tasks }, { data: categories }] = await Promise.all([
    supabase
      .from("task_templates")
      .select("*")
      .order("created_at", { ascending: false }),
    supabase
      .from("categories")
      .select("id, name, color")
      .eq("active", true)
      .order("display_order", { ascending: true }),
  ]);

  return (
    <TaskManager tasks={tasks ?? []} categories={categories ?? []} />
  );
}
