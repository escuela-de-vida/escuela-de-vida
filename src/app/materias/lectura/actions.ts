"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentProfile } from "@/lib/auth/current-user";
import { checkAndAwardBadges } from "@/lib/gamification/badges";
import { evaluateReadingReview } from "@/lib/ai/evaluate-reading";

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
    .select("title, points_base")
    .eq("id", bookId)
    .single();

  const pointsBase = book?.points_base ?? 20;
  const trimmedReview = reviewText.trim();

  const evaluation = await evaluateReadingReview({
    bookTitle: book?.title ?? "este libro",
    reviewText: trimmedReview,
  });

  const points = evaluation
    ? Math.max(1, Math.round((pointsBase * evaluation.percentage) / 100))
    : pointsBase;

  const aiEvaluation = evaluation
    ? { ...evaluation, pending: false }
    : { pending: true };

  const { error: progressError } = await supabase.from("book_progress").upsert(
    {
      family_id: profile.family_id,
      student_id: profile.id,
      book_id: bookId,
      status: "leido",
      review_text: trimmedReview,
      ai_evaluation: aiEvaluation,
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
    reason: evaluation
      ? "Reseña de lectura completada (evaluación IA)"
      : "Reseña de lectura completada (pendiente de revisión manual)",
  });
  if (ledgerError) throw new Error(ledgerError.message);

  await checkAndAwardBadges(profile.id, profile.family_id);

  revalidatePath("/materias/lectura");
  return {
    points,
    pending: !evaluation,
    feedback: evaluation?.feedback ?? null,
  };
}
