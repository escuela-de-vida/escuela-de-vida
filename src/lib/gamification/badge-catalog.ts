// Anexo 14.4 — catálogo completo de 20 insignias. `autoCheck` marca las
// que el sistema puede otorgar solo, a partir de datos que ya registramos
// (tareas, módulos, libros, streaks). Las demás quedan en el catálogo para
// que el admin las otorgue a mano más adelante — sus criterios (ayudar a
// un hermano, una reunión familiar) no tienen una señal de datos limpia
// todavía, y inventar una sería peor que ser honestos al respecto.
export type BadgeDefinition = {
  slug: string;
  name: string;
  description: string;
  icon: string;
  autoCheck: boolean;
};

export const BADGE_CATALOG: BadgeDefinition[] = [
  { slug: "mente-en-calma", name: "Mente en Calma", description: "7 días seguidos de meditación/journaling", icon: "🧘", autoCheck: true },
  { slug: "guerrero-del-sueno", name: "Guerrero del Sueño", description: "14 días de buen descanso", icon: "😴", autoCheck: false },
  { slug: "energia-total", name: "Energía Total", description: "30 sesiones de actividad física", icon: "💪", autoCheck: true },
  { slug: "devorador-de-libros", name: "Devorador de Libros", description: "10 libros/resúmenes leídos", icon: "📚", autoCheck: true },
  { slug: "cientifico-en-accion", name: "Científico en Acción", description: "3 proyectos de ciencia", icon: "🔬", autoCheck: false },
  { slug: "artista-en-ascenso", name: "Artista en Ascenso", description: "5 obras subidas", icon: "🎨", autoCheck: true },
  { slug: "chef-de-la-casa", name: "Chef de la Casa", description: "10 recetas documentadas", icon: "👨‍🍳", autoCheck: true },
  { slug: "manos-a-la-obra", name: "Manos a la Obra", description: "5 tareas domésticas completadas", icon: "🛠️", autoCheck: true },
  { slug: "orador-nato", name: "Orador Nato", description: "3 presentaciones orales", icon: "🎤", autoCheck: true },
  { slug: "bilingue-en-marcha", name: "Bilingüe en Marcha", description: "Actividades en el segundo idioma", icon: "🌍", autoCheck: true },
  { slug: "hermano-solidario", name: "Hermano Solidario", description: "5 veces ayudando al hermano", icon: "🤝", autoCheck: false },
  { slug: "voz-de-la-familia", name: "Voz de la Familia", description: "3 reuniones familiares", icon: "🗣️", autoCheck: false },
  { slug: "racha-de-hierro", name: "Racha de Hierro", description: "30 días de racha sin romper", icon: "🔥", autoCheck: true },
  { slug: "maestro-de-la-constancia", name: "Maestro de la Constancia", description: "90% de tareas semanales, 4 semanas seguidas", icon: "🏆", autoCheck: false },
  { slug: "explorador-completo", name: "Explorador Completo", description: "1 insignia en cada una de las 7 categorías", icon: "🗺️", autoCheck: false },
  { slug: "segunda-oportunidad", name: "Segunda Oportunidad", description: "5 tareas completadas dentro de la ventana de gracia", icon: "🔄", autoCheck: true },
  { slug: "nivel-superado", name: "Nivel Superado", description: "Alcanzar un nuevo rango", icon: "⬆️", autoCheck: true },
  { slug: "proyecto-del-mes", name: "Proyecto del Mes", description: "Completar un proyecto de 20-40 pts", icon: "📌", autoCheck: true },
  { slug: "cuerpo-y-mente", name: "Cuerpo y Mente", description: "Streaks activos en ambas categorías por 2 semanas", icon: "⚖️", autoCheck: false },
  { slug: "espiritu-de-equipo", name: "Espíritu de Equipo", description: "Actividad colaborativa entre hermanos", icon: "🤜🤛", autoCheck: false },
];
