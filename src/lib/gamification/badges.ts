import { createAdminClient } from "@/lib/supabase/admin";
import { toISODate } from "@/lib/dates";
import { getRank } from "./ranks";
import { BADGE_CATALOG } from "./badge-catalog";

const admin = () => createAdminClient();

async function countCategoryCompletions(
  studentId: string,
  categoryName: string,
): Promise<number> {
  const supabase = admin();
  const { count } = await supabase
    .from("task_instances")
    .select("id, task_templates!inner(category_id, categories!inner(name))", {
      count: "exact",
      head: true,
    })
    .eq("student_id", studentId)
    .eq("status", "hecho")
    .eq("task_templates.categories.name", categoryName);
  return count ?? 0;
}

async function categoryStreak(
  studentId: string,
  categoryName: string,
): Promise<number> {
  const supabase = admin();
  const { data } = await supabase
    .from("task_instances")
    .select("scheduled_date, task_templates!inner(categories!inner(name))")
    .eq("student_id", studentId)
    .eq("status", "hecho")
    .eq("task_templates.categories.name", categoryName)
    .order("scheduled_date", { ascending: false })
    .limit(400);

  if (!data || data.length === 0) return 0;
  const doneDays = new Set(data.map((r) => r.scheduled_date));
  let streak = 0;
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);
  while (doneDays.has(toISODate(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

async function globalStreak(studentId: string): Promise<number> {
  const supabase = admin();
  const { data } = await supabase
    .from("task_instances")
    .select("scheduled_date")
    .eq("student_id", studentId)
    .eq("status", "hecho")
    .order("scheduled_date", { ascending: false })
    .limit(400);
  if (!data || data.length === 0) return 0;
  const doneDays = new Set(data.map((r) => r.scheduled_date));
  let streak = 0;
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);
  while (doneDays.has(toISODate(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

const CHECKERS: Record<string, (studentId: string) => Promise<boolean>> = {
  "mente-en-calma": async (id) => (await categoryStreak(id, "Mente")) >= 7,
  "energia-total": async (id) => (await countCategoryCompletions(id, "Cuerpo")) >= 30,
  "chef-de-la-casa": async (id) => (await countCategoryCompletions(id, "Cocina")) >= 10,
  "manos-a-la-obra": async (id) =>
    (await countCategoryCompletions(id, "Vida Práctica")) >= 5,
  "orador-nato": async (id) =>
    (await countCategoryCompletions(id, "Public Speaking")) >= 3,
  "racha-de-hierro": async (id) => (await globalStreak(id)) >= 30,

  "devorador-de-libros": async (id) => {
    const { count } = await admin()
      .from("book_progress")
      .select("id", { count: "exact", head: true })
      .eq("student_id", id)
      .eq("status", "leido");
    return (count ?? 0) >= 10;
  },

  "bilingue-en-marcha": async (id) => {
    const { data } = await admin()
      .from("book_progress")
      .select("book_id, books!inner(language)")
      .eq("student_id", id)
      .eq("status", "leido")
      .eq("books.language", "en");
    return (data?.length ?? 0) >= 3;
  },

  "artista-en-ascenso": async (id) => {
    const { count } = await admin()
      .from("submissions")
      .select("id", { count: "exact", head: true })
      .eq("student_id", id)
      .eq("type", "foto");
    return (count ?? 0) >= 5;
  },

  "segunda-oportunidad": async (id) => {
    const { data } = await admin()
      .from("task_instances")
      .select("id, points_awarded, task_templates!inner(points_base)")
      .eq("student_id", id)
      .eq("status", "hecho")
      .not("points_awarded", "is", null);
    const graced = (data ?? []).filter(
      (row) =>
        (row.points_awarded ?? 0) > 0 &&
        (row.points_awarded ?? 0) < (row.task_templates as unknown as { points_base: number }).points_base,
    );
    return graced.length >= 5;
  },

  "proyecto-del-mes": async (id) => {
    const { data } = await admin()
      .from("student_module_progress")
      .select("points_awarded")
      .eq("student_id", id)
      .eq("status", "completado")
      .gte("points_awarded", 20);
    return (data?.length ?? 0) >= 1;
  },

  "nivel-superado": async (id) => {
    const { data } = await admin()
      .from("points_ledger")
      .select("points")
      .eq("student_id", id);
    const total = (data ?? []).reduce((sum, r) => sum + r.points, 0);
    return getRank(total).name !== "Semilla";
  },
};

/**
 * Corre los checkers automáticos y otorga las insignias nuevas que
 * correspondan. Se llama después de cada acción que suma puntos (tarea,
 * módulo, libro) — sección 6.7. badge_awards tiene UNIQUE(student_id,
 * badge_id), así que otorgar de más simplemente no inserta de nuevo.
 */
export async function checkAndAwardBadges(
  studentId: string,
  familyId: string,
): Promise<string[]> {
  const supabase = admin();

  const { data: badgeRows } = await supabase
    .from("badges")
    .select("id, name")
    .or(`family_id.is.null,family_id.eq.${familyId}`);
  if (!badgeRows) return [];
  const badgeIdByName = new Map(badgeRows.map((b) => [b.name, b.id]));

  const { data: existingAwards } = await supabase
    .from("badge_awards")
    .select("badge_id")
    .eq("student_id", studentId);
  const alreadyAwarded = new Set((existingAwards ?? []).map((a) => a.badge_id));

  const newlyAwarded: string[] = [];

  for (const def of BADGE_CATALOG) {
    if (!def.autoCheck) continue;
    const checker = CHECKERS[def.slug];
    if (!checker) continue;

    const badgeId = badgeIdByName.get(def.name);
    if (!badgeId || alreadyAwarded.has(badgeId)) continue;

    if (!(await checker(studentId))) continue;

    const { error } = await supabase.from("badge_awards").insert({
      family_id: familyId,
      student_id: studentId,
      badge_id: badgeId,
    });
    if (!error) newlyAwarded.push(def.name);
  }

  return newlyAwarded;
}
