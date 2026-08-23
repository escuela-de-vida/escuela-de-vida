// "Rangos de Explorador" — sección 6.3.
export type Rank = {
  name: string;
  emoji: string;
  min: number;
  max: number | null;
};

export const RANKS: Rank[] = [
  { name: "Semilla", emoji: "🌱", min: 0, max: 199 },
  { name: "Aprendiz de Ruta", emoji: "🧭", min: 200, max: 499 },
  { name: "Explorador", emoji: "🗺️", min: 500, max: 999 },
  { name: "Trotamundos", emoji: "🎒", min: 1000, max: 1799 },
  { name: "Guía de Expedición", emoji: "🔥", min: 1800, max: 2799 },
  { name: "Maestro de Vida", emoji: "⭐", min: 2800, max: 4000 },
  { name: "Leyenda de la Escuela", emoji: "🏔️", min: 4001, max: null },
];

export function getRank(points: number): Rank {
  return (
    RANKS.find((r) => points >= r.min && (r.max === null || points <= r.max)) ??
    RANKS[0]
  );
}

export function getNextRank(points: number): Rank | null {
  const currentIndex = RANKS.findIndex((r) => r === getRank(points));
  return RANKS[currentIndex + 1] ?? null;
}
