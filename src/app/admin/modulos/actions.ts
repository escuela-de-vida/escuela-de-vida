"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/current-user";
import type { ModuleContent } from "@/lib/curriculum/types";

export type SubjectModuleInput = {
  category_id: string;
  stage: string | null;
  order_index: number;
  title: string;
  description: string | null;
  content: ModuleContent;
  points: number;
  active: boolean;
};

async function requireAdminFamily() {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "parent_admin") {
    throw new Error("No autorizado");
  }
  return profile;
}

export async function createSubjectModule(input: SubjectModuleInput) {
  const profile = await requireAdminFamily();
  const supabase = await createClient();
  const { error } = await supabase
    .from("subject_modules")
    .insert({ ...input, content: input.content, family_id: profile.family_id });

  if (error) throw new Error(error.message);
  revalidatePath("/admin/modulos");
}

export async function updateSubjectModule(id: string, input: SubjectModuleInput) {
  await requireAdminFamily();
  const supabase = await createClient();
  const { error } = await supabase
    .from("subject_modules")
    .update({ ...input, content: input.content })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/modulos");
}

export async function deleteSubjectModule(id: string) {
  await requireAdminFamily();
  const supabase = await createClient();
  const { error } = await supabase.from("subject_modules").delete().eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/modulos");
}
