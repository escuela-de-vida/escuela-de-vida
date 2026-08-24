-- Sesión de ajustes — el motor de recurrencia anclaba TODAS las tareas
-- "Semanal"/"2x/semana"/"2-3x/semana" a los mismos días fijos (ej. toda
-- tarea semanal caía lunes), por eso el heatmap se sentía volcado en un
-- solo día. Esta columna permite asignar días específicos por tarea; si
-- queda vacía, el motor sigue usando el default histórico de esa
-- recurrencia (retrocompatible).
--
-- Convención: 0 = domingo … 6 = sábado (mismo criterio que Date#getDay()).

alter table public.task_templates
  add column recurrence_days int[];
