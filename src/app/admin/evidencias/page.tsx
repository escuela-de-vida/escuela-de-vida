import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/current-user";
import { createClient } from "@/lib/supabase/server";
import { getEvidenceSignedUrl } from "@/lib/storage/evidence";
import { EvidenceList, type ReadingReview } from "./evidence-list";
import { ModuleEvidenceList, type ModuleSubmission } from "./module-evidence-list";
import { PhotoEvidenceList, type PhotoSubmission } from "./photo-evidence-list";

export default async function EvidenciasPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  if (profile.role !== "parent_admin") redirect("/dashboard");

  const supabase = await createClient();

  const [{ data: bookRows }, { data: submissionRows }, { data: photoRows }] = await Promise.all([
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
    supabase
      .from("submissions")
      .select(
        "id, file_url, ai_evaluation, admin_override_score, admin_override_comment, created_at, student_id, task_instance_id, users:student_id ( display_name ), task_instances:task_instance_id ( points_awarded, task_templates ( title ) )",
      )
      .eq("type", "foto")
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

  const photoSubmissions: PhotoSubmission[] = await Promise.all(
    (photoRows ?? []).map(async (p) => {
      const student = Array.isArray(p.users) ? p.users[0] : p.users;
      const taskInstance = Array.isArray(p.task_instances)
        ? p.task_instances[0]
        : p.task_instances;
      const template = taskInstance
        ? Array.isArray(taskInstance.task_templates)
          ? taskInstance.task_templates[0]
          : taskInstance.task_templates
        : null;

      return {
        id: p.id,
        studentId: p.student_id,
        studentName: student?.display_name ?? "Alumno",
        taskInstanceId: p.task_instance_id ?? "",
        taskTitle: template?.title ?? "Tarea",
        currentPoints: taskInstance?.points_awarded ?? 0,
        signedUrl: p.file_url ? await getEvidenceSignedUrl(p.file_url) : null,
        aiEvaluation: p.ai_evaluation as PhotoSubmission["aiEvaluation"],
        adminOverrideScore: p.admin_override_score,
        adminOverrideComment: p.admin_override_comment,
        createdAt: p.created_at,
      };
    }),
  );

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

      <div className="flex flex-col gap-3">
        <h2 className="text-[15px] font-medium text-muted-foreground">
          Fotos de tareas
        </h2>
        {photoSubmissions.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Todavía no hay fotos para revisar.
          </p>
        ) : (
          <PhotoEvidenceList submissions={photoSubmissions} />
        )}
      </div>
    </div>
  );
}
