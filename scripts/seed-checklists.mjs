#!/usr/bin/env node
// Sesión de ajustes — checklist real de Higiene y Cuerpo (sección 4.2),
// con el detalle que dio la familia: cepillado AM/PM, uñas miércoles y
// domingo, oídos 3x/semana después de la ducha, piojos semanal, ducha
// diaria; flexiones/sentadillas/abdominales como bloques propios de Cuerpo.
//
// Idempotente por (task_template_id, label): upsert.
//
// Uso: node scripts/seed-checklists.mjs <family_id>

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
  console.error("Uso: node scripts/seed-checklists.mjs <family_id>");
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

// 0 = domingo … 6 = sábado
const CHECKLISTS = {
  Higiene: [
    ["Cepillado de dientes (mañana)", 2, 2, null],
    ["Cepillado de dientes (noche)", 2, 2, null],
    ["Ducha", 3, 5, null],
    ["Uñas", 3, 5, [3, 0]],
    ["Oídos (después de la ducha)", 2, 3, [1, 3, 5]],
    ["Hilo dental", 2, 2, [2, 4, 6]],
    ["Revisión de piojos", 3, 5, [0]],
  ],
  Cuerpo: [
    ["Flexiones de brazos (con rodillas apoyadas)", 5, 5, null],
    ["Sentadillas", 5, 5, null],
    ["Abdominales", 5, 5, null],
  ],
};

async function main() {
  const templates = await rest("GET", "task_templates", {
    query: `?family_id=eq.${FAMILY_ID}&select=id,title&title=in.(${Object.keys(CHECKLISTS).map((t) => `"${t}"`).join(",")})`,
  });
  const templateByTitle = new Map(templates.map((t) => [t.title, t.id]));

  const existing = await rest("GET", "task_checklist_items", {
    query: `?family_id=eq.${FAMILY_ID}&select=id,task_template_id,label`,
  });
  const existingByKey = new Map(
    existing.map((i) => [`${i.task_template_id}::${i.label}`, i.id]),
  );

  for (const [taskTitle, items] of Object.entries(CHECKLISTS)) {
    const task_template_id = templateByTitle.get(taskTitle);
    if (!task_template_id) {
      console.warn(`  ! tarea no encontrada: ${taskTitle}`);
      continue;
    }
    let order_index = 0;
    for (const [label, points, duration_minutes, recurrence_days] of items) {
      const key = `${task_template_id}::${label}`;
      const body = {
        family_id: FAMILY_ID,
        task_template_id,
        label,
        points,
        duration_minutes,
        recurrence_days,
        order_index: order_index++,
        active: true,
      };
      const existingId = existingByKey.get(key);
      if (existingId) {
        await rest("PATCH", "task_checklist_items", {
          query: `?id=eq.${existingId}`,
          body,
        });
        console.log(`  ~ actualizado: ${taskTitle} · ${label}`);
      } else {
        await rest("POST", "task_checklist_items", { body });
        console.log(`  + item: ${taskTitle} · ${label}`);
      }
    }
  }
  console.log("Listo.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
