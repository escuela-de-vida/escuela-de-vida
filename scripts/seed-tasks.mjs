#!/usr/bin/env node
// Fase 3/4 — siembra las tareas recurrentes iniciales del heatmap (tabla de
// la sección 4.2): los ~14 bloques diarios fijos más un puñado de bloques
// semanales/2-3x-por-semana para poblar también las vistas Semana/Mes.
// No incluye materias con progresión propia (Mente, Lectura, Geografía,
// Escritura Creativa) — esas viven en subject_modules, un sistema aparte
// del heatmap de tareas. Tampoco incluye hábitos "oportunistas" (ej. Ayudar
// a alguien) porque el motor de tareas no los auto-genera por diseño.
//
// Idempotente por (family_id, title): no duplica si se vuelve a correr.
//
// Uso: node scripts/seed-tasks.mjs <family_id>

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

const FAMILY_ID = process.argv[2];
if (!FAMILY_ID) {
  console.error("Uso: node scripts/seed-tasks.mjs <family_id>");
  process.exit(1);
}

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

// [categorySlug, title, description, points_base, duration_minutes, recurrence, focus_batch_required]
const TASKS = [
  // --- Diarias (sección 4.2, filas 1-27) ---
  ["cuerpo", "Cuerpo", "Movimiento físico del día — el deporte o rutina que ya practiques.", 15, 45, "Diaria", true],
  ["higiene", "Higiene", "Rutina de cuidado personal y del espacio propio.", 5, 15, "Diaria", false],
  ["matematicas", "Matemáticas", "Un desafío de matemáticas: explicación simple + ejemplo + reto.", 15, 45, "Diaria", true],
  ["entrenamiento-canino", "Entrenamiento canino", "Práctica de comandos con la mascota familiar.", 10, 15, "Diaria", true],
  ["computacion", "Computación", "Sesión del track elegido (programación o modelado 3D).", 15, 45, "Diaria", true],
  ["comunicacion", "Mecanografía y dictado", "Dictado libre — medimos palabras por minuto y precisión.", 5, 15, "Diaria", true],
  ["mente", "Meditar", "10-15 minutos de respiración guiada o meditación.", 5, 15, "Diaria", true],
  ["mente", "Descansar", "Espacio de descanso consciente en el día.", 5, null, "Diaria", false],
  ["mente", "3 líneas estoicas", "Journaling corto: qué pude controlar, qué me costó, qué agradezco.", 5, 10, "Diaria", false],
  ["vida-practica", "Tareas del hogar", "Responsabilidades domésticas del día.", 10, 25, "Diaria", false],
  ["creatividad", "Tiempo de arte libre", "Espacio creativo libre — dibujo, música, lo que elijas.", 10, 25, "Diaria", true],

  // --- 2-3x/semana ---
  ["historia", "Historia", "Contexto histórico ligado al viaje anual y a hitos universales.", 15, 45, "2-3x/semana", true],
  ["tai-chi", "Tai chi", "Secuencia guiada de tai chi.", 10, 25, "2-3x/semana", true],

  // --- 2x/semana ---
  ["geografia", "Geografía", "Minijuego o desafío de geografía del nivel actual.", 10, 25, "2x/semana", true],

  // --- Semanales ---
  ["negocios", "Negocios", "Avance del mini-emprendimiento o del Laboratorio de Mercados.", 15, 45, "Semanal", true],
  ["cocina", "Cocina", "Receta nueva documentada con foto del plato.", 20, 60, "Semanal", true],
  ["pintura", "Pintura", "Ejercicio guiado de técnica pictórica.", 15, 45, "Semanal", true],
  ["comunidad-y-mundo", "Contactar al mundo", "Actividad semanal de comunidad y mundo.", 10, 20, "Semanal", true],
  ["vida-practica", "Feedback al colegio", "Ritual familiar semanal de feedback.", 5, 15, "Semanal", false],
];

async function main() {
  const categories = await rest("GET", "categories", {
    query: `?family_id=eq.${FAMILY_ID}&select=id,slug`,
  });
  const categoryBySlug = new Map(categories.map((c) => [c.slug, c.id]));

  const existing = await rest("GET", "task_templates", {
    query: `?family_id=eq.${FAMILY_ID}&select=title`,
  });
  const existingTitles = new Set(existing.map((t) => t.title));

  for (const [slug, title, description, points_base, duration_minutes, recurrence, focus_batch_required] of TASKS) {
    if (existingTitles.has(title)) continue;
    const category_id = categoryBySlug.get(slug);
    if (!category_id) {
      console.warn(`  ! categoría no encontrada: ${slug} (salteando "${title}")`);
      continue;
    }
    await rest("POST", "task_templates", {
      body: {
        family_id: FAMILY_ID,
        category_id,
        title,
        description,
        points_base,
        duration_minutes,
        recurrence,
        focus_batch_required,
        active: true,
      },
    });
    console.log(`  + tarea: ${title} (${recurrence})`);
  }
  console.log("Listo.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
