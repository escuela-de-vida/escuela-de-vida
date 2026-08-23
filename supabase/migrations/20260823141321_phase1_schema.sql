-- Fase 1: modelo de datos completo (sección 10 del prompt maestro) + RLS por family_id.
--
-- Principio de diseño (sección 11): family_id en toda tabla operativa desde el día uno.
-- RLS nunca confía en un parámetro del cliente — siempre resuelve family_id/role desde
-- la fila de public.users asociada a auth.uid() (helpers current_family_id / is_parent_admin).

-- ============================================================================
-- Helpers de updated_at
-- ============================================================================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ============================================================================
-- families
-- ============================================================================
create table public.families (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  plan text not null default 'free',
  created_at timestamptz not null default now()
);

comment on table public.families is 'Tenant raíz. Toda tabla operativa cuelga de family_id.';

-- ============================================================================
-- users (perfil ligado a auth.users)
-- ============================================================================
create table public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  family_id uuid not null references public.families (id) on delete cascade,
  email text not null,
  role text not null check (role in ('parent_admin', 'student')),
  display_name text not null,
  avatar_url text,
  birth_year int,
  is_fictional boolean not null default false,
  created_at timestamptz not null default now()
);

comment on table public.users is 'Perfil de cada alumno/admin. is_fictional marca filas de ranking sin auth.users real (sección 6.6).';

-- users.id references auth.users, así que las filas ficticias del ranking (sección 6.6)
-- no viven acá — viven directamente en leaderboard_entries con student_id null.

-- ============================================================================
-- Helpers de RLS — SECURITY DEFINER para no auto-referenciar RLS de public.users
-- ============================================================================
create or replace function public.current_family_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select family_id from public.users where id = auth.uid();
$$;

create or replace function public.is_parent_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.users where id = auth.uid() and role = 'parent_admin'
  );
$$;

alter table public.families enable row level security;
alter table public.users enable row level security;

create policy "family: leer la propia" on public.families
  for select using (id = public.current_family_id());

create policy "users: leer compañeros de familia" on public.users
  for select using (family_id = public.current_family_id());

create policy "users: admin actualiza su familia" on public.users
  for update using (family_id = public.current_family_id() and public.is_parent_admin())
  with check (family_id = public.current_family_id() and public.is_parent_admin());

-- ============================================================================
-- categories
-- ============================================================================
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families (id) on delete cascade,
  name text not null,
  color text not null,
  icon text,
  type text not null check (type in ('materia', 'habito')),
  display_order int not null default 0,
  active boolean not null default true,
  supports_tracks boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.categories enable row level security;

create policy "categories: familia lee" on public.categories
  for select using (family_id = public.current_family_id());

create policy "categories: admin escribe" on public.categories
  for insert with check (family_id = public.current_family_id() and public.is_parent_admin());

create policy "categories: admin actualiza" on public.categories
  for update using (family_id = public.current_family_id() and public.is_parent_admin())
  with check (family_id = public.current_family_id() and public.is_parent_admin());

create policy "categories: admin borra" on public.categories
  for delete using (family_id = public.current_family_id() and public.is_parent_admin());

-- ============================================================================
-- tracks (sección 7.8 — Computación y futuras materias con doble camino)
-- ============================================================================
create table public.tracks (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families (id) on delete cascade,
  category_id uuid not null references public.categories (id) on delete cascade,
  slug text not null,
  name text not null,
  description text,
  icon text,
  display_order int not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (family_id, category_id, slug)
);

alter table public.tracks enable row level security;

create policy "tracks: familia lee" on public.tracks
  for select using (family_id = public.current_family_id());

create policy "tracks: admin escribe" on public.tracks
  for insert with check (family_id = public.current_family_id() and public.is_parent_admin());

create policy "tracks: admin actualiza" on public.tracks
  for update using (family_id = public.current_family_id() and public.is_parent_admin())
  with check (family_id = public.current_family_id() and public.is_parent_admin());

create policy "tracks: admin borra" on public.tracks
  for delete using (family_id = public.current_family_id() and public.is_parent_admin());

-- ============================================================================
-- student_tracks
-- ============================================================================
create table public.student_tracks (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families (id) on delete cascade,
  student_id uuid not null references public.users (id) on delete cascade,
  category_id uuid not null references public.categories (id) on delete cascade,
  track_id uuid not null references public.tracks (id) on delete cascade,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  assigned_by uuid references public.users (id) on delete set null
);

alter table public.student_tracks enable row level security;

create policy "student_tracks: dueño o admin lee" on public.student_tracks
  for select using (
    family_id = public.current_family_id()
    and (student_id = auth.uid() or public.is_parent_admin())
  );

create policy "student_tracks: admin escribe" on public.student_tracks
  for insert with check (family_id = public.current_family_id() and public.is_parent_admin());

create policy "student_tracks: admin actualiza" on public.student_tracks
  for update using (family_id = public.current_family_id() and public.is_parent_admin())
  with check (family_id = public.current_family_id() and public.is_parent_admin());

create policy "student_tracks: admin borra" on public.student_tracks
  for delete using (family_id = public.current_family_id() and public.is_parent_admin());

-- ============================================================================
-- task_templates
-- ============================================================================
create table public.task_templates (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families (id) on delete cascade,
  category_id uuid not null references public.categories (id) on delete cascade,
  track_id uuid references public.tracks (id) on delete set null,
  title text not null,
  description text,
  points_base int not null default 0,
  duration_minutes int,
  recurrence text not null,
  focus_batch_required boolean not null default true,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.task_templates enable row level security;

create policy "task_templates: familia lee" on public.task_templates
  for select using (family_id = public.current_family_id());

create policy "task_templates: admin escribe" on public.task_templates
  for insert with check (family_id = public.current_family_id() and public.is_parent_admin());

create policy "task_templates: admin actualiza" on public.task_templates
  for update using (family_id = public.current_family_id() and public.is_parent_admin())
  with check (family_id = public.current_family_id() and public.is_parent_admin());

create policy "task_templates: admin borra" on public.task_templates
  for delete using (family_id = public.current_family_id() and public.is_parent_admin());

-- ============================================================================
-- task_instances
-- ============================================================================
create table public.task_instances (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families (id) on delete cascade,
  template_id uuid not null references public.task_templates (id) on delete cascade,
  student_id uuid not null references public.users (id) on delete cascade,
  scheduled_date date not null,
  status text not null default 'pendiente' check (
    status in ('pendiente', 'hecho', 'no_hecho', 'reprogramado')
  ),
  completed_at timestamptz,
  points_awarded int,
  penalty_applied boolean not null default false,
  rescheduled_from_id uuid references public.task_instances (id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.task_instances enable row level security;

create policy "task_instances: dueño o admin lee" on public.task_instances
  for select using (
    family_id = public.current_family_id()
    and (student_id = auth.uid() or public.is_parent_admin())
  );

create policy "task_instances: dueño o admin escribe" on public.task_instances
  for insert with check (
    family_id = public.current_family_id()
    and (student_id = auth.uid() or public.is_parent_admin())
  );

create policy "task_instances: dueño o admin actualiza" on public.task_instances
  for update using (
    family_id = public.current_family_id()
    and (student_id = auth.uid() or public.is_parent_admin())
  )
  with check (
    family_id = public.current_family_id()
    and (student_id = auth.uid() or public.is_parent_admin())
  );

create policy "task_instances: admin borra" on public.task_instances
  for delete using (family_id = public.current_family_id() and public.is_parent_admin());

-- ============================================================================
-- submissions
-- ============================================================================
create table public.submissions (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families (id) on delete cascade,
  task_instance_id uuid not null references public.task_instances (id) on delete cascade,
  student_id uuid not null references public.users (id) on delete cascade,
  type text not null check (type in ('foto', 'video', 'texto', 'modelo_3d')),
  file_url text,
  text_content text,
  metadata jsonb not null default '{}'::jsonb,
  ai_evaluation jsonb,
  ai_evaluated_at timestamptz,
  admin_override_score int,
  admin_override_comment text,
  reviewed_by uuid references public.users (id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.submissions enable row level security;

create policy "submissions: dueño o admin lee" on public.submissions
  for select using (
    family_id = public.current_family_id()
    and (student_id = auth.uid() or public.is_parent_admin())
  );

create policy "submissions: dueño o admin escribe" on public.submissions
  for insert with check (
    family_id = public.current_family_id()
    and (student_id = auth.uid() or public.is_parent_admin())
  );

create policy "submissions: dueño o admin actualiza" on public.submissions
  for update using (
    family_id = public.current_family_id()
    and (student_id = auth.uid() or public.is_parent_admin())
  )
  with check (
    family_id = public.current_family_id()
    and (student_id = auth.uid() or public.is_parent_admin())
  );

create policy "submissions: admin borra" on public.submissions
  for delete using (family_id = public.current_family_id() and public.is_parent_admin());

-- ============================================================================
-- points_ledger (histórico inmutable — sin update/delete por diseño)
-- ============================================================================
create table public.points_ledger (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families (id) on delete cascade,
  student_id uuid not null references public.users (id) on delete cascade,
  source_type text not null check (source_type in ('task', 'badge', 'manual_admin', 'penalty')),
  source_id uuid,
  points int not null,
  reason text,
  created_at timestamptz not null default now()
);

alter table public.points_ledger enable row level security;

create policy "points_ledger: dueño o admin lee" on public.points_ledger
  for select using (
    family_id = public.current_family_id()
    and (student_id = auth.uid() or public.is_parent_admin())
  );

create policy "points_ledger: admin escribe" on public.points_ledger
  for insert with check (family_id = public.current_family_id() and public.is_parent_admin());

-- ============================================================================
-- badges (family_id nullable = insignia global de plantilla)
-- ============================================================================
create table public.badges (
  id uuid primary key default gen_random_uuid(),
  family_id uuid references public.families (id) on delete cascade,
  name text not null,
  description text,
  icon text,
  criteria jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.badges enable row level security;

create policy "badges: globales o de la familia" on public.badges
  for select using (family_id is null or family_id = public.current_family_id());

create policy "badges: admin escribe" on public.badges
  for insert with check (family_id = public.current_family_id() and public.is_parent_admin());

create policy "badges: admin actualiza" on public.badges
  for update using (family_id = public.current_family_id() and public.is_parent_admin())
  with check (family_id = public.current_family_id() and public.is_parent_admin());

create policy "badges: admin borra" on public.badges
  for delete using (family_id = public.current_family_id() and public.is_parent_admin());

-- ============================================================================
-- badge_awards
-- ============================================================================
create table public.badge_awards (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families (id) on delete cascade,
  student_id uuid not null references public.users (id) on delete cascade,
  badge_id uuid not null references public.badges (id) on delete cascade,
  awarded_at timestamptz not null default now()
);

alter table public.badge_awards enable row level security;

create policy "badge_awards: dueño o admin lee" on public.badge_awards
  for select using (
    family_id = public.current_family_id()
    and (student_id = auth.uid() or public.is_parent_admin())
  );

create policy "badge_awards: admin escribe" on public.badge_awards
  for insert with check (family_id = public.current_family_id() and public.is_parent_admin());

create policy "badge_awards: admin borra" on public.badge_awards
  for delete using (family_id = public.current_family_id() and public.is_parent_admin());

-- ============================================================================
-- books
-- ============================================================================
create table public.books (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families (id) on delete cascade,
  title text not null,
  author text,
  category_id uuid references public.categories (id) on delete set null,
  total_pages int,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.books enable row level security;

create policy "books: familia lee" on public.books
  for select using (family_id = public.current_family_id());

create policy "books: admin escribe" on public.books
  for insert with check (family_id = public.current_family_id() and public.is_parent_admin());

create policy "books: admin actualiza" on public.books
  for update using (family_id = public.current_family_id() and public.is_parent_admin())
  with check (family_id = public.current_family_id() and public.is_parent_admin());

create policy "books: admin borra" on public.books
  for delete using (family_id = public.current_family_id() and public.is_parent_admin());

-- ============================================================================
-- book_progress
-- ============================================================================
create table public.book_progress (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families (id) on delete cascade,
  student_id uuid not null references public.users (id) on delete cascade,
  book_id uuid not null references public.books (id) on delete cascade,
  status text not null default 'por_leer' check (
    status in ('por_leer', 'leyendo', 'leido')
  ),
  pages_read int not null default 0,
  review_text text,
  ai_evaluation jsonb,
  finished_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.book_progress enable row level security;

create policy "book_progress: dueño o admin lee" on public.book_progress
  for select using (
    family_id = public.current_family_id()
    and (student_id = auth.uid() or public.is_parent_admin())
  );

create policy "book_progress: dueño o admin escribe" on public.book_progress
  for insert with check (
    family_id = public.current_family_id()
    and (student_id = auth.uid() or public.is_parent_admin())
  );

create policy "book_progress: dueño o admin actualiza" on public.book_progress
  for update using (
    family_id = public.current_family_id()
    and (student_id = auth.uid() or public.is_parent_admin())
  )
  with check (
    family_id = public.current_family_id()
    and (student_id = auth.uid() or public.is_parent_admin())
  );

create policy "book_progress: admin borra" on public.book_progress
  for delete using (family_id = public.current_family_id() and public.is_parent_admin());

-- ============================================================================
-- leaderboard_entries (student_id null = fila ficticia, sección 6.6)
-- ============================================================================
create table public.leaderboard_entries (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families (id) on delete cascade,
  student_id uuid references public.users (id) on delete cascade,
  is_fictional boolean not null default false,
  display_name text not null,
  points_total int not null default 0,
  period text not null,
  computed_at timestamptz not null default now(),
  constraint leaderboard_entries_student_or_fictional check (
    (is_fictional and student_id is null) or (not is_fictional and student_id is not null)
  )
);

alter table public.leaderboard_entries enable row level security;

create policy "leaderboard_entries: familia lee" on public.leaderboard_entries
  for select using (family_id = public.current_family_id());

create policy "leaderboard_entries: admin escribe" on public.leaderboard_entries
  for insert with check (family_id = public.current_family_id() and public.is_parent_admin());

create policy "leaderboard_entries: admin actualiza" on public.leaderboard_entries
  for update using (family_id = public.current_family_id() and public.is_parent_admin())
  with check (family_id = public.current_family_id() and public.is_parent_admin());

create policy "leaderboard_entries: admin borra" on public.leaderboard_entries
  for delete using (family_id = public.current_family_id() and public.is_parent_admin());

-- ============================================================================
-- notifications
-- ============================================================================
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families (id) on delete cascade,
  user_id uuid not null references public.users (id) on delete cascade,
  type text not null check (type in ('mensaje_diario', 'recordatorio', 'feedback_ia')),
  title text not null,
  body text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.notifications enable row level security;

create policy "notifications: dueño o admin lee" on public.notifications
  for select using (
    family_id = public.current_family_id()
    and (user_id = auth.uid() or public.is_parent_admin())
  );

create policy "notifications: dueño actualiza (leído)" on public.notifications
  for update using (family_id = public.current_family_id() and user_id = auth.uid())
  with check (family_id = public.current_family_id() and user_id = auth.uid());

create policy "notifications: admin escribe" on public.notifications
  for insert with check (family_id = public.current_family_id() and public.is_parent_admin());

-- ============================================================================
-- feedback_suggestions
-- ============================================================================
create table public.feedback_suggestions (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families (id) on delete cascade,
  student_id uuid not null references public.users (id) on delete cascade,
  message text not null,
  status text not null default 'nuevo' check (status in ('nuevo', 'visto', 'respondido')),
  admin_response text,
  created_at timestamptz not null default now()
);

alter table public.feedback_suggestions enable row level security;

create policy "feedback_suggestions: dueño o admin lee" on public.feedback_suggestions
  for select using (
    family_id = public.current_family_id()
    and (student_id = auth.uid() or public.is_parent_admin())
  );

create policy "feedback_suggestions: dueño escribe" on public.feedback_suggestions
  for insert with check (family_id = public.current_family_id() and student_id = auth.uid());

create policy "feedback_suggestions: admin actualiza" on public.feedback_suggestions
  for update using (family_id = public.current_family_id() and public.is_parent_admin())
  with check (family_id = public.current_family_id() and public.is_parent_admin());

-- ============================================================================
-- typing_sessions
-- ============================================================================
create table public.typing_sessions (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families (id) on delete cascade,
  student_id uuid not null references public.users (id) on delete cascade,
  dictation_text text not null,
  typed_text text not null,
  wpm numeric(6, 2) not null,
  accuracy_pct numeric(5, 2) not null,
  errors jsonb not null default '[]'::jsonb,
  duration_seconds int not null,
  created_at timestamptz not null default now()
);

alter table public.typing_sessions enable row level security;

create policy "typing_sessions: dueño o admin lee" on public.typing_sessions
  for select using (
    family_id = public.current_family_id()
    and (student_id = auth.uid() or public.is_parent_admin())
  );

create policy "typing_sessions: dueño escribe" on public.typing_sessions
  for insert with check (family_id = public.current_family_id() and student_id = auth.uid());

-- ============================================================================
-- story_bible (Escritura Creativa)
-- ============================================================================
create table public.story_bible (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families (id) on delete cascade,
  student_id uuid not null references public.users (id) on delete cascade,
  titulo_historia text,
  genero text,
  protagonista jsonb not null default '{}'::jsonb,
  mundo jsonb not null default '{}'::jsonb,
  personajes_secundarios jsonb not null default '[]'::jsonb,
  timeline jsonb not null default '[]'::jsonb,
  capitulos jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now(),
  unique (student_id)
);

alter table public.story_bible enable row level security;

create trigger set_story_bible_updated_at
  before update on public.story_bible
  for each row execute function public.set_updated_at();

create policy "story_bible: dueño o admin lee" on public.story_bible
  for select using (
    family_id = public.current_family_id()
    and (student_id = auth.uid() or public.is_parent_admin())
  );

create policy "story_bible: dueño escribe" on public.story_bible
  for insert with check (family_id = public.current_family_id() and student_id = auth.uid());

create policy "story_bible: dueño actualiza" on public.story_bible
  for update using (family_id = public.current_family_id() and student_id = auth.uid())
  with check (family_id = public.current_family_id() and student_id = auth.uid());

-- ============================================================================
-- trading_weekly_reports (Laboratorio de Mercados, sección 7.7)
-- ============================================================================
create table public.trading_weekly_reports (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families (id) on delete cascade,
  student_id uuid not null references public.users (id) on delete cascade,
  week_start date not null,
  equity_change_pct numeric(6, 2) not null default 0,
  num_positions int not null default 0,
  screenshot_url text,
  points_awarded int not null default 0,
  validated_by_admin_at timestamptz,
  created_at timestamptz not null default now(),
  unique (student_id, week_start)
);

alter table public.trading_weekly_reports enable row level security;

create policy "trading_weekly_reports: dueño o admin lee" on public.trading_weekly_reports
  for select using (
    family_id = public.current_family_id()
    and (student_id = auth.uid() or public.is_parent_admin())
  );

create policy "trading_weekly_reports: dueño escribe" on public.trading_weekly_reports
  for insert with check (family_id = public.current_family_id() and student_id = auth.uid());

create policy "trading_weekly_reports: admin valida" on public.trading_weekly_reports
  for update using (family_id = public.current_family_id() and public.is_parent_admin())
  with check (family_id = public.current_family_id() and public.is_parent_admin());

-- ============================================================================
-- content_pieces (Comunidad online, sección 7.7-C)
-- ============================================================================
create table public.content_pieces (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families (id) on delete cascade,
  student_id uuid not null references public.users (id) on delete cascade,
  title text not null,
  type text not null,
  published_at timestamptz,
  engagement_snapshot jsonb not null default '{}'::jsonb,
  points_awarded int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.content_pieces enable row level security;

create policy "content_pieces: dueño o admin lee" on public.content_pieces
  for select using (
    family_id = public.current_family_id()
    and (student_id = auth.uid() or public.is_parent_admin())
  );

create policy "content_pieces: dueño escribe" on public.content_pieces
  for insert with check (family_id = public.current_family_id() and student_id = auth.uid());

create policy "content_pieces: dueño actualiza" on public.content_pieces
  for update using (family_id = public.current_family_id() and student_id = auth.uid())
  with check (family_id = public.current_family_id() and student_id = auth.uid());

-- ============================================================================
-- Índices por family_id (todo query real filtra por tenant)
-- ============================================================================
create index on public.users (family_id);
create index on public.categories (family_id);
create index on public.tracks (family_id);
create index on public.student_tracks (family_id);
create index on public.task_templates (family_id);
create index on public.task_instances (family_id, student_id, scheduled_date);
create index on public.submissions (family_id, task_instance_id);
create index on public.points_ledger (family_id, student_id);
create index on public.badges (family_id);
create index on public.badge_awards (family_id, student_id);
create index on public.books (family_id);
create index on public.book_progress (family_id, student_id);
create index on public.leaderboard_entries (family_id, period);
create index on public.notifications (family_id, user_id);
create index on public.feedback_suggestions (family_id);
create index on public.typing_sessions (family_id, student_id);
create index on public.trading_weekly_reports (family_id, student_id);
create index on public.content_pieces (family_id, student_id);
