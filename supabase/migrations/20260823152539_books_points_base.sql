-- Puntos por completar la reseña de un libro (sección 6.2: "actividad de
-- landing con evidencia" = 10-25 pts). La rúbrica fina de 100pts de la
-- sección 7.2 es para cuando exista evaluación por IA (Fase 6) — por ahora
-- un valor plano por libro completado.
alter table public.books
  add column points_base int not null default 20;
