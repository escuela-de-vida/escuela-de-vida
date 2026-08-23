-- Fase 3: motor de tareas — soporte de esquema para generación diaria
-- idempotente y para el barrido de reprogramación/penalización de 72hs
-- (sección 6.4).

-- Evita instancias duplicadas si el cron corre dos veces el mismo día, y
-- es la base para el chequeo "¿ya existe la instancia de hoy?" que usa el
-- barrido antes de decidir si reprograma o no.
alter table public.task_instances
  add constraint task_instances_template_student_date_key
  unique (template_id, student_id, scheduled_date);

-- El barrido diario filtra por status='pendiente' y scheduled_date < hoy.
create index task_instances_pending_sweep_idx
  on public.task_instances (status, scheduled_date)
  where status = 'pendiente';
