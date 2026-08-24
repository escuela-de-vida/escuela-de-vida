import { evaluateAsJson } from "./client";

export type ModuleEvaluation = {
  scores: number[];
  feedback: string;
  percentage: number;
};

const SYSTEM = `Evaluás el trabajo de un chico de 11-12 años en un programa de
homeschooling gamificado. Sos un mentor cálido, nunca un examinador estricto.
Reglas obligatorias:
- Priorizá esfuerzo y honestidad por sobre "corrección" técnica o literaria.
- Nunca compares con otros chicos ni pongas puntaje bajo por una respuesta
  breve pero genuina — una reflexión corta y real vale más que una larga y
  vacía.
- El feedback siempre suma: empezá con 1 cosa positiva concreta.
- Nunca sugieras que el valor del chico depende de este puntaje.
- Si el criterio pide neutralidad (ej. "describe sin juzgar"), evalualo en
  serio: bajá el puntaje de ESE criterio si el texto usa lenguaje valorativo
  ("mejor/peor", "injusto"), pero no penalices el resto por eso.
- Respondé ÚNICAMENTE con un objeto JSON, sin texto alrededor.`;

/**
 * Evalúa texto libre de un módulo (Mente, Escritura Creativa, algunos de
 * Geografía) contra el rubric propio de ESE módulo — cada criterio se
 * puntúa 0-10, sin rúbricas hardcodeadas por materia. Devuelve null si no
 * hay proveedor de IA configurado — el llamador cae al puntaje base.
 */
export async function evaluateModuleText(params: {
  moduleTitle: string;
  instructions: string;
  rubric: string[];
  studentText: string;
}): Promise<ModuleEvaluation | null> {
  const result = await evaluateAsJson<{ scores: number[]; feedback: string }>({
    system: SYSTEM,
    prompt: `Módulo: "${params.moduleTitle}"

Consigna: ${params.instructions}

Respuesta del alumno:
"""
${params.studentText}
"""

Evaluá cada uno de estos criterios de 0 a 10, en este orden exacto:
${params.rubric.map((r, i) => `${i + 1}. ${r}`).join("\n")}

Devolvé JSON: {"scores": [n, n, ...] (un número por criterio, mismo orden), "feedback": "2-3 frases cálidas, 1 cosa positiva + 1 sugerencia"}`,
  });

  if (!result || !Array.isArray(result.scores) || result.scores.length === 0) {
    return null;
  }

  const avg = result.scores.reduce((sum, s) => sum + s, 0) / result.scores.length;
  const percentage = Math.round((avg / 10) * 100);

  return { scores: result.scores, feedback: result.feedback, percentage };
}
