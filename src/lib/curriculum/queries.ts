import { createClient } from "@/lib/supabase/server";
import type { ModuleContent, ModuleWithStatus } from "./types";

export async function getCategoryBySlug(slug: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("categories")
    .select("*")
    .eq("slug", slug)
    .single();
  return data;
}

export async function getCategories() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("categories")
    .select("*")
    .eq("active", true)
    .order("display_order", { ascending: true });
  return data ?? [];
}

/**
 * Trae los módulos de una materia y calcula, para un alumno dado, cuál está
 * completado / es el actual / sigue bloqueado — sin necesidad de filas de
 * progreso pre-sembradas: student_module_progress solo guarda 'completado',
 * el resto se deriva en el momento (sección 5.5, "camino de expedición").
 */
export async function getModulesWithProgress(
  categoryId: string,
  studentId: string,
): Promise<ModuleWithStatus[]> {
  const supabase = await createClient();

  const [{ data: modules }, { data: progress }] = await Promise.all([
    supabase
      .from("subject_modules")
      .select("id, title, description, stage, order_index, points, content")
      .eq("category_id", categoryId)
      .eq("active", true)
      .order("order_index", { ascending: true }),
    supabase
      .from("student_module_progress")
      .select("module_id, status, points_awarded")
      .eq("student_id", studentId),
  ]);

  const progressByModule = new Map(
    (progress ?? []).map((p) => [p.module_id, p]),
  );

  let unlocked = true;
  return (modules ?? []).map((module) => {
    const existing = progressByModule.get(module.id);
    let status: ModuleWithStatus["status"];
    if (existing) {
      status = existing.status as ModuleWithStatus["status"];
    } else if (unlocked) {
      status = "actual";
    } else {
      status = "bloqueado";
    }
    unlocked = status === "completado";

    return {
      id: module.id,
      title: module.title,
      description: module.description,
      stage: module.stage,
      order_index: module.order_index,
      points: module.points,
      content: module.content as unknown as ModuleContent,
      status,
      pointsAwarded: existing?.points_awarded ?? null,
    };
  });
}
