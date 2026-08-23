import { createClient } from "@/lib/supabase/server";
import { ModuleManager } from "./module-manager";
import type { SubjectModuleInput } from "./actions";

export default async function ModulosPage() {
  const supabase = await createClient();
  const [{ data: modules }, { data: categories }] = await Promise.all([
    supabase
      .from("subject_modules")
      .select("*")
      .order("category_id", { ascending: true })
      .order("order_index", { ascending: true }),
    supabase
      .from("categories")
      .select("id, name, color")
      .eq("active", true)
      .order("display_order", { ascending: true }),
  ]);

  const typedModules = (modules ?? []).map((m) => ({
    ...m,
    content: m.content as unknown as SubjectModuleInput["content"],
  }));

  return (
    <ModuleManager modules={typedModules} categories={categories ?? []} />
  );
}
