// Banco de 20 citas rotativas — sección 14.3 del spec.
export const QUOTES: string[] = [
  "Empezá por lo más difícil del día: el resto se vuelve más fácil. — Brian Tracy",
  "No tenés que ser grandioso para empezar, pero tenés que empezar para ser grandioso. — inspirado en Jim Rohn",
  "Lo que siembres hoy, lo vas a cosechar más adelante. — Jim Rohn",
  "La disciplina es elegir entre lo que querés ahora y lo que más querés. — inspirado en Jim Rohn",
  "No dejes que un mal momento se convierta en un mal día. — inspirado en Tony Robbins",
  "Cambiá tu postura y vas a cambiar cómo te sentís. — inspirado en Tony Robbins",
  "Tenés el poder de decidir cómo reaccionar, aunque no puedas elegir lo que pasa. — Marco Aurelio (adaptado)",
  "No busques que las cosas pasen como vos querés; aceptá que pasan como pasan, y vas a estar en paz. — Epicteto (adaptado)",
  "Lo que depende de mí, lo cuido. Lo que no depende de mí, lo dejo ir. — inspirado en Epicteto",
  "Cada mañana es una nueva oportunidad para empezar de nuevo. — Marco Aurelio (adaptado)",
  "No es lo que te pasa, sino cómo lo interpretás, lo que determina cómo te sentís. — Epicteto (adaptado)",
  "El coraje no es no tener miedo, es actuar a pesar del miedo. — inspirado en estoicismo",
  "Respirar hondo antes de reaccionar te da tiempo para elegir mejor. — práctica de mindfulness",
  "Tu mente es como un músculo: cuanto más la entrenás, más fuerte se pone. — inspirado en Dispenza (versión simplificada)",
  "Imaginarte haciéndolo bien te ayuda a prepararte, pero la práctica real es la que te lleva ahí. — versión adaptada",
  "Ser justo con los demás también es ser justo con vos mismo. — Marco Aurelio (adaptado)",
  "No necesitás ser perfecto, necesitás ser constante. — inspirado en Jim Rohn",
  "Un pequeño hábito repetido todos los días vale más que un gran esfuerzo una sola vez. — inspirado en Rohn",
  "Antes de hablar mal de vos mismo, preguntate si le hablarías así a un amigo. — enfoque de bienestar emocional",
  "Hoy hice lo que pude con lo que sabía. Mañana voy a saber un poco más. — espíritu de las Meditaciones de Marco Aurelio",
];

/** Rotación determinística por día del año — misma cita todo el día, cambia mañana. */
export function quoteOfTheDay(date: Date): string {
  const start = new Date(date.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((date.getTime() - start.getTime()) / 86_400_000);
  return QUOTES[dayOfYear % QUOTES.length];
}

/**
 * Solo la frase, sin la atribución del autor (" — Fulano") — es lo único
 * que tiene sentido pedirle al alumno que reescriba para incorporarla; la
 * cita completa se sigue mostrando con su fuente en el mensaje del día.
 */
export function quotePhrase(quote: string): string {
  return quote.split(" — ")[0].trim();
}
