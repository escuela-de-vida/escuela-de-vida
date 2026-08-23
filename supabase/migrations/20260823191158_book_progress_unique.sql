-- El flujo de lectura (Fase 4) hace upsert por (student_id, book_id) para
-- pasar de "por_leer" a "leyendo" a "leido" — faltaba el constraint que
-- ese upsert necesita para resolver el ON CONFLICT.
alter table public.book_progress
  add constraint book_progress_student_book_key unique (student_id, book_id);
