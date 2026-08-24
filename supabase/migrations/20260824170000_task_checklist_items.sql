-- Sesión de ajustes — el batch de foco de Higiene/Cuerpo mostraba un timer
-- vacío; los padres necesitan definir sub-bloques concretos (cepillado,
-- uñas, hilo dental / flexiones, sentadillas, abdominales) que aparezcan
-- como checklist interactivo DENTRO del batch, cada uno con sus propios
-- días de la semana y puntos — no todo mezclado en una sola tarea con un
-- timer genérico.
--
-- Si una tarea no tiene ningún item de checklist, sigue funcionando
-- exactamente como antes (timer simple + descripción) — retrocompatible.

create table public.task_checklist_items (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families (id) on delete cascade,
  task_template_id uuid not null references public.task_templates (id) on delete cascade,
  label text not null,
  points int not null default 0,
  duration_minutes int not null default 0,
  recurrence_days int[],
  order_index int not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.task_checklist_items enable row level security;

create policy "checklist_items: familia lee" on public.task_checklist_items
  for select using (family_id = public.current_family_id());

create policy "checklist_items: admin escribe" on public.task_checklist_items
  for insert with check (family_id = public.current_family_id() and public.is_parent_admin());

create policy "checklist_items: admin actualiza" on public.task_checklist_items
  for update using (family_id = public.current_family_id() and public.is_parent_admin())
  with check (family_id = public.current_family_id() and public.is_parent_admin());

create policy "checklist_items: admin borra" on public.task_checklist_items
  for delete using (family_id = public.current_family_id() and public.is_parent_admin());

create index on public.task_checklist_items (task_template_id);
