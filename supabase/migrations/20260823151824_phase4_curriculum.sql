-- Fase 4: currículo por materia (sección 7) — landing pages con módulos.
--
-- subject_modules es el motor genérico de curricula lineal ("camino de
-- expedición", sección 5.5): sirve para Mente, Escritura Creativa,
-- Geografía y cualquier materia nueva sin modelar una tabla por materia.
-- Lectura NO usa esto — ya tiene su propio flujo con books/book_progress
-- desde la Fase 1, fiel a como describe la sección 7.2.

alter table public.categories
  add column slug text;

update public.categories set slug = lower(regexp_replace(name, '[^a-zA-Z0-9]+', '-', 'g'))
  where slug is null;

alter table public.categories
  alter column slug set not null,
  add constraint categories_family_slug_key unique (family_id, slug);

-- ============================================================================
-- subject_modules
-- ============================================================================
create table public.subject_modules (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families (id) on delete cascade,
  category_id uuid not null references public.categories (id) on delete cascade,
  stage text,
  order_index int not null default 0,
  title text not null,
  description text,
  content jsonb not null default '{}'::jsonb,
  points int not null default 10,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (category_id, order_index)
);

alter table public.subject_modules enable row level security;

create policy "subject_modules: familia lee" on public.subject_modules
  for select using (family_id = public.current_family_id());

create policy "subject_modules: admin escribe" on public.subject_modules
  for insert with check (family_id = public.current_family_id() and public.is_parent_admin());

create policy "subject_modules: admin actualiza" on public.subject_modules
  for update using (family_id = public.current_family_id() and public.is_parent_admin())
  with check (family_id = public.current_family_id() and public.is_parent_admin());

create policy "subject_modules: admin borra" on public.subject_modules
  for delete using (family_id = public.current_family_id() and public.is_parent_admin());

-- ============================================================================
-- student_module_progress
-- ============================================================================
create table public.student_module_progress (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families (id) on delete cascade,
  student_id uuid not null references public.users (id) on delete cascade,
  module_id uuid not null references public.subject_modules (id) on delete cascade,
  status text not null default 'actual' check (status in ('bloqueado', 'actual', 'completado')),
  completed_at timestamptz,
  points_awarded int,
  submission_id uuid references public.submissions (id) on delete set null,
  created_at timestamptz not null default now(),
  unique (student_id, module_id)
);

alter table public.student_module_progress enable row level security;

create policy "student_module_progress: dueño o admin lee" on public.student_module_progress
  for select using (
    family_id = public.current_family_id()
    and (student_id = auth.uid() or public.is_parent_admin())
  );

create policy "student_module_progress: dueño escribe" on public.student_module_progress
  for insert with check (family_id = public.current_family_id() and student_id = auth.uid());

create policy "student_module_progress: dueño actualiza" on public.student_module_progress
  for update using (family_id = public.current_family_id() and student_id = auth.uid())
  with check (family_id = public.current_family_id() and student_id = auth.uid());

create index on public.subject_modules (family_id, category_id, order_index);
create index on public.student_module_progress (family_id, student_id);

-- ============================================================================
-- Extensión de books (sección 7.2) — géneros de contenido, distintos de
-- las 7 categorías madre del heatmap (books.category_id sigue apuntando
-- a "Conocimiento" o similar; genres es la taxonomía temática propia).
-- ============================================================================
alter table public.books
  add column genres text[] not null default '{}',
  add column language text not null default 'es' check (language in ('es', 'en')),
  add column synopsis text;
