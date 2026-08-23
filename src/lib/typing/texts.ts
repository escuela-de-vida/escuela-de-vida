export type DictationText = { id: string; language: "es" | "en"; text: string };

/**
 * Banco semilla de textos de dictado (sección 7.4) — apropiados para 11-12
 * años, cortos (40-70 palabras). El admin puede curar más desde el catálogo
 * de libros/tareas más adelante; por ahora es una lista fija embebida.
 */
export const DICTATION_TEXTS: DictationText[] = [
  {
    id: "es-1",
    language: "es",
    text: "El sol se escondía detrás de las montañas mientras el explorador anotaba en su cuaderno todo lo que había descubierto ese día. Cada paso del viaje le enseñaba algo nuevo sobre el mundo y sobre sí mismo.",
  },
  {
    id: "es-2",
    language: "es",
    text: "Una buena idea vale poco si nunca se pone en práctica. Lo que separa a quienes logran sus metas de quienes solo sueñan con ellas es la constancia de trabajar un poco cada día, incluso cuando no hay ganas.",
  },
  {
    id: "es-3",
    language: "es",
    text: "La brújula no le decía al capitán qué camino era el correcto, solo le mostraba dónde estaba el norte. La decisión de hacia dónde navegar siempre fue suya, y eso era lo que más responsabilidad le daba.",
  },
  {
    id: "en-1",
    language: "en",
    text: "The old fox walked slowly through the forest, listening carefully to every sound around him. He had learned long ago that patience was more useful than speed when you wanted to understand a new place.",
  },
  {
    id: "en-2",
    language: "en",
    text: "Every explorer keeps a journal, not because the trip needs to be remembered perfectly, but because writing things down helps you notice details you would otherwise forget. Small observations often turn into the best stories.",
  },
];

export function randomDictationText(language?: "es" | "en"): DictationText {
  const pool = language
    ? DICTATION_TEXTS.filter((t) => t.language === language)
    : DICTATION_TEXTS;
  return pool[Math.floor(Math.random() * pool.length)];
}
