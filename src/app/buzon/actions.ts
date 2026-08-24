"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/current-user";

export async function sendSuggestion(message: string) {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "student") throw new Error("No autorizado");
  if (!message.trim()) throw new Error("Escribí algo primero.");

  const supabase = await createClient();
  const { error } = await supabase.from("feedback_suggestions").insert({
    family_id: profile.family_id,
    student_id: profile.id,
    message: message.trim(),
  });
  if (error) throw new Error(error.message);

  revalidatePath("/buzon");
}
