"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentProfile } from "@/lib/auth/current-user";

export async function startReading(bookId: string) {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "student") throw new Error("No autorizado");

  const supabase = await createClient();
  const { error } = await supabase.from("book_progress").upsert(
    {
      family_id: profile.family_id,
      student_id: profile.id,
      book_id: bookId,
      status: "leyendo",
    },
    { onConflict: "student_id,book_id" },
  );

  if (error) throw new Error(error.message);
  revalidatePath("/materias/lectura");
}

export async function finishReading(bookId: string, reviewText: string) {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "student") throw new Error("No autorizado");
  if (!reviewText.trim()) throw new Error("Escribí algo sobre el libro primero.");

  const supabase = await createClient();

  const { data: book } = await supabase
    .from("books")
    .select("points_base")
    .eq("id", bookId)
    .single();

  const points = book?.points_base ?? 20;

  const { error: progressError } = await supabase.from("book_progress").upsert(
    {
      family_id: profile.family_id,
      student_id: profile.id,
      book_id: bookId,
      status: "leido",
      review_text: reviewText.trim(),
      finished_at: new Date().toISOString(),
    },
    { onConflict: "student_id,book_id" },
  );

  if (progressError) throw new Error(progressError.message);

  const admin = createAdminClient();
  const { error: ledgerError } = await admin.from("points_ledger").insert({
    family_id: profile.family_id,
    student_id: profile.id,
    source_type: "module",
    source_id: bookId,
    points,
    reason: "Reseña de lectura completada",
  });
  if (ledgerError) throw new Error(ledgerError.message);

  revalidatePath("/materias/lectura");
  return { points };
}
