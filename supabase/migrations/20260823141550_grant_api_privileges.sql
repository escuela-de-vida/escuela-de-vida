-- Otorga privilegios SQL a los roles de la API para las tablas de la Fase 1.
--
-- Elegimos "Automatically expose new tables" = OFF en la creación del proyecto
-- (control manual de acceso, sección 11), así que cada tabla necesita GRANT
-- explícito. RLS sigue siendo la barrera real fila por fila — estos GRANT solo
-- habilitan que las políticas de RLS lleguen a evaluarse.
--
-- anon no recibe nada: la plataforma no tiene superficie pública sin login.
-- authenticated recibe CRUD, acotado después por cada policy de RLS.
-- service_role recibe todo (además de BYPASSRLS) para scripts server-side.

grant usage on schema public to authenticated, service_role;

grant select, insert, update, delete on all tables in schema public to authenticated;
grant all on all tables in schema public to service_role;

grant usage, select on all sequences in schema public to authenticated, service_role;

grant execute on all functions in schema public to authenticated, service_role;

-- Mismos privilegios por defecto para las tablas/funciones que se creen en
-- próximas fases, sin tener que repetir este archivo cada vez.
alter default privileges in schema public
  grant select, insert, update, delete on tables to authenticated;

alter default privileges in schema public
  grant all on tables to service_role;

alter default privileges in schema public
  grant usage, select on sequences to authenticated, service_role;

alter default privileges in schema public
  grant execute on functions to authenticated, service_role;
