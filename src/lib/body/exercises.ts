// Catálogo de calistenia con peso corporal — sección 7.10 (Cuerpo) del
// prompt maestro. 6 familias de ejercicio (una por grupo muscular), cada
// una con 3 niveles (facil/estandar/dificil) para poder adaptarse a la
// edad y el peso de cada alumno sin necesitar equipamiento de gimnasio.

export type MuscleGroup = "pecho" | "espalda" | "piernas" | "hombros" | "brazos" | "core";
export type Tier = "facil" | "estandar" | "dificil";
export type ExerciseFamily = "pushup" | "row" | "squat" | "pike" | "dip" | "plank";

export type Exercise = {
  id: string;
  family: ExerciseFamily;
  tier: Tier;
  muscleGroup: MuscleGroup;
  name: string;
  musclesWorked: string;
  instructions: string[];
  mode: "reps" | "hold";
  target: number; // repeticiones o segundos según `mode`
};

const REPS: Record<Tier, number> = { facil: 8, estandar: 10, dificil: 12 };
const HOLD_SECONDS: Record<Tier, number> = { facil: 15, estandar: 20, dificil: 30 };

function reps(tier: Tier) {
  return REPS[tier];
}
function hold(tier: Tier) {
  return HOLD_SECONDS[tier];
}

export const EXERCISES: Exercise[] = [
  // Pecho — familia "pushup"
  {
    id: "pushup-facil",
    family: "pushup",
    tier: "facil",
    muscleGroup: "pecho",
    name: "Flexiones inclinadas",
    musclesWorked: "Pecho, hombros, tríceps",
    instructions: [
      "Apoyá las manos en una silla o mesa baja, cuerpo en línea recta.",
      "Bajá el pecho hacia el apoyo doblando los codos, sin hundir la espalda.",
    ],
    mode: "reps",
    target: reps("facil"),
  },
  {
    id: "pushup-estandar",
    family: "pushup",
    tier: "estandar",
    muscleGroup: "pecho",
    name: "Flexiones de rodillas",
    musclesWorked: "Pecho, hombros, tríceps",
    instructions: [
      "Rodillas apoyadas en el piso, manos un poco más anchas que los hombros.",
      "Bajá controlado hasta casi tocar el piso con el pecho y volvé a subir.",
    ],
    mode: "reps",
    target: reps("estandar"),
  },
  {
    id: "pushup-dificil",
    family: "pushup",
    tier: "dificil",
    muscleGroup: "pecho",
    name: "Flexiones completas",
    musclesWorked: "Pecho, hombros, tríceps",
    instructions: [
      "Cuerpo recto apoyado en manos y puntas de pie.",
      "Bajá hasta casi tocar el piso con el pecho, manteniendo el core firme.",
    ],
    mode: "reps",
    target: reps("dificil"),
  },

  // Espalda — familia "row"
  {
    id: "row-facil",
    family: "row",
    tier: "facil",
    muscleGroup: "espalda",
    name: "Superman",
    musclesWorked: "Espalda baja, glúteos",
    instructions: [
      "Acostado boca abajo, brazos estirados adelante.",
      "Levantá brazos y piernas del piso a la vez y sostené un segundo arriba.",
    ],
    mode: "reps",
    target: reps("facil"),
  },
  {
    id: "row-estandar",
    family: "row",
    tier: "estandar",
    muscleGroup: "espalda",
    name: "Remo invertido en mesa",
    musclesWorked: "Espalda, bíceps",
    instructions: [
      "Acostado bajo una mesa firme, agarrá el borde con las dos manos.",
      "Tirá del pecho hacia la mesa manteniendo el cuerpo recto, y bajá controlado.",
    ],
    mode: "reps",
    target: reps("estandar"),
  },
  {
    id: "row-dificil",
    family: "row",
    tier: "dificil",
    muscleGroup: "espalda",
    name: "Remo invertido, pies elevados",
    musclesWorked: "Espalda, bíceps",
    instructions: [
      "Igual que el remo en mesa, pero con los pies apoyados sobre una silla.",
      "Tirá del pecho hacia el borde de la mesa y bajá controlado.",
    ],
    mode: "reps",
    target: reps("dificil"),
  },

  // Piernas — familia "squat"
  {
    id: "squat-facil",
    family: "squat",
    tier: "facil",
    muscleGroup: "piernas",
    name: "Sentadilla asistida",
    musclesWorked: "Piernas, glúteos",
    instructions: [
      "Parado de espaldas a una silla, pies al ancho de los hombros.",
      "Bajá como si te fueras a sentar, tocá apenas la silla y volvé a subir.",
    ],
    mode: "reps",
    target: reps("facil"),
  },
  {
    id: "squat-estandar",
    family: "squat",
    tier: "estandar",
    muscleGroup: "piernas",
    name: "Sentadilla libre",
    musclesWorked: "Piernas, glúteos",
    instructions: [
      "Pies al ancho de los hombros, pecho arriba.",
      "Bajá las caderas hacia atrás y abajo hasta los muslos paralelos al piso.",
    ],
    mode: "reps",
    target: reps("estandar"),
  },
  {
    id: "squat-dificil",
    family: "squat",
    tier: "dificil",
    muscleGroup: "piernas",
    name: "Zancadas alternadas",
    musclesWorked: "Piernas, glúteos, equilibrio",
    instructions: [
      "Un paso largo adelante, bajá la rodilla trasera casi hasta el piso.",
      "Volvé al centro y alterná de pierna cada repetición.",
    ],
    mode: "reps",
    target: reps("dificil"),
  },

  // Hombros — familia "pike"
  {
    id: "pike-facil",
    family: "pike",
    tier: "facil",
    muscleGroup: "hombros",
    name: "Flexión pica apoyada",
    musclesWorked: "Hombros, tríceps",
    instructions: [
      "Manos apoyadas en una silla, caderas bien arriba formando una V invertida.",
      "Bajá la cabeza hacia las manos doblando los codos, y subí.",
    ],
    mode: "reps",
    target: reps("facil"),
  },
  {
    id: "pike-estandar",
    family: "pike",
    tier: "estandar",
    muscleGroup: "hombros",
    name: "Flexión pica",
    musclesWorked: "Hombros, tríceps",
    instructions: [
      "Manos y pies en el piso, caderas arriba formando una V invertida.",
      "Bajá la cabeza hacia el piso doblando los codos, y subí.",
    ],
    mode: "reps",
    target: reps("estandar"),
  },
  {
    id: "pike-dificil",
    family: "pike",
    tier: "dificil",
    muscleGroup: "hombros",
    name: "Flexión pica, pies elevados",
    musclesWorked: "Hombros, tríceps",
    instructions: [
      "Igual que la flexión pica, con los pies apoyados sobre una silla.",
      "Bajá la cabeza hacia el piso doblando los codos, y subí.",
    ],
    mode: "reps",
    target: reps("dificil"),
  },

  // Brazos — familia "dip"
  {
    id: "dip-facil",
    family: "dip",
    tier: "facil",
    muscleGroup: "brazos",
    name: "Fondos de tríceps, rodillas dobladas",
    musclesWorked: "Tríceps, hombros",
    instructions: [
      "Sentado en el borde de una silla, manos a los costados de la cadera.",
      "Deslizá el cuerpo adelante y bajá doblando los codos hacia atrás.",
    ],
    mode: "reps",
    target: reps("facil"),
  },
  {
    id: "dip-estandar",
    family: "dip",
    tier: "estandar",
    muscleGroup: "brazos",
    name: "Fondos de tríceps",
    musclesWorked: "Tríceps, hombros",
    instructions: [
      "Igual que el anterior, con las piernas estiradas y solo los talones apoyados.",
      "Bajá doblando los codos hacia atrás y volvé a subir.",
    ],
    mode: "reps",
    target: reps("estandar"),
  },
  {
    id: "dip-dificil",
    family: "dip",
    tier: "dificil",
    muscleGroup: "brazos",
    name: "Fondos de tríceps, pies elevados",
    musclesWorked: "Tríceps, hombros",
    instructions: [
      "Manos en la silla detrás tuyo, pies apoyados sobre otra silla adelante.",
      "Bajá doblando los codos hacia atrás y volvé a subir.",
    ],
    mode: "reps",
    target: reps("dificil"),
  },

  // Core — familia "plank"
  {
    id: "plank-facil",
    family: "plank",
    tier: "facil",
    muscleGroup: "core",
    name: "Plancha de rodillas",
    musclesWorked: "Core, espalda baja",
    instructions: [
      "Antebrazos y rodillas en el piso, cuerpo en línea recta desde la cabeza.",
      "Sostené la posición sin hundir la cadera.",
    ],
    mode: "hold",
    target: hold("facil"),
  },
  {
    id: "plank-estandar",
    family: "plank",
    tier: "estandar",
    muscleGroup: "core",
    name: "Plancha completa",
    musclesWorked: "Core, espalda baja",
    instructions: [
      "Antebrazos y puntas de pie en el piso, cuerpo en línea recta.",
      "Sostené la posición apretando el abdomen, sin hundir la cadera.",
    ],
    mode: "hold",
    target: hold("estandar"),
  },
  {
    id: "plank-dificil",
    family: "plank",
    tier: "dificil",
    muscleGroup: "core",
    name: "Plancha con toques de hombro",
    musclesWorked: "Core, hombros, equilibrio",
    instructions: [
      "Plancha completa, pero con las manos apoyadas (no antebrazos).",
      "Tocá el hombro opuesto con una mano sin mover la cadera, alternando.",
    ],
    mode: "hold",
    target: hold("dificil"),
  },
];

const byFamilyAndTier = new Map(EXERCISES.map((e) => [`${e.family}-${e.tier}`, e]));

const FAMILY_BY_GROUP: Record<MuscleGroup, ExerciseFamily> = {
  pecho: "pushup",
  espalda: "row",
  piernas: "squat",
  hombros: "pike",
  brazos: "dip",
  core: "plank",
};

/**
 * Elige el nivel de dificultad según edad y peso. En calistenia con el
 * propio peso, cuanto más pesado el cuerpo, más exigentes son los
 * ejercicios de empuje relativos a esa edad — por eso el peso baja el
 * nivel y no lo sube. Peso de referencia aproximado por edad (percentil
 * medio OMS), no un estándar clínico.
 */
export function pickTier(ageYears: number, weightKg: number): Tier {
  const referenceWeight = 32 + (ageYears - 10) * 4.5;
  if (weightKg > referenceWeight * 1.15) return "facil";
  if (weightKg < referenceWeight * 0.9) return "dificil";
  return "estandar";
}

export function exerciseFor(group: MuscleGroup, tier: Tier): Exercise {
  const family = FAMILY_BY_GROUP[group];
  const exercise = byFamilyAndTier.get(`${family}-${tier}`);
  if (!exercise) throw new Error(`Ejercicio no encontrado: ${family}/${tier}`);
  return exercise;
}

export function getExerciseById(id: string): Exercise | null {
  return EXERCISES.find((e) => e.id === id) ?? null;
}
