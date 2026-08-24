import { evaluateAsJson } from "./client";

export type ReadingEvaluation = {
  comprension: number;
  pensamiento_critico: number;
  esfuerzo: number;
  feedback: string;
  percentage: number;
};

const SYSTEM = `Evaluás reseñas de lectura de un chico de 11-12 años que
está en un programa de homeschooling gamificado. Tu rol es de mentor cálido,
nunca de examinador estricto. Reglas obligatorias:
- Priorizá esfuerzo y honestidad por sobre "corrección" literaria.
- Nunca compares con otros chicos ni pongas puntaje bajo por una reflexión
  breve pero genuina.
- El feedback siempre suma: 1 cosa positiva concreta primero.
- Nunca sugieras que el valor del chico depende de este puntaje.
- Respondé ÚNICAMENTE con un objeto JSON, sin texto alrededor.`;

/**
 * Rúbrica de sección 7.2: comprensión, pensamiento crítico, esfuerzo (0-25
 * cada uno, caligrafía se omite porque la reseña es texto tipeado). Devuelve
 * null si no hay GEMINI_API_KEY configurada — el llamador debe caer a
 * revisión manual del admin en ese caso.
 */
export async function evaluateReadingReview(params: {
  bookTitle: string;
  reviewText: string;
}): Promise<ReadingEvaluation | null> {
  const result = await evaluateAsJson<{
    comprension: number;
    pensamiento_critico: number;
    esfuerzo: number;
    feedback: string;
  }>({
    system: SYSTEM,
    prompt: `Libro: "${params.bookTitle}"

Reseña del alumno:
"""
${params.reviewText}
"""

Evaluá con esta rúbrica, cada criterio de 0 a 25:
- comprension: ¿entendió la trama/idea central?
- pensamiento_critico: ¿hay opinión propia, no solo resumen?
- esfuerzo: ¿se nota que le dedicó tiempo, más allá de la extensión?

Devolvé JSON: {"comprension": N, "pensamiento_critico": N, "esfuerzo": N, "feedback": "2-3 frases cálidas, 1 cosa positiva + 1 sugerencia"}`,
  });

  if (!result) return null;

  const total = result.comprension + result.pensamiento_critico + result.esfuerzo;
  const percentage = Math.round((total / 75) * 100);

  return { ...result, percentage };
}
