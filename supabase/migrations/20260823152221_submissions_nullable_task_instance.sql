-- Las entregas ahora también pueden venir de completar un módulo de
-- materia (Fase 4), no solo de una task_instance (Fase 3) — el origen
-- puntual queda en metadata.subject_module_id.
alter table public.submissions
  alter column task_instance_id drop not null;
