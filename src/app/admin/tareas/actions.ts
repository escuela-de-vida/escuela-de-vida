"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/current-user";

export type TaskTemplateInput = {
  category_id: string;
  title: string;
  description: string | null;
  points_base: number;
  duration_minutes: number | null;
  recurrence: string;
  focus_batch_required: boolean;
  active: boolean;
};

async function requireAdminFamily() {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "parent_admin") {
    throw new Error("No autorizado");
  }
  return profile;
}

export async function createTaskTemplate(input: TaskTemplateInput) {
  const profile = await requireAdminFamily();
  const supabase = await createClient();
  const { error } = await supabase
    .from("task_templates")
    .insert({ ...input, family_id: profile.family_id });

  if (error) throw new Error(error.message);
  revalidatePath("/admin/tareas");
}

export async function updateTaskTemplate(
  id: string,
  input: TaskTemplateInput,
) {
  await requireAdminFamily();
  const supabase = await createClient();
  const { error } = await supabase
    .from("task_templates")
    .update(input)
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/tareas");
}

export async function deleteTaskTemplate(id: string) {
  await requireAdminFamily();
  const supabase = await createClient();
  const { error } = await supabase
    .from("task_templates")
    .delete()
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/tareas");
}
