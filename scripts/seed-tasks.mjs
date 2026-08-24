#!/usr/bin/env node
// Fase 3/4 — siembra las tareas recurrentes iniciales del heatmap (tabla de
// la sección 4.2): los ~14 bloques diarios fijos más un puñado de bloques
// semanales/2-3x-por-semana para poblar también las vistas Semana/Mes.
// No incluye materias con progresión propia (Mente, Lectura, Geografía,
// Escritura Creativa) — esas viven en subject_modules, un sistema aparte
// del heatmap de tareas. Tampoco incluye hábitos "oportunistas" (ej. Ayudar
// a alguien) porque el motor de tareas no los auto-genera por diseño.
//
// Sesión de ajustes (2026-08-24): antes, todas las tareas no-diarias caían
// el mismo día (el motor anclaba cada tipo de recurrencia a un día fijo
// global) — recurrence_days reparte cada una en días distintos. También se
// mejoraron las descripciones para que el batch de foco muestre una guía
// real, no un timer vacío.
//
// Upsert por (family_id, title): actualiza si ya existe, para poder
// re-correr este script tras ajustar el reparto sin duplicar filas.
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

// 0 = domingo … 6 = sábado (mismo criterio que Date#getDay())
// [categorySlug, title, description, points_base, duration_minutes, recurrence, focus_batch_required, recurrence_days]
const TASKS = [
  // --- Diarias (sección 4.2, filas 1-27) ---
  ["cuerpo", "Cuerpo", "Rutina de calistenia con el peso del cuerpo: 3 series de sentadillas, flexiones (de rodillas si hace falta) y abdominales, a tu ritmo. Si hoy hacés otra actividad física (bici, deporte, lo que sea), también cuenta.", 15, 45, "Diaria", true, null],
  ["higiene", "Higiene", "Ducha, cepillado de dientes (mañana y noche) y lo que corresponda hoy — uñas, oídos o hilo dental según el día.", 5, 15, "Diaria", false, null],
  ["matematicas", "Matemáticas", "Un desafío de matemáticas: explicación simple + ejemplo + reto.", 15, 45, "Diaria", true, null],
  ["entrenamiento-canino", "Entrenamiento canino", "Practicá un comando con tu mascota (sentado, quieto, traer la pelota) hasta que lo haga bien varias veces seguidas.", 10, 15, "Diaria", true, null],
  ["computacion", "Computación", "Sesión del track elegido (programación o modelado 3D).", 15, 45, "Diaria", true, null],
  ["comunicacion", "Mecanografía y dictado", "Dictado libre — medimos palabras por minuto y precisión.", 5, 15, "Diaria", true, null],
  ["mente", "Meditar", "10-15 minutos de respiración guiada o meditación.", 5, 15, "Diaria", true, null],
  ["mente", "Descansar", "Un ratito sin pantallas ni obligaciones — leer, estar tirado, lo que te recargue.", 5, null, "Diaria", false, null],
  ["mente", "3 líneas estoicas", "Journaling corto: qué pude controlar, qué me costó, qué agradezco.", 5, 10, "Diaria", false, null],
  ["vida-practica", "Tareas del hogar", "Ayudá con algo de la casa: poner la mesa, ordenar tu cuarto, sacar la basura — lo que haga falta hoy.", 10, 25, "Diaria", false, null],
  ["creatividad", "Tiempo de arte libre", "Espacio creativo libre — dibujo, música, lo que elijas.", 10, 25, "Diaria", true, null],

  // --- 2-3x/semana (repartidas en días distintos entre sí) ---
  ["historia", "Historia", "Contexto histórico ligado al viaje anual y a hitos universales.", 15, 45, "2-3x/semana", true, [1, 3, 5]],
  ["tai-chi", "Tai chi", "Secuencia guiada de tai chi.", 10, 25, "2-3x/semana", true, [2, 4, 6]],

  // --- 2x/semana ---
  ["geografia", "Geografía", "Minijuego o desafío de geografía del nivel actual.", 10, 25, "2x/semana", true, [2, 4]],

  // --- Semanales (un día distinto cada una) ---
  ["negocios", "Negocios", "Avance del mini-emprendimiento o del Laboratorio de Mercados.", 15, 45, "Semanal", true, [6]],
  ["cocina", "Cocina", "Receta nueva documentada con foto del plato.", 20, 60, "Semanal", true, [0]],
  ["pintura", "Pintura", "Ejercicio guiado de técnica pictórica.", 15, 45, "Semanal", true, [3]],
  ["comunidad-y-mundo", "Contactar al mundo", "Actividad semanal de comunidad y mundo.", 10, 20, "Semanal", true, [4]],
  ["vida-practica", "Feedback al colegio", "Ritual familiar semanal de feedback.", 5, 15, "Semanal", false, [5]],
];

async function main() {
  const categories = await rest("GET", "categories", {
    query: `?family_id=eq.${FAMILY_ID}&select=id,slug`,
  });
  const categoryBySlug = new Map(categories.map((c) => [c.slug, c.id]));

  const existing = await rest("GET", "task_templates", {
    query: `?family_id=eq.${FAMILY_ID}&select=id,title`,
  });
  const existingByTitle = new Map(existing.map((t) => [t.title, t.id]));

  for (const [
    slug,
    title,
    description,
    points_base,
    duration_minutes,
    recurrence,
    focus_batch_required,
    recurrence_days,
  ] of TASKS) {
    const category_id = categoryBySlug.get(slug);
    if (!category_id) {
      console.warn(`  ! categoría no encontrada: ${slug} (salteando "${title}")`);
      continue;
    }
    const body = {
      family_id: FAMILY_ID,
      category_id,
      title,
      description,
      points_base,
      duration_minutes,
      recurrence,
      recurrence_days,
      focus_batch_required,
      active: true,
    };

    const existingId = existingByTitle.get(title);
    if (existingId) {
      await rest("PATCH", "task_templates", {
        query: `?id=eq.${existingId}`,
        body,
      });
      console.log(`  ~ actualizada: ${title} (${recurrence}${recurrence_days ? ` · días ${recurrence_days.join(",")}` : ""})`);
    } else {
      await rest("POST", "task_templates", { body });
      console.log(`  + tarea: ${title} (${recurrence}${recurrence_days ? ` · días ${recurrence_days.join(",")}` : ""})`);
    }
  }
  console.log("Listo.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
