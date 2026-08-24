// Traduce el texto libre de recurrencia (elegido por el admin desde el
// preset del formulario de tareas, sección 4.2) a una regla determinística
// de "¿corresponde generar instancia hoy?". "Oportunista" nunca se genera
// sola — son tareas que el alumno dispara cuando quiere (ej. "ayudar a
// alguien").
//
// `explicitDays` (task_templates.recurrence_days) permite fijar en qué
// día(s) de la semana cae ESTA tarea puntual — necesario porque, sin esto,
// TODAS las tareas "Semanal" caerían el mismo día (todas anclan a lunes),
// TODAS las "2x/semana" a lunes+jueves, etc., y la semana entera se
// sentiría volcada en uno o dos días en vez de repartida (sesión de
// ajustes). Si no se especifica, cae al ancla histórica de esa
// recurrencia — mantiene retrocompatibilidad con tareas ya creadas.

export function shouldGenerateToday(
  recurrence: string,
  date: Date,
  explicitDays?: number[] | null,
): boolean {
  const day = date.getDay(); // 0 = domingo … 6 = sábado

  if (explicitDays && explicitDays.length > 0) {
    return explicitDays.includes(day);
  }

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
