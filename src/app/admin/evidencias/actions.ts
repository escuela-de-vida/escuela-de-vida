"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentProfile } from "@/lib/auth/current-user";

async function requireAdmin() {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "parent_admin") {
    throw new Error("No autorizado");
  }
  return profile;
}

export async function overrideReadingScore(params: {
  bookProgressId: string;
  studentId: string;
  bookId: string;
  newPoints: number;
  comment: string;
}) {
  const profile = await requireAdmin();
  const supabase = await createClient();
  const admin = createAdminClient();

  const { data: priorEntries } = await supabase
    .from("points_ledger")
    .select("points")
    .eq("student_id", params.studentId)
    .eq("source_type", "module")
    .eq("source_id", params.bookId);

  const currentlyAwarded = (priorEntries ?? []).reduce(
    (sum, e) => sum + e.points,
    0,
  );
  const delta = params.newPoints - currentlyAwarded;

  if (delta !== 0) {
    const { error: ledgerError } = await admin.from("points_ledger").insert({
      family_id: profile.family_id,
      student_id: params.studentId,
      source_type: "manual_admin",
      source_id: params.bookId,
      points: delta,
      reason: `Corrección de admin sobre reseña de lectura: ${params.comment || "sin comentario"}`,
    });
    if (ledgerError) throw new Error(ledgerError.message);
  }

  const { error } = await supabase
    .from("book_progress")
    .update({
      admin_override_score: params.newPoints,
      admin_override_comment: params.comment || null,
      reviewed_by: profile.id,
    })
    .eq("id", params.bookProgressId);

  if (error) throw new Error(error.message);

  revalidatePath("/admin/evidencias");
  revalidatePath("/perfil");
}
