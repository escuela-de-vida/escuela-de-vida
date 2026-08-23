// Anexo 14.2 del prompt maestro — banco de preguntas de pensamiento
// crítico. Se muestran 3 al azar al terminar un libro (sección 7.2).
export const READING_QUESTIONS: string[] = [
  "¿Qué hubieras hecho distinto que el protagonista en el momento más difícil de la historia?",
  "¿Qué parte del libro no te convenció o te pareció injusta, y por qué?",
  "Si pudieras cambiar el final, ¿cómo lo harías y qué perderíamos con ese cambio?",
  "¿Qué decisión del personaje principal fue la más valiente? ¿Vos la hubieras tomado?",
  "¿Qué problema del libro se parece a algo que viviste u observaste en tu vida real?",
  "¿Qué le dirías al autor si pudieras hacerle una sola pregunta?",
  "¿Qué personaje secundario merecía más protagonismo, y qué historia le darías?",
  "¿Qué idea del libro te pareció más difícil de creer o de aceptar?",
  "Si el protagonista te pidiera un consejo antes de su decisión más importante, ¿qué le dirías?",
  "¿Qué parte de la historia te hizo sentir algo fuerte, y por qué creés que fue así?",
  "¿Este libro te cambió de opinión sobre algo? ¿Sobre qué exactamente?",
  "¿Qué hecho histórico o científico del libro te gustaría investigar más a fondo?",
  "Según el libro, ¿qué está dentro de tu control y qué no? ¿Estás de acuerdo?",
  "¿Qué haría falta cambiar en el mundo real para que la historia del libro no pudiera pasar (o pasara más seguido)?",
  "Si tuvieras que recomendar este libro a un amigo con una sola frase, ¿cuál sería?",
];

export function randomQuestions(count = 3): string[] {
  const shuffled = [...READING_QUESTIONS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
