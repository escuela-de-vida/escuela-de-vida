import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { Compass, ArrowLeft } from "lucide-react";
import { getCurrentProfile } from "@/lib/auth/current-user";
import { getCategoryBySlug, getModulesWithProgress } from "@/lib/curriculum/queries";
import { createClient } from "@/lib/supabase/server";
import { randomQuestions } from "@/lib/curriculum/reading-questions";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ModulePath } from "./module-path";
import { ModuleInteraction } from "./module-interaction";
import { LecturaLanding, type BookWithProgress } from "../lectura/lectura-landing";
import { TypingWidget, type TypingHistoryRow } from "../mecanografia/typing-widget";
import { CuerpoLanding } from "../cuerpo/cuerpo-landing";
import { getBodyDashboardData, type BodyDashboardData } from "../cuerpo/queries";

async function getBooksWithProgress(
  familyId: string,
  studentId: string,
): Promise<BookWithProgress[]> {
  const supabase = await createClient();
  const [{ data: books }, { data: progress }] = await Promise.all([
    supabase
      .from("books")
      .select("id, title, author, genres, language, synopsis")
      .eq("family_id", familyId)
      .eq("active", true)
      .order("title", { ascending: true }),
    supabase
      .from("book_progress")
      .select("book_id, status")
      .eq("student_id", studentId),
  ]);

  const { data: pointsRows } = await supabase
    .from("points_ledger")
    .select("source_id, points")
    .eq("student_id", studentId)
    .eq("source_type", "module");
  const pointsBySource = new Map(
    (pointsRows ?? []).map((p) => [p.source_id, p.points]),
  );

  const progressByBook = new Map((progress ?? []).map((p) => [p.book_id, p]));

  return (books ?? []).map((book) => {
    const p = progressByBook.get(book.id);
    return {
      id: book.id,
      title: book.title,
      author: book.author,
      genres: book.genres,
      language: book.language,
      synopsis: book.synopsis,
      status: (p?.status as BookWithProgress["status"]) ?? "por_leer",
      pointsEarned: pointsBySource.get(book.id) ?? null,
    };
  });
}

export default async function MateriaLandingPage({
  params,
}: PageProps<"/materias/[slug]">) {
  const { slug } = await params;
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const isStudent = profile.role === "student";
  const isLectura = slug === "lectura";
  const isComunicacion = slug === "comunicacion";
  const isCuerpo = slug === "cuerpo";

  const header = (
    <header className="glass-panel sticky top-0 z-10 flex items-center gap-3 px-8 py-4">
      <Link
        href="/materias"
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
      </Link>
      <div
        className="flex h-9 w-9 items-center justify-center rounded-full"
        style={{ background: category.color }}
      >
        <Compass className="h-5 w-5 text-white" strokeWidth={1.75} />
      </div>
      <span className="text-[17px] font-semibold tracking-tight">
        {category.name}
      </span>
    </header>
  );

  if (isLectura) {
    const books = isStudent
      ? await getBooksWithProgress(category.family_id, profile.id)
      : [];
    const questions = randomQuestions();

    return (
      <div className="flex min-h-full flex-1 flex-col">
        {header}
        <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-8 py-10">
          {!isStudent && (
            <p className="rounded-lg bg-muted px-4 py-3 text-sm text-muted-foreground">
              Vista de admin — gestioná el catálogo desde{" "}
              <Link href="/admin/libros" className="underline">
                /admin/libros
              </Link>
              .
            </p>
          )}
          {isStudent && books.length === 0 && (
            <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border py-16 text-center">
              <p className="text-[15px] text-muted-foreground">
                Todavía no hay libros en el catálogo.
              </p>
            </div>
          )}
          {isStudent && books.length > 0 && (
            <LecturaLanding
              books={books}
              questions={questions}
              color={category.color}
            />
          )}
        </main>
      </div>
    );
  }

  if (isComunicacion) {
    let history: TypingHistoryRow[] = [];
    if (isStudent) {
      const supabase = await createClient();
      const { data } = await supabase
        .from("typing_sessions")
        .select("wpm, accuracy_pct, created_at")
        .eq("student_id", profile.id)
        .order("created_at", { ascending: false })
        .limit(30);
      history = data ?? [];
    }

    return (
      <div className="flex min-h-full flex-1 flex-col">
        {header}
        <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-8 py-10">
          {!isStudent ? (
            <p className="rounded-lg bg-muted px-4 py-3 text-sm text-muted-foreground">
              Vista de admin — la práctica de mecanografía es para los
              alumnos.
            </p>
          ) : (
            <TypingWidget history={history} color={category.color} />
          )}
        </main>
      </div>
    );
  }

  if (isCuerpo) {
    let dashboardData: BodyDashboardData | null = null;
    if (isStudent) {
      const supabase = await createClient();
      const { data: template } = await supabase
        .from("task_templates")
        .select("id")
        .eq("category_id", category.id)
        .eq("title", "Cuerpo")
        .maybeSingle();
      if (template) {
        dashboardData = await getBodyDashboardData(category.family_id, profile.id, template.id);
      }
    }

    return (
      <div className="flex min-h-full flex-1 flex-col">
        {header}
        <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-8 py-10">
          {!isStudent && (
            <p className="rounded-lg bg-muted px-4 py-3 text-sm text-muted-foreground">
              Vista de admin — el dashboard de calistenia es para los
              alumnos. Configurá peso, edad y días de entrenamiento desde{" "}
              <Link href="/admin/cuerpo" className="underline">
                /admin/cuerpo
              </Link>
              .
            </p>
          )}
          {isStudent && dashboardData && (
            <CuerpoLanding data={dashboardData} categoryColor={category.color} />
          )}
          {isStudent && !dashboardData && (
            <p className="rounded-lg bg-muted px-4 py-3 text-sm text-muted-foreground">
              Todavía no hay tarea de Cuerpo configurada para hoy.
            </p>
          )}
        </main>
      </div>
    );
  }

  const modules = isStudent
    ? await getModulesWithProgress(category.id, profile.id)
    : [];

  const completedCount = modules.filter((m) => m.status === "completado").length;
  const currentModule = modules.find((m) => m.status === "actual");
  const totalPoints = modules.reduce((sum, m) => sum + (m.pointsAwarded ?? 0), 0);

  return (
    <div className="flex min-h-full flex-1 flex-col">
      {header}

      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-8 py-10">
        {!isStudent && (
          <p className="rounded-lg bg-muted px-4 py-3 text-sm text-muted-foreground">
            Vista de admin — el camino de expedición y la interacción son
            para los alumnos. Gestioná el contenido desde{" "}
            <Link href="/admin/modulos" className="underline">
              /admin/modulos
            </Link>
            .
          </p>
        )}

        {isStudent && modules.length === 0 && (
          <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border py-16 text-center">
            <p className="text-[15px] text-muted-foreground">
              Todavía no hay módulos cargados para esta materia.
            </p>
          </div>
        )}

        {isStudent && modules.length > 0 && (
          <>
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>
                  {completedCount}/{modules.length} módulos · {totalPoints} pts
                </span>
              </div>
              <Progress value={(completedCount / modules.length) * 100} />
            </div>

            {currentModule ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-[19px]">
                    {currentModule.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ModuleInteraction
                    module={currentModule}
                    color={category.color}
                  />
                </CardContent>
              </Card>
            ) : (
              <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border py-12 text-center">
                <p className="text-[15px] font-medium">
                  ¡Completaste todos los módulos de esta materia!
                </p>
              </div>
            )}

            <div className="flex flex-col gap-2">
              <h2 className="text-[15px] font-medium text-muted-foreground">
                Camino de expedición
              </h2>
              <ModulePath modules={modules} color={category.color} />
            </div>
          </>
        )}
      </main>
    </div>
  );
}
