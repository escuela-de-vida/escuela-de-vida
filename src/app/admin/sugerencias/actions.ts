"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/current-user";

async function requireAdmin() {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "parent_admin") throw new Error("No autorizado");
  return profile;
}

export async function markSuggestionSeen(id: string) {
  await requireAdmin();
  const supabase = await createClient();
  await supabase
    .from("feedback_suggestions")
    .update({ status: "visto" })
    .eq("id", id)
    .eq("status", "nuevo");
  revalidatePath("/admin/sugerencias");
}

export async function replySuggestion(id: string, response: string) {
  await requireAdmin();
  if (!response.trim()) throw new Error("Escribí una respuesta primero.");

  const supabase = await createClient();
  const { error } = await supabase
    .from("feedback_suggestions")
    .update({ status: "respondido", admin_response: response.trim() })
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/sugerencias");
}
