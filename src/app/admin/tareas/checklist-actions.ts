"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/current-user";

export type ChecklistItemInput = {
  task_template_id: string;
  label: string;
  points: number;
  duration_minutes: number;
  recurrence_days: number[] | null;
  order_index: number;
};

async function requireAdminFamily() {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "parent_admin") {
    throw new Error("No autorizado");
  }
  return profile;
}

export async function createChecklistItem(input: ChecklistItemInput) {
  const profile = await requireAdminFamily();
  const supabase = await createClient();
  const { error } = await supabase
    .from("task_checklist_items")
    .insert({ ...input, family_id: profile.family_id });

  if (error) throw new Error(error.message);
  revalidatePath("/admin/tareas");
}

export async function updateChecklistItem(
  id: string,
  input: ChecklistItemInput,
) {
  await requireAdminFamily();
  const supabase = await createClient();
  const { error } = await supabase
    .from("task_checklist_items")
    .update(input)
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/tareas");
}

export async function deleteChecklistItem(id: string) {
  await requireAdminFamily();
  const supabase = await createClient();
  const { error } = await supabase
    .from("task_checklist_items")
    .delete()
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/tareas");
}
