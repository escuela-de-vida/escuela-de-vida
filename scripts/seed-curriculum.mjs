#!/usr/bin/env node
// Fase 4 — siembra el currículo real (sección 7) para una familia dada.
// Idempotente: usa slug/título como clave natural, no duplica si se
// vuelve a correr. Usa la REST API de PostgREST directamente (fetch) en
// vez de @supabase/supabase-js para evitar el requisito de WebSocket
// nativo de su cliente Realtime en Node < 22.
//
// Uso: node scripts/seed-curriculum.mjs <family_id>

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, "..", ".env.local");
const env = Object.fromEntries(
  readFileSync(envPath, "utf8")
    .split("\n")
    .filter((l) => l.includes("=") && !l.trim().startsWith("#"))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    }),
);

const FAMILY_ID = process.argv[2];
if (!FAMILY_ID) {
  console.error("Uso: node scripts/seed-curriculum.mjs <family_id>");
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
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${method} ${table} ${res.status}: ${text}`);
  }
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

function slugify(text) {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// ============================================================================
// Categorías (materias) — sección 4.1/4.2/5.5. Colores tomados de
// globals.css (modo claro) para que coincidan con el heatmap.
// ============================================================================
const COLORS = {
  mente: "#8b5cf6",
  cuerpo: "#248a3d",
  conocimiento: "#0071e3",
  creatividad: "#d9720a",
  comunidad: "#b8860b",
  vidaPractica: "#a0522d",
  comunicacion: "#0a84a8",
};

const CATEGORIES = [
  { name: "Mente", color: COLORS.mente, order: 1 },
  { name: "Cuerpo", color: COLORS.cuerpo, order: 2 },
  { name: "Higiene", color: COLORS.vidaPractica, order: 3 },
  { name: "Comunidad y Mundo", color: COLORS.comunidad, order: 4 },
  { name: "Matemáticas", color: COLORS.conocimiento, order: 5 },
  { name: "Historia", color: COLORS.conocimiento, order: 6 },
  { name: "Creatividad", color: COLORS.creatividad, order: 7 },
  { name: "Negocios", color: COLORS.conocimiento, order: 8 },
  { name: "Cocina", color: COLORS.vidaPractica, order: 9 },
  { name: "Pintura", color: COLORS.creatividad, order: 10 },
  { name: "Entrenamiento canino", color: COLORS.vidaPractica, order: 11 },
  { name: "Tai chi", color: COLORS.cuerpo, order: 12 },
  { name: "Computación", color: COLORS.conocimiento, order: 13 },
  { name: "Public Speaking", color: COLORS.comunicacion, order: 14 },
  { name: "Lectura", color: COLORS.conocimiento, order: 15 },
  { name: "Geografía", color: COLORS.conocimiento, order: 16 },
  { name: "Escritura Creativa", color: COLORS.creatividad, order: 17 },
  { name: "Vida Práctica", color: COLORS.vidaPractica, order: 18 },
  { name: "Comunicación", color: COLORS.comunicacion, order: 19 },
];

// ============================================================================
// Mente — sección 7.1 (10 módulos)
// ============================================================================
const MENTE_RUBRIC = [
  "Profundidad de la reflexión",
  "Conexión con el concepto enseñado",
  "Evidencia de pensamiento propio",
];

const MENTE_MODULES = [
  {
    title: "La rana del día",
    description: "Hacer primero lo que más cuesta (Brian Tracy).",
    points: 15,
    instructions:
      "Elegí la tarea del día que menos ganas te da hacer — tu \"rana\". Hacela primero, antes que cualquier otra cosa. Después contanos: ¿cuál era tu rana hoy? ¿Cómo te sentiste antes y después de hacerla?",
  },
  {
    title: "Metas que se pueden tocar",
    description: "Metas SMART simplificadas.",
    points: 15,
    instructions:
      "Elegí 3 metas para las próximas semanas. Para cada una escribí: Qué quiero lograr / Cómo lo voy a medir / Para cuándo. Ejemplo: \"Leer un libro / lo sé porque lo termino y puedo contar de qué trata / en 2 semanas\".",
  },
  {
    title: "La ley de la siembra",
    description: "Elegir un hábito chico y sostenerlo 7 días (Jim Rohn).",
    points: 15,
    instructions:
      "Elegí un hábito chico que quieras sostener 7 días seguidos (por ejemplo: tender la cama, tomar agua al despertar). Contanos cuál elegiste y por qué — vamos a revisar cómo te fue en una semana.",
  },
  {
    title: "Sos el promedio de tus 5 amigos",
    description: "Reflexión sobre las influencias que elegís.",
    points: 10,
    instructions:
      "Pensá en las personas con las que más tiempo pasás. ¿Qué cosas buenas te contagian? Sin hablar mal de nadie: ¿hay algo que te gustaría que te contagiaran más?",
  },
  {
    title: "El estado manda",
    description: "Activar el propio ánimo antes de una tarea difícil.",
    points: 15,
    instructions:
      "Antes de una tarea que te cuesta, probá cambiar tu postura: pararte derecho, respirar hondo, sonreír aunque sea forzado. Contanos cómo estabas antes de hacerlo y cómo te sentiste después de probarlo.",
  },
  {
    title: "El termómetro interno",
    description: "Registrar ánimo y energía durante el día.",
    points: 10,
    instructions:
      "Durante el día de hoy, anotá 2 veces (mañana y tarde) un número del 1 al 10 para tu ánimo y otro para tu energía. Contanos los 4 números y qué creés que los movió.",
  },
  {
    title: "Respirar y observar",
    description:
      "Mindfulness — práctica de respiración, no una verdad científica cerrada.",
    points: 15,
    instructions:
      "Sentate cómodo y respirá lento contando hasta 4 al inhalar y hasta 4 al exhalar, durante 5 minutos. Es un ejercicio de atención, no magia. Contanos qué se te pasó por la cabeza y si te costó quedarte quieto.",
  },
  {
    title: "La película mental",
    description:
      "Visualización antes de un desempeño — ejercicio de preparación mental.",
    points: 15,
    instructions:
      "Antes de algo que te ponga nervioso (una prueba, hablar en público, un partido), cerrá los ojos 2 minutos e imaginate haciéndolo bien, con detalles. Es un ejercicio para prepararte, no un truco mágico — lo que realmente te prepara es también practicar de verdad. Contanos qué imaginaste.",
  },
  {
    title: "Lo que depende de mí",
    description: "Dicotomía del control (Marco Aurelio).",
    points: 15,
    instructions:
      "Pensá en una situación reciente que te costó. Hacé dos columnas: \"Lo que dependía de mí\" y \"Lo que no dependía de mí\". Contanos las dos listas.",
  },
  {
    title: "Las 4 brújulas",
    description:
      "Módulo integrador: sabiduría, coraje, templanza y justicia.",
    points: 20,
    instructions:
      "Llegaste al final del camino de Mente. Elegí una de las cuatro virtudes estoicas — sabiduría, coraje, templanza o justicia — y contanos un momento de las últimas semanas donde la hayas puesto en práctica, aunque haya sido chiquito.",
  },
].map((m, i) => ({
  ...m,
  order_index: i + 1,
  content: { kind: "reflexion", instructions: m.instructions, rubric: MENTE_RUBRIC },
}));

// ============================================================================
// Escritura Creativa — sección 7.5 (12 módulos, 3 etapas)
// ============================================================================
const ESCRITURA_RUBRIC = [
  "Coherencia narrativa",
  "Desarrollo de personaje",
  "Uso de las técnicas enseñadas",
  "Esfuerzo y avance (no perfección técnica)",
];

const ESCRITURA_MODULES = [
  {
    stage: "Etapa 1 · Cimientos",
    title: "El mapa de todas las historias",
    points: 15,
    instructions:
      "Todas las historias que más te gustan (Star Wars, Harry Potter, Percy Jackson) siguen un patrón parecido: el \"viaje del héroe\". Investigá o pensá en una de tus historias favoritas y contanos: ¿cuál es el mundo normal del héroe? ¿Qué lo saca de ahí?",
  },
  {
    stage: "Etapa 1 · Cimientos",
    title: "Tu chispa de idea",
    points: 10,
    instructions:
      "Escribí 3 ideas que empiecen con \"¿Qué pasaría si...?\". Después elegí una — esa va a ser la semilla de tu historia.",
  },
  {
    stage: "Etapa 1 · Cimientos",
    title: "Tu mundo ordinario y tu llamado",
    points: 15,
    instructions:
      "Esta es la primera entrada de tu Biblia de la Historia. Contanos: ¿quién es tu protagonista antes de que empiece la aventura? ¿Qué evento lo saca de su mundo normal?",
  },
  {
    stage: "Etapa 2 · Herramientas de estructura",
    title: "Ficha de personaje",
    points: 15,
    instructions:
      "Para tu protagonista, definí: qué desea más que nada, qué le da miedo, cuál es su defecto, y cómo va a cambiar (su arco) a lo largo de la historia.",
  },
  {
    stage: "Etapa 2 · Herramientas de estructura",
    title: "Tu historia en 3 actos",
    points: 20,
    instructions:
      "Contanos tu historia completa en 3 partes cortas: Acto 1 (el comienzo, el llamado a la aventura), Acto 2 (los obstáculos, el punto más difícil), Acto 3 (cómo se resuelve todo).",
  },
  {
    stage: "Etapa 2 · Herramientas de estructura",
    title: "El corazón del conflicto",
    points: 15,
    instructions:
      "Todo buen conflicto tiene una parte externa (un obstáculo afuera) y una interna (una duda adentro del personaje). Contanos cuál es el obstáculo externo de tu historia y qué duda interna lo hace más difícil.",
  },
  {
    stage: "Etapa 2 · Herramientas de estructura",
    title: "Mostrá, no cuentes",
    points: 15,
    instructions:
      'Tomá 3 oraciones "contadas" como: "Juana estaba triste" y reescribilas "mostrando" la emoción con acciones o detalles, sin usar la palabra del sentimiento. Ejemplo: "Juana miró el piso y no contestó."',
  },
  {
    stage: "Etapa 2 · Herramientas de estructura",
    title: "La escaleta de escenas",
    points: 20,
    instructions:
      "Hacé el índice de capítulos de tu historia — una lista con el nombre o resumen de cada capítulo, siguiendo el viaje del héroe. No hace falta que sea perfecto, es tu mapa para escribir.",
  },
  {
    stage: "Etapa 3 · Borrador, edición e ilustración",
    title: "Capítulo a capítulo",
    points: 20,
    instructions:
      "Escribí el próximo capítulo de tu historia según tu escaleta. Ponete una meta propia de cantidad de palabras y tratá de llegar — terminar la historia vale más que la perfección.",
  },
  {
    stage: "Etapa 3 · Borrador, edición e ilustración",
    title: "Leer en voz alta y pulir",
    points: 15,
    instructions:
      "Leé en voz alta lo que escribiste hasta ahora. Anotá 2 cosas que quieras corregir (algo que no se entiende, una parte lenta, una repetición) y arreglalas.",
  },
  {
    stage: "Etapa 3 · Borrador, edición e ilustración",
    title: "Ilustrá tu historia",
    points: 20,
    instructions:
      "Dibujá la portada de tu libro o una escena clave. No importa la técnica — lo que importa es que se entienda quién es el personaje, qué está pasando y dónde. Contanos qué escena elegiste y por qué.",
  },
  {
    stage: "Etapa 3 · Borrador, edición e ilustración",
    title: "Publicá tu libro",
    points: 45,
    instructions:
      "¡Llegaste al final! Contanos cómo terminó tu historia y qué fue lo que más te gustó de escribirla. Con esto cerrás tu proyecto — buscá la insignia especial de Autor Publicado.",
  },
].map((m, i) => ({
  ...m,
  order_index: i + 1,
  content: { kind: "escritura", instructions: m.instructions, rubric: ESCRITURA_RUBRIC },
}));

// ============================================================================
// Geografía — sección 7.3 (6 niveles). Fuentes citadas para el nivel 5.
// ============================================================================
const GEOGRAFIA_MODULES = [
  {
    title: "Continentes y océanos",
    points: 15,
    content: {
      kind: "quiz",
      instructions: "Un repaso rápido de continentes y océanos.",
      quiz: [
        {
          question: "¿Cuántos continentes hay generalmente reconocidos?",
          options: ["5", "6", "7"],
          correctIndex: 2,
        },
        {
          question: "¿Cuál es el océano más grande del mundo?",
          options: ["Atlántico", "Pacífico", "Índico"],
          correctIndex: 1,
        },
        {
          question: "Argentina está en...",
          options: ["América del Norte", "América del Sur", "Europa"],
          correctIndex: 1,
        },
      ],
    },
  },
  {
    title: "Países y capitales",
    points: 20,
    content: {
      kind: "quiz",
      instructions: "Capitales de algunos países del mundo.",
      quiz: [
        {
          question: "¿Cuál es la capital de Francia?",
          options: ["Lyon", "Marsella", "París"],
          correctIndex: 2,
        },
        {
          question: "¿Cuál es la capital de Argentina?",
          options: ["Buenos Aires", "Córdoba", "Rosario"],
          correctIndex: 0,
        },
        {
          question: "¿Cuál es la capital de Noruega?",
          options: ["Oslo", "Bergen", "Estocolmo"],
          correctIndex: 0,
        },
        {
          question: "¿Cuál es la capital de China?",
          options: ["Shanghái", "Pekín", "Hong Kong"],
          correctIndex: 1,
        },
      ],
    },
  },
  {
    title: "Ríos y cordilleras",
    points: 15,
    content: {
      kind: "quiz",
      instructions: "Accidentes geográficos principales.",
      quiz: [
        {
          question: "¿Cuál es el río más largo del mundo?",
          options: ["Amazonas", "Nilo", "Misisipi"],
          correctIndex: 1,
        },
        {
          question: "La Cordillera de los Andes recorre principalmente...",
          options: ["América del Sur", "África", "Asia"],
          correctIndex: 0,
        },
      ],
    },
  },
  {
    title: "Banderas",
    points: 15,
    content: {
      kind: "reflexion",
      instructions:
        "Elegí 5 banderas de países distintos y dibujalas o describilas de memoria (colores y forma). Contanos de qué países son.",
    },
  },
  {
    title: "Sistemas económicos y de gobierno",
    points: 20,
    content: {
      kind: "reflexion",
      instructions:
        "Elegí 2 países y buscá (con ayuda de un adulto si hace falta) qué sistema de gobierno tienen y qué tipo de economía, citando de dónde sacaste el dato (por ejemplo: FMI, Banco Mundial, CIA World Factbook). Escribilo sin decir que un sistema es \"mejor\" que otro — solo describilo.",
      rubric: [
        "Describe sin juzgar (nada de \"mejor/peor\")",
        "Cita la fuente del dato",
      ],
    },
  },
  {
    title: "Geopolítica básica",
    points: 20,
    content: {
      kind: "reflexion",
      instructions:
        "Elegí una organización internacional (ONU, UE, OTAN, o un bloque económico) e investigá para qué sirve y quiénes forman parte. Contanos qué aprendiste, siempre describiendo sin tomar partido.",
      rubric: [
        "Describe sin juzgar",
        "Identifica quiénes forman parte",
      ],
    },
  },
].map((m, i) => ({ ...m, order_index: i + 1 }));

// ============================================================================
// Lectura — Anexo 14.1 (30) + 14.1-bis (16) = 46 libros
// ============================================================================
const BOOKS = [
  ["El Principito", "Antoine de Saint-Exupéry", "es", ["ficcion_clasica"]],
  ["The Little Prince", "Antoine de Saint-Exupéry", "en", ["ficcion_clasica"]],
  ["Charlie and the Chocolate Factory", "Roald Dahl", "en", ["ficcion_clasica", "aventura"]],
  ["Matilda", "Roald Dahl", "en", ["ficcion_clasica"]],
  ["La isla del tesoro", "Robert Louis Stevenson", "es", ["aventura", "ficcion_clasica"]],
  ["Hatchet", "Gary Paulsen", "en", ["aventura", "formacion_caracter"]],
  ["El diario de Ana Frank (ed. juvenil)", "Ana Frank", "es", ["historia", "biografia"]],
  ["Wonder", "R.J. Palacio", "en", ["formacion_caracter"]],
  ["Percy Jackson y el ladrón del rayo", "Rick Riordan", "es", ["aventura", "ficcion_clasica"]],
  ["Holes", "Louis Sachar", "en", ["aventura", "formacion_caracter"]],
  ["Cuentos de la selva", "Horacio Quiroga", "es", ["naturaleza", "ficcion_clasica"]],
  ["The Boy Who Harnessed the Wind (ed. juvenil)", "William Kamkwamba", "en", ["biografia", "formacion_caracter"]],
  ["Malala, mi historia (ed. jóvenes)", "Malala Yousafzai", "es", ["biografia", "formacion_caracter"]],
  ["Hidden Figures (Young Readers' Edition)", "Margot Lee Shetterly", "en", ["biografia", "ciencia"]],
  ["Breves respuestas a las grandes preguntas (adaptación)", "Stephen Hawking", "es", ["ciencia"]],
  ["The Wild Robot", "Peter Brown", "en", ["aventura", "naturaleza"]],
  ["Los cuatro acuerdos (versión joven)", "Miguel Ruiz", "es", ["desarrollo_personal"]],
  ["Mindset: la actitud del éxito (resumen ilustrado)", "Carol Dweck", "es", ["desarrollo_personal"]],
  ["The Boxcar Children", "Gertrude Chandler Warner", "en", ["aventura"]],
  ["El asombroso viaje de Pomponio Flato", "Eduardo Mendoza", "es", ["aventura", "ficcion_clasica"]],
  ["Fábulas de Esopo (selección comentada)", "Esopo", "es", ["estoicismo_filosofia", "formacion_caracter"]],
  ["The Boy, the Mole, the Fox and the Horse", "Charlie Mackesy", "en", ["desarrollo_personal"]],
  ["Cartas a un joven estoico (adaptación)", "Séneca", "es", ["estoicismo_filosofia"]],
  ["Number the Stars", "Lois Lowry", "en", ["historia", "formacion_caracter"]],
  ["La vuelta al mundo en 80 días", "Julio Verne", "es", ["aventura", "ficcion_clasica"]],
  ["I Am Malala (Young Readers Edition)", "Malala Yousafzai", "en", ["biografia", "formacion_caracter"]],
  ["Momo", "Michael Ende", "es", ["ficcion_clasica", "desarrollo_personal"]],
  ["Kid Presidents", "David Stabler", "es", ["biografia"]],
  ["El viejo y el mar (ed. juvenil comentada)", "Ernest Hemingway", "es", ["ficcion_clasica", "formacion_caracter"]],
  ["The One and Only Ivan", "Katherine Applegate", "en", ["naturaleza", "formacion_caracter"]],
  ["Shackleton's Journey", "William Grill", "en", ["formacion_caracter", "biografia"]],
  ["Out of Darkness: The Story of Louis Braille", "Russell Freedman", "en", ["formacion_caracter", "biografia"]],
  ["Helen Keller", "Margaret Davidson", "en", ["formacion_caracter", "biografia"]],
  ["The Wright Brothers: How They Invented the Airplane", "Russell Freedman", "en", ["formacion_caracter", "ciencia"]],
  ["Benjamin Franklin", "Ingri y Edgar Parin d'Aulaire", "en", ["formacion_caracter", "biografia"]],
  ["Mujercitas", "Louisa May Alcott", "es", ["formacion_caracter", "ficcion_clasica"]],
  ["Robin Hood", "Tradicional", "es", ["formacion_caracter", "aventura"]],
  ["Las leyendas del Rey Arturo", "Tradicional", "es", ["formacion_caracter", "aventura"]],
  ["El Cantar de Mío Cid (versión adaptada)", "Anónimo", "es", ["formacion_caracter", "ficcion_clasica"]],
  ["Robinson Crusoe (versión abreviada)", "Daniel Defoe", "es", ["formacion_caracter", "aventura"]],
  ["El león, la bruja y el ropero", "C.S. Lewis", "es", ["formacion_caracter", "ficcion_clasica"]],
  ["Mi lado de la montaña", "Jean Craighead George", "es", ["formacion_caracter", "naturaleza"]],
  ["Donde crece el helecho rojo", "Wilson Rawls", "es", ["formacion_caracter", "naturaleza"]],
  ["Fábulas de La Fontaine", "Jean de La Fontaine", "es", ["formacion_caracter", "estoicismo_filosofia"]],
  ["Amelia Earhart", "Kate Boehm Jerome", "en", ["formacion_caracter", "biografia"]],
  ["Kon-Tiki: A través del Pacífico en balsa", "Thor Heyerdahl", "es", ["formacion_caracter", "aventura"]],
].map(([title, author, language, genres]) => ({
  title,
  author,
  language,
  genres,
  synopsis: null,
  active: true,
  points_base: 20,
}));

// ============================================================================
// Ejecución
// ============================================================================
async function main() {
  const families = await rest("GET", "families", {
    query: `?id=eq.${FAMILY_ID}&select=id,name`,
  });
  const family = families?.[0];
  if (!family) throw new Error(`Familia ${FAMILY_ID} no encontrada`);
  console.log(`Sembrando currículo para: ${family.name}`);

  const categoryIdByName = {};
  for (const cat of CATEGORIES) {
    const slug = slugify(cat.name);
    const existing = await rest("GET", "categories", {
      query: `?family_id=eq.${FAMILY_ID}&slug=eq.${slug}&select=id`,
    });
    if (existing?.[0]) {
      categoryIdByName[cat.name] = existing[0].id;
      continue;
    }

    const inserted = await rest("POST", "categories", {
      body: {
        family_id: FAMILY_ID,
        name: cat.name,
        slug,
        color: cat.color,
        type: "materia",
        display_order: cat.order,
        active: true,
      },
    });
    categoryIdByName[cat.name] = inserted[0].id;
    console.log(`  + categoría: ${cat.name}`);
  }

  async function seedModules(categoryName, modules) {
    const categoryId = categoryIdByName[categoryName];
    for (const m of modules) {
      const existing = await rest("GET", "subject_modules", {
        query: `?category_id=eq.${categoryId}&order_index=eq.${m.order_index}&select=id`,
      });
      if (existing?.[0]) continue;

      await rest("POST", "subject_modules", {
        body: {
          family_id: FAMILY_ID,
          category_id: categoryId,
          stage: m.stage ?? null,
          order_index: m.order_index,
          title: m.title,
          description: m.description ?? null,
          content: m.content,
          points: m.points,
          active: true,
        },
      });
      console.log(`  + módulo [${categoryName}]: ${m.title}`);
    }
  }

  await seedModules("Mente", MENTE_MODULES);
  await seedModules("Escritura Creativa", ESCRITURA_MODULES);
  await seedModules("Geografía", GEOGRAFIA_MODULES);

  const lecturaCategoryId = categoryIdByName["Lectura"];
  for (const book of BOOKS) {
    const existing = await rest("GET", "books", {
      query: `?family_id=eq.${FAMILY_ID}&title=eq.${encodeURIComponent(book.title)}&select=id`,
    });
    if (existing?.[0]) continue;

    await rest("POST", "books", {
      body: { ...book, family_id: FAMILY_ID, category_id: lecturaCategoryId },
    });
    console.log(`  + libro: ${book.title}`);
  }

  console.log("Listo.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
