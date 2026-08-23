import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/current-user";
import { createClient } from "@/lib/supabase/server";
import { EvidenceList, type ReadingReview } from "./evidence-list";

export default async function EvidenciasPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  if (profile.role !== "parent_admin") redirect("/dashboard");

  const supabase = await createClient();
  const { data: rows } = await supabase
    .from("book_progress")
    .select(
      "id, review_text, ai_evaluation, admin_override_score, admin_override_comment, finished_at, student_id, book_id, users:student_id ( display_name ), books:book_id ( title, points_base )",
    )
    .eq("status", "leido")
    .not("review_text", "is", null)
    .order("finished_at", { ascending: false });

  const reviews: ReadingReview[] = (rows ?? []).map((r) => {
    const student = Array.isArray(r.users) ? r.users[0] : r.users;
    const book = Array.isArray(r.books) ? r.books[0] : r.books;
    return {
      id: r.id,
      studentId: r.student_id,
      studentName: student?.display_name ?? "Alumno",
      bookId: r.book_id,
      bookTitle: book?.title ?? "Libro",
      pointsBase: book?.points_base ?? 0,
      reviewText: r.review_text,
      aiEvaluation: r.ai_evaluation as ReadingReview["aiEvaluation"],
      adminOverrideScore: r.admin_override_score,
      adminOverrideComment: r.admin_override_comment,
      finishedAt: r.finished_at,
    };
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-[22px] font-semibold tracking-tight">
          Revisión de evidencias
        </h1>
        <p className="text-[14px] text-muted-foreground">
          Reseñas de lectura evaluadas por IA (o pendientes de evaluación
          manual) con posibilidad de ajustar el puntaje.
        </p>
      </div>

      {reviews.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Todavía no hay reseñas para revisar.
        </p>
      ) : (
        <EvidenceList reviews={reviews} />
      )}
    </div>
  );
}
