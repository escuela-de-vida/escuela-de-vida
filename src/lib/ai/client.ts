import Anthropic from "@anthropic-ai/sdk";

let client: Anthropic | null | undefined;

/**
 * Devuelve null (en vez de lanzar) si falta ANTHROPIC_API_KEY, para que toda
 * evaluación IA pueda degradarse a "pendiente de revisión manual" en vez de
 * romper el flujo del alumno (sección 8.2, fase 6).
 */
export function getAnthropicClient(): Anthropic | null {
  if (client !== undefined) return client;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  client = apiKey ? new Anthropic({ apiKey }) : null;
  return client;
}

export const AI_MODEL = "claude-sonnet-4-5";

/**
 * Pide a Claude un bloque de texto y lo parsea como JSON. Devuelve null si no
 * hay cliente configurado o si la respuesta no es JSON válido (nunca lanza:
 * el llamador siempre debe poder caer a evaluación manual).
 */
export async function evaluateAsJson<T>(params: {
  system: string;
  prompt: string;
  images?: { mediaType: string; data: string }[];
}): Promise<T | null> {
  const anthropic = getAnthropicClient();
  if (!anthropic) return null;

  const content: Anthropic.MessageParam["content"] = [];
  for (const image of params.images ?? []) {
    content.push({
      type: "image",
      source: {
        type: "base64",
        media_type: image.mediaType as
          | "image/jpeg"
          | "image/png"
          | "image/gif"
          | "image/webp",
        data: image.data,
      },
    });
  }
  content.push({ type: "text", text: params.prompt });

  try {
    const message = await anthropic.messages.create({
      model: AI_MODEL,
      max_tokens: 1024,
      system: params.system,
      messages: [{ role: "user", content }],
    });

    const block = message.content.find((b) => b.type === "text");
    if (!block || block.type !== "text") return null;

    const match = block.text.match(/\{[\s\S]*\}/);
    if (!match) return null;
    return JSON.parse(match[0]) as T;
  } catch (err) {
    console.error("evaluateAsJson error:", err);
    return null;
  }
}
