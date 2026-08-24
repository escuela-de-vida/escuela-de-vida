import { renderToBuffer } from "@react-pdf/renderer";
import { getCurrentProfile } from "@/lib/auth/current-user";
import { createClient } from "@/lib/supabase/server";
import { getPointsTotal, getStreak } from "@/lib/dashboard/queries";
import { getRank } from "@/lib/gamification/ranks";
import { BitacoraDocument, type BitacoraBook, type BitacoraBadge } from "@/lib/pdf/bitacora-document";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ studentId: string }> },
) {
  const { studentId } = await params;
  const profile = await getCurrentProfile();
  if (!profile) return new Response("No autorizado", { status: 401 });

  const isSelf = profile.role === "student" && profile.id === studentId;
  const isAdmin = profile.role === "parent_admin";
  if (!isSelf && !isAdmin) {
    return new Response("No autorizado", { status: 403 });
  }

  const supabase = await createClient();

  const { data: student } = await supabase
    .from("users")
    .select("display_name, family_id")
    .eq("id", studentId)
    .single();

  if (!student || student.family_id !== profile.family_id) {
    return new Response("No encontrado", { status: 404 });
  }

  const [points, streak, { data: awards }, { data: bookRows }, { data: pointsRows }] =
    await Promise.all([
      getPointsTotal(studentId),
      getStreak(studentId),
      supabase
        .from("badge_awards")
        .select("badges ( name, icon )")
        .eq("student_id", studentId)
        .order("awarded_at", { ascending: false }),
      supabase
        .from("book_progress")
        .select("book_id, review_text, finished_at, books ( title, author )")
        .eq("student_id", studentId)
        .eq("status", "leido")
        .order("finished_at", { ascending: false }),
      supabase
        .from("points_ledger")
        .select("source_id, points")
        .eq("student_id", studentId)
        .eq("source_type", "module"),
    ]);

  const pointsBySource = new Map(
    (pointsRows ?? []).map((p) => [p.source_id, p.points]),
  );

  const badges: BitacoraBadge[] = (awards ?? [])
    .map((a) => (Array.isArray(a.badges) ? a.badges[0] : a.badges))
    .filter((b): b is { name: string; icon: string | null } => Boolean(b));

  const books: BitacoraBook[] = (bookRows ?? []).map((row) => {
    const book = Array.isArray(row.books) ? row.books[0] : row.books;
    return {
      title: book?.title ?? "Libro",
      author: book?.author ?? null,
      points: pointsBySource.get(row.book_id) ?? null,
      reviewText: row.review_text,
      finishedAt: row.finished_at,
    };
  });

  const rank = getRank(points);

  const buffer = await renderToBuffer(
    <BitacoraDocument
      studentName={student.display_name}
      rankName={rank.name}
      points={points}
      streak={streak}
      badges={badges}
      books={books}
      generatedAt={new Date()}
    />,
  );

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="bitacora-${student.display_name.toLowerCase().replace(/\s+/g, "-")}.pdf"`,
    },
  });
}
