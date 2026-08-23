#!/usr/bin/env node
// Fase 5 — siembra el catálogo global de 20 insignias (Anexo 14.4).
// family_id null = plantilla compartida por todas las familias, no hace
// falta re-sembrar por familia. Idempotente por nombre.
//
// Uso: node scripts/seed-badges.mjs

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const env = Object.fromEntries(
  readFileSync(path.join(__dirname, "..", ".env.local"), "utf8")
    .split("\n")
    .filter((l) => l.includes("=") && !l.trim().startsWith("#"))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    }),
);

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

async function rest(method, table, { query = "", body } = {}) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}${query}`, {
    method,
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`${method} ${table} ${res.status}: ${await res.text()}`);
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

const BADGES = [
  ["Mente en Calma", "7 días seguidos de meditación/journaling", "🧘"],
  ["Guerrero del Sueño", "14 días de buen descanso", "😴"],
  ["Energía Total", "30 sesiones de actividad física", "💪"],
  ["Devorador de Libros", "10 libros/resúmenes leídos", "📚"],
  ["Científico en Acción", "3 proyectos de ciencia", "🔬"],
  ["Artista en Ascenso", "5 obras subidas", "🎨"],
  ["Chef de la Casa", "10 recetas documentadas", "👨‍🍳"],
  ["Manos a la Obra", "5 tareas domésticas completadas", "🛠️"],
  ["Orador Nato", "3 presentaciones orales", "🎤"],
  ["Bilingüe en Marcha", "Actividades en el segundo idioma", "🌍"],
  ["Hermano Solidario", "5 veces ayudando al hermano", "🤝"],
  ["Voz de la Familia", "3 reuniones familiares", "🗣️"],
  ["Racha de Hierro", "30 días de racha sin romper", "🔥"],
  ["Maestro de la Constancia", "90% de tareas semanales, 4 semanas seguidas", "🏆"],
  ["Explorador Completo", "1 insignia en cada una de las 7 categorías", "🗺️"],
  ["Segunda Oportunidad", "5 tareas completadas dentro de la ventana de gracia", "🔄"],
  ["Nivel Superado", "Alcanzar un nuevo rango", "⬆️"],
  ["Proyecto del Mes", "Completar un proyecto de 20-40 pts", "📌"],
  ["Cuerpo y Mente", "Streaks activos en ambas categorías por 2 semanas", "⚖️"],
  ["Espíritu de Equipo", "Actividad colaborativa entre hermanos", "🤜🤛"],
].map(([name, description, icon]) => ({ name, description, icon, criteria: {} }));

async function main() {
  const existing = await rest("GET", "badges", {
    query: "?family_id=is.null&select=name",
  });
  const existingNames = new Set((existing ?? []).map((b) => b.name));

  for (const badge of BADGES) {
    if (existingNames.has(badge.name)) continue;
    await rest("POST", "badges", { body: badge });
    console.log(`  + insignia: ${badge.name}`);
  }
  console.log("Listo.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
