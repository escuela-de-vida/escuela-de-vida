// Distribución semanal de la rutina de calistenia — sección 7.10 (Cuerpo).
// División por grupo muscular según cantidad de días/semana configurada
// por el admin (3 a 6), siguiendo prácticas estándar de entrenamiento:
// 3 días = cuerpo completo, 4 = tren superior/inferior, 5-6 = empuje/
// tracción/piernas. Cada bloque son 3 series del ejercicio elegido.

import { type Exercise, type MuscleGroup, exerciseFor, pickTier } from "./exercises";

export type DayType = "push" | "pull" | "legs" | "upper" | "lower" | "full";

export const DAY_TYPE_LABEL: Record<DayType, string> = {
  push: "Empuje (pecho, hombros, brazos)",
  pull: "Tracción (espalda, core)",
  legs: "Piernas",
  upper: "Tren superior",
  lower: "Tren inferior",
  full: "Cuerpo completo",
};

const MUSCLE_GROUPS_BY_DAY_TYPE: Record<DayType, MuscleGroup[]> = {
  push: ["pecho", "hombros", "brazos"],
  pull: ["espalda", "core"],
  legs: ["piernas", "core"],
  upper: ["pecho", "espalda", "hombros", "brazos"],
  lower: ["piernas", "core"],
  full: ["pecho", "espalda", "piernas", "core"],
};

// weekday: 0 = domingo … 6 = sábado, mismo criterio que el resto de la app.
const SPLITS: Record<number, { weekday: number; dayType: DayType }[]> = {
  3: [
    { weekday: 1, dayType: "full" },
    { weekday: 3, dayType: "full" },
    { weekday: 5, dayType: "full" },
  ],
  4: [
    { weekday: 1, dayType: "upper" },
    { weekday: 2, dayType: "lower" },
    { weekday: 4, dayType: "upper" },
    { weekday: 5, dayType: "lower" },
  ],
  5: [
    { weekday: 1, dayType: "push" },
    { weekday: 2, dayType: "pull" },
    { weekday: 3, dayType: "legs" },
    { weekday: 4, dayType: "upper" },
    { weekday: 5, dayType: "lower" },
  ],
  6: [
    { weekday: 1, dayType: "push" },
    { weekday: 2, dayType: "pull" },
    { weekday: 3, dayType: "legs" },
    { weekday: 4, dayType: "push" },
    { weekday: 5, dayType: "pull" },
    { weekday: 6, dayType: "legs" },
  ],
};

export const SETS_PER_SESSION = 3;

export type RoutineBlock = { exercise: Exercise };

export type BodyConfig = {
  weightKg: number | null;
  ageYears: number | null;
  daysPerWeek: number;
};

/** El plan completo de la semana (para mostrar el mapa Lun-Dom en el dashboard). */
export function getWeeklySplit(daysPerWeek: number): { weekday: number; dayType: DayType }[] {
  return SPLITS[daysPerWeek] ?? SPLITS[3];
}

export function getRoutineForDayType(
  dayType: DayType,
  config: BodyConfig,
): RoutineBlock[] {
  const tier = pickTier(config.ageYears ?? 11, config.weightKg ?? 40);
  return MUSCLE_GROUPS_BY_DAY_TYPE[dayType].map((group) => ({
    exercise: exerciseFor(group, tier),
  }));
}

/** null = día de descanso según la división configurada. */
export function getTodaysRoutine(
  config: BodyConfig,
  date: Date,
): { dayType: DayType; blocks: RoutineBlock[] } | null {
  const split = getWeeklySplit(config.daysPerWeek);
  const entry = split.find((d) => d.weekday === date.getDay());
  if (!entry) return null;
  return { dayType: entry.dayType, blocks: getRoutineForDayType(entry.dayType, config) };
}
