-- Fase 6 — evaluación IA: columnas de override en book_progress (paridad con
-- submissions, sección 10) y points_awarded en typing_sessions (la tabla ya
-- existía desde la Fase 1, sección 7.4 — acá solo se completa lo que faltaba
-- para poder acreditar puntos por sesión).

alter table public.book_progress
  add column admin_override_score int,
  add column admin_override_comment text,
  add column reviewed_by uuid references public.users (id) on delete set null;

alter table public.typing_sessions
  add column points_awarded int not null default 0;

create policy "typing_sessions: admin borra" on public.typing_sessions
  for delete using (family_id = public.current_family_id() and public.is_parent_admin());
