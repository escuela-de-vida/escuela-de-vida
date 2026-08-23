import { createClient } from "@/lib/supabase/server";

export type LeaderboardRow = {
  displayName: string;
  points: number;
  isFictional: boolean;
  isSelf: boolean;
};

// Sección 6.6 — 8 arquetipos ficticios. "Mati" es el "casi-en-la-cima":
// su puntaje se recalcula como el promedio de los alumnos reales +5-15%,
// para que siempre haya alguien alcanzable arriba.
const ARCHETYPES = [
  { name: "Vale", kind: "constante" as const },
  { name: "Nico", kind: "sprinter" as const },
  { name: "Sasha", kind: "recien-llegado" as const },
  { name: "Mati", kind: "casi-en-la-cima" as const },
  { name: "Cande", kind: "irregular" as const },
  { name: "Toti", kind: "constante-alto" as const },
  { name: "Uma", kind: "recien-llegado" as const },
  { name: "Bruno", kind: "constante" as const },
];

/** PRNG determinístico simple — mismo seed, mismo número, sin dependencias. */
function seededRandom(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (h << 5) - h + seed.charCodeAt(i);
    h |= 0;
  }
  return (Math.abs(h) % 1000) / 1000;
}

function isoWeekKey(date: Date): string {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  const week = Math.ceil(((d.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7);
  return `${d.getFullYear()}-W${week}`;
}

function fictionalScore(
  archetypeName: string,
  kind: (typeof ARCHETYPES)[number]["kind"],
  weekKey: string,
  realAverage: number,
): number {
  const r = seededRandom(`${archetypeName}-${weekKey}`);
  switch (kind) {
    case "constante":
      return Math.round(60 + r * 30);
    case "constante-alto":
      return Math.round(140 + r * 40);
    case "sprinter":
      return Math.round(30 + r * 160);
    case "recien-llegado":
      return Math.round(10 + r * 25);
    case "irregular":
      return Math.round(20 + r * 90);
    case "casi-en-la-cima": {
      const base = realAverage > 0 ? realAverage : 80;
      const boost = 1.05 + r * 0.1;
      return Math.round(base * boost);
    }
  }
}

export async function getLeaderboard(
  familyId: string,
  currentStudentId: string | null,
): Promise<LeaderboardRow[]> {
  const supabase = await createClient();

  const { data: students } = await supabase
    .from("users")
    .select("id, display_name")
    .eq("family_id", familyId)
    .eq("role", "student");

  const { data: ledger } = await supabase
    .from("points_ledger")
    .select("student_id, points")
    .eq("family_id", familyId);

  const totalsByStudent = new Map<string, number>();
  for (const row of ledger ?? []) {
    totalsByStudent.set(
      row.student_id,
      (totalsByStudent.get(row.student_id) ?? 0) + row.points,
    );
  }

  const realRows: LeaderboardRow[] = (students ?? []).map((s) => ({
    displayName: s.display_name,
    points: totalsByStudent.get(s.id) ?? 0,
    isFictional: false,
    isSelf: s.id === currentStudentId,
  }));

  const realAverage =
    realRows.length > 0
      ? realRows.reduce((sum, r) => sum + r.points, 0) / realRows.length
      : 0;

  const weekKey = isoWeekKey(new Date());
  const fictionalRows: LeaderboardRow[] = ARCHETYPES.map((a) => ({
    displayName: a.name,
    points: fictionalScore(a.name, a.kind, weekKey, realAverage),
    isFictional: true,
    isSelf: false,
  }));

  return [...realRows, ...fictionalRows].sort((a, b) => b.points - a.points);
}
