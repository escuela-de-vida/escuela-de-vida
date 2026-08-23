-- Fase 5: gamificación — badges idempotentes y consultas de leaderboard más rápidas.
alter table public.badge_awards
  add constraint badge_awards_student_badge_key unique (student_id, badge_id);

create index on public.leaderboard_entries (family_id, period, points_total desc);
