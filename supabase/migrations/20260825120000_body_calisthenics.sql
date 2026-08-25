-- Cuerpo / calistenia — configuración por alumno (peso, edad, días/semana) +
-- historial de rutinas guiadas completadas. La galería de fotos de progreso
-- reutiliza la tabla submissions ya existente (type 'foto', metadata.kind =
-- 'progreso_cuerpo'), no hace falta tabla nueva para eso.

create table public.student_body_config (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families (id) on delete cascade,
  student_id uuid not null references public.users (id) on delete cascade unique,
  weight_kg numeric(5, 1),
  age_years int,
  days_per_week int not null default 3 check (days_per_week between 3 and 6),
  updated_at timestamptz not null default now()
);

alter table public.student_body_config enable row level security;

create policy "student_body_config: dueño o admin lee" on public.student_body_config
  for select using (
    family_id = public.current_family_id()
    and (student_id = auth.uid() or public.is_parent_admin())
  );

create policy "student_body_config: admin escribe" on public.student_body_config
  for insert with check (family_id = public.current_family_id() and public.is_parent_admin());

create policy "student_body_config: admin actualiza" on public.student_body_config
  for update using (family_id = public.current_family_id() and public.is_parent_admin())
  with check (family_id = public.current_family_id() and public.is_parent_admin());

create trigger student_body_config_set_updated_at
  before update on public.student_body_config
  for each row execute function public.set_updated_at();

create table public.body_workout_sessions (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families (id) on delete cascade,
  task_instance_id uuid not null references public.task_instances (id) on delete cascade,
  student_id uuid not null references public.users (id) on delete cascade,
  day_type text not null,
  exercises jsonb not null default '[]'::jsonb,
  rounds_completed int not null default 0,
  felt text,
  honest_effort boolean,
  notes text,
  points_awarded int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.body_workout_sessions enable row level security;

create policy "body_workout_sessions: dueño o admin lee" on public.body_workout_sessions
  for select using (
    family_id = public.current_family_id()
    and (student_id = auth.uid() or public.is_parent_admin())
  );

create policy "body_workout_sessions: dueño escribe" on public.body_workout_sessions
  for insert with check (
    family_id = public.current_family_id() and student_id = auth.uid()
  );

create index body_workout_sessions_student_idx on public.body_workout_sessions (student_id, created_at desc);
