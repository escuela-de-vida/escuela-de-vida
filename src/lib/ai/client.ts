import { GoogleGenAI } from "@google/genai";

let client: GoogleGenAI | null | undefined;

/**
 * Devuelve null (en vez de lanzar) si falta GEMINI_API_KEY, para que toda
 * evaluación IA pueda degradarse a "pendiente de revisión manual" en vez de
 * romper el flujo del alumno (sección 8.2, fase 6).
 */
export function getGeminiClient(): GoogleGenAI | null {
  if (client !== undefined) return client;
  const apiKey = process.env.GEMINI_API_KEY;
  client = apiKey ? new GoogleGenAI({ apiKey }) : null;
  return client;
}

export const AI_MODEL = "gemini-3.6-flash";

/**
 * Pide a Gemini un objeto JSON estructurado (responseMimeType: json) y lo
 * parsea. Devuelve null si no hay cliente configurado o si la respuesta no
 * es JSON válido — el llamador siempre debe poder caer a evaluación manual.
 */
export async function evaluateAsJson<T>(params: {
  system: string;
  prompt: string;
  images?: { mediaType: string; data: string }[];
}): Promise<T | null> {
  const ai = getGeminiClient();
  if (!ai) return null;

  const parts: (
    | { text: string }
    | { inlineData: { mimeType: string; data: string } }
  )[] = [];
  for (const image of params.images ?? []) {
    parts.push({ inlineData: { mimeType: image.mediaType, data: image.data } });
  }
  parts.push({ text: params.prompt });

  try {
    const response = await ai.models.generateContent({
      model: AI_MODEL,
      contents: [{ role: "user", parts }],
      config: {
        systemInstruction: params.system,
        responseMimeType: "application/json",
      },
    });

    const text = response.text;
    if (!text) return null;
    return JSON.parse(text) as T;
  } catch (err) {
    console.error("evaluateAsJson error:", err);
    return null;
  }
}
