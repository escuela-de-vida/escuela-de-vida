"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/current-user";

export type CategoryInput = {
  name: string;
  color: string;
  icon: string | null;
  type: "materia" | "habito";
  display_order: number;
  active: boolean;
  supports_tracks: boolean;
};

async function requireAdminFamily() {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "parent_admin") {
    throw new Error("No autorizado");
  }
  return profile;
}

export async function createCategory(input: CategoryInput) {
  const profile = await requireAdminFamily();
  const supabase = await createClient();
  const { error } = await supabase
    .from("categories")
    .insert({ ...input, family_id: profile.family_id });

  if (error) throw new Error(error.message);
  revalidatePath("/admin/categorias");
}

export async function updateCategory(id: string, input: CategoryInput) {
  await requireAdminFamily();
  const supabase = await createClient();
  const { error } = await supabase
    .from("categories")
    .update(input)
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/categorias");
}

export async function deleteCategory(id: string) {
  await requireAdminFamily();
  const supabase = await createClient();
  const { error } = await supabase.from("categories").delete().eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/categorias");
}
