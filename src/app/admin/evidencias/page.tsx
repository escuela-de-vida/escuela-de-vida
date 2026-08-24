import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/current-user";
import { createClient } from "@/lib/supabase/server";
import { EvidenceList, type ReadingReview } from "./evidence-list";
import { ModuleEvidenceList, type ModuleSubmission } from "./module-evidence-list";

export default async function EvidenciasPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  if (profile.role !== "parent_admin") redirect("/dashboard");

  const supabase = await createClient();

  const [{ data: bookRows }, { data: submissionRows }] = await Promise.all([
    supabase
      .from("book_progress")
      .select(
        "id, review_text, ai_evaluation, admin_override_score, admin_override_comment, finished_at, student_id, book_id, users:student_id ( display_name ), books:book_id ( title, points_base )",
      )
      .eq("status", "leido")
      .not("review_text", "is", null)
      .order("finished_at", { ascending: false }),
    supabase
      .from("submissions")
      .select(
        "id, text_content, ai_evaluation, admin_override_score, admin_override_comment, created_at, student_id, metadata, users:student_id ( display_name )",
      )
      .eq("type", "texto")
      .not("metadata->subject_module_id", "is", null)
      .order("created_at", { ascending: false }),
  ]);

  const reviews: ReadingReview[] = (bookRows ?? []).map((r) => {
    const student = Array.isArray(r.users) ? r.users[0] : r.users;
    const book = Array.isArray(r.books) ? r.books[0] : r.books;
    return {
      id: r.id,
      studentId: r.student_id,
      studentName: student?.display_name ?? "Alumno",
      bookId: r.book_id,
      bookTitle: book?.title ?? "Libro",
      pointsBase: book?.points_base ?? 0,
      reviewText: r.review_text ?? "",
      aiEvaluation: r.ai_evaluation as ReadingReview["aiEvaluation"],
      adminOverrideScore: r.admin_override_score,
      adminOverrideComment: r.admin_override_comment,
      finishedAt: r.finished_at,
    };
  });

  const moduleIds = Array.from(
    new Set(
      (submissionRows ?? [])
        .map((s) => (s.metadata as { subject_module_id?: string })?.subject_module_id)
        .filter((id): id is string => Boolean(id)),
    ),
  );

  const { data: moduleRows } =
    moduleIds.length > 0
      ? await supabase
          .from("subject_modules")
          .select("id, title, points, categories ( name )")
          .in("id", moduleIds)
      : { data: [] };

  const moduleById = new Map(
    (moduleRows ?? []).map((m) => {
      const category = Array.isArray(m.categories) ? m.categories[0] : m.categories;
      return [m.id, { title: m.title, points: m.points, categoryName: category?.name ?? null }];
    }),
  );

  const moduleSubmissions: ModuleSubmission[] = (submissionRows ?? [])
    .map((s) => {
      const moduleId = (s.metadata as { subject_module_id?: string })?.subject_module_id;
      if (!moduleId) return null;
      const module = moduleById.get(moduleId);
      const student = Array.isArray(s.users) ? s.users[0] : s.users;
      return {
        id: s.id,
        studentId: s.student_id,
        moduleId,
        moduleTitle: module?.title ?? "Módulo",
        categoryName: module?.categoryName ?? null,
        pointsBase: module?.points ?? 0,
        text: s.text_content ?? "",
        aiEvaluation: s.ai_evaluation as ModuleSubmission["aiEvaluation"],
        adminOverrideScore: s.admin_override_score,
        adminOverrideComment: s.admin_override_comment,
        createdAt: s.created_at,
        studentName: student?.display_name ?? "Alumno",
      };
    })
    .filter((s): s is ModuleSubmission => s !== null);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-[22px] font-semibold tracking-tight">
          Revisión de evidencias
        </h1>
        <p className="text-[14px] text-muted-foreground">
          Reseñas y reflexiones evaluadas por IA (o pendientes de evaluación
          manual) con posibilidad de ajustar el puntaje.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-[15px] font-medium text-muted-foreground">
          Reseñas de lectura
        </h2>
        {reviews.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Todavía no hay reseñas para revisar.
          </p>
        ) : (
          <EvidenceList reviews={reviews} />
        )}
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-[15px] font-medium text-muted-foreground">
          Reflexiones y escritura (Mente, Escritura Creativa, Geografía)
        </h2>
        {moduleSubmissions.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Todavía no hay entregas para revisar.
          </p>
        ) : (
          <ModuleEvidenceList submissions={moduleSubmissions} />
        )}
      </div>
    </div>
  );
}
