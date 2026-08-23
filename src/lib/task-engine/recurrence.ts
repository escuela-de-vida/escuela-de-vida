// Traduce el texto libre de recurrencia (elegido por el admin desde el
// preset del formulario de tareas, sección 4.2) a una regla determinística
// de "¿corresponde generar instancia hoy?". "Oportunista" nunca se genera
// sola — son tareas que el alumno dispara cuando quiere (ej. "ayudar a
// alguien").
//
// Los días semanales/mensuales son un ancla razonable, no una fecha exacta
// impuesta por los padres — el admin puede afinar el texto de recurrencia
// más adelante si necesita otro día.

export function shouldGenerateToday(recurrence: string, date: Date): boolean {
  const day = date.getDay(); // 0 = domingo … 6 = sábado
  const MONDAY = 1;
  const WEDNESDAY = 3;
  const THURSDAY = 4;
  const FRIDAY = 5;

  switch (recurrence) {
    case "Diaria":
      return true;
    case "2x/semana":
      return day === MONDAY || day === THURSDAY;
    case "2-3x/semana":
      return day === MONDAY || day === WEDNESDAY || day === FRIDAY;
    case "Semanal":
    case "Sem/mensual":
      return day === MONDAY;
    case "Mensual":
      return date.getDate() === 1;
    case "Anual":
      return date.getMonth() === 0 && date.getDate() === 1;
    case "Oportunista":
      return false;
    default:
      return false;
  }
}
