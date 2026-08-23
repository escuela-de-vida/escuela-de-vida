// Regla de puntos por atraso — sección 6.4.
//   Completada a tiempo (mismo día): 100%
//   Completada dentro de la ventana de gracia de 72hs (1-2 días tarde): 80%
//   Pasadas las 72hs: 0 pts — nunca resta, nunca genera deuda.
export function pointsForDaysLate(pointsBase: number, daysLate: number): number {
  if (daysLate <= 0) return pointsBase;
  if (daysLate <= 2) return Math.round(pointsBase * 0.8);
  return 0;
}

export function daysBetween(fromISO: string, toISO: string): number {
  const from = new Date(`${fromISO}T00:00:00`);
  const to = new Date(`${toISO}T00:00:00`);
  return Math.round((to.getTime() - from.getTime()) / 86_400_000);
}
