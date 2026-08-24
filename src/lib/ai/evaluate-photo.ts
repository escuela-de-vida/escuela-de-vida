import { evaluateAsJson } from "./client";

export type PhotoEvaluation = {
  genuine: boolean;
  feedback: string;
};

const SYSTEM = `Mirás una foto que un chico de 11-12 años subió como evidencia
de haber hecho una actividad de su programa de homeschooling gamificado. Sos
un mentor cálido, nunca un examinador. Reglas obligatorias:
- Los puntos de esta tarea NO dependen de esta evaluación — ya se calcularon
  aparte. Tu único trabajo es dar feedback breve y cálido, y avisar si la
  foto claramente no corresponde a la consigna (para que un adulto la mire).
- "genuine" en false SOLO si la foto es obviamente irrelevante, en blanco, o
  no muestra ninguna evidencia de la actividad — nunca por baja calidad de
  foto, mala luz, o que "podría ser mejor".
- Nunca compares con otros chicos. Nunca sugieras que el valor del chico
  depende de esto.
- Respondé ÚNICAMENTE con un objeto JSON, sin texto alrededor.`;

/**
 * Evaluación de foto de evidencia — cualitativa, nunca modifica puntos (los
 * define el motor de tareas por puntualidad, sección 6.4). Sirve para dar
 * feedback cálido al alumno y una señal de "revisar" para el admin.
 */
export async function evaluateTaskPhoto(params: {
  taskTitle: string;
  taskDescription: string | null;
  imageBase64: string;
  imageMimeType: string;
}): Promise<PhotoEvaluation | null> {
  return evaluateAsJson<PhotoEvaluation>({
    system: SYSTEM,
    prompt: `Actividad: "${params.taskTitle}"${params.taskDescription ? `\nDescripción: ${params.taskDescription}` : ""}

Mirá la foto adjunta y devolvé JSON: {"genuine": true|false, "feedback": "1-2 frases cálidas sobre lo que se ve en la foto"}`,
    images: [{ mediaType: params.imageMimeType, data: params.imageBase64 }],
  });
}
