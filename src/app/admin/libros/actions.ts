"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/current-user";

export type BookInput = {
  title: string;
  author: string | null;
  category_id: string | null;
  total_pages: number | null;
  active: boolean;
  genres: string[];
  language: "es" | "en";
  synopsis: string | null;
  points_base: number;
};

async function requireAdminFamily() {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "parent_admin") {
    throw new Error("No autorizado");
  }
  return profile;
}

export async function createBook(input: BookInput) {
  const profile = await requireAdminFamily();
  const supabase = await createClient();
  const { error } = await supabase
    .from("books")
    .insert({ ...input, family_id: profile.family_id });

  if (error) throw new Error(error.message);
  revalidatePath("/admin/libros");
}

export async function updateBook(id: string, input: BookInput) {
  await requireAdminFamily();
  const supabase = await createClient();
  const { error } = await supabase.from("books").update(input).eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/libros");
}

export async function deleteBook(id: string) {
  await requireAdminFamily();
  const supabase = await createClient();
  const { error } = await supabase.from("books").delete().eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/libros");
}
