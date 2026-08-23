-- Los puntos por completar un módulo de materia (Fase 4) son su propia
-- fuente, distinta de las tareas recurrentes del motor de la Fase 3.
alter table public.points_ledger
  drop constraint points_ledger_source_type_check;

alter table public.points_ledger
  add constraint points_ledger_source_type_check
  check (source_type in ('task', 'module', 'badge', 'manual_admin', 'penalty'));
