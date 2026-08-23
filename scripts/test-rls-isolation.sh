#!/usr/bin/env bash
# Prueba de regresión de RLS multi-tenant (sección 11 del prompt maestro).
#
# Crea dos familias de prueba con un admin cada una, hace que el admin de la
# familia A intente leer/escribir datos de la familia B usando su propia
# sesión (JWT real vía password grant, no service_role), y verifica que RLS
# lo bloquea en todos los casos. Limpia todo al final, incluso si falla.
#
# Uso: ./scripts/test-rls-isolation.sh   (correr desde la raíz de plataforma/)
# Requiere: curl, jq, .env.local con NEXT_PUBLIC_SUPABASE_URL,
#           NEXT_PUBLIC_SUPABASE_ANON_KEY y SUPABASE_SERVICE_ROLE_KEY.

set -euo pipefail
cd "$(dirname "$0")/.."
source .env.local

SUPABASE_URL="$NEXT_PUBLIC_SUPABASE_URL"
ANON_KEY="$NEXT_PUBLIC_SUPABASE_ANON_KEY"
SERVICE_KEY="$SUPABASE_SERVICE_ROLE_KEY"

PASS=0
FAIL=0

check() {
  local desc="$1" condition="$2"
  if [ "$condition" = "true" ]; then
    echo "  ✓ $desc"
    PASS=$((PASS + 1))
  else
    echo "  ✗ $desc"
    FAIL=$((FAIL + 1))
  fi
}

cleanup() {
  echo "Limpiando datos de prueba..."
  [ -n "${ADMIN_A_ID:-}" ] && curl -s -X DELETE "$SUPABASE_URL/auth/v1/admin/users/$ADMIN_A_ID" \
    -H "apikey: $SERVICE_KEY" -H "Authorization: Bearer $SERVICE_KEY" >/dev/null
  [ -n "${ADMIN_B_ID:-}" ] && curl -s -X DELETE "$SUPABASE_URL/auth/v1/admin/users/$ADMIN_B_ID" \
    -H "apikey: $SERVICE_KEY" -H "Authorization: Bearer $SERVICE_KEY" >/dev/null
  [ -n "${FAM_A:-}" ] && curl -s -X DELETE "$SUPABASE_URL/rest/v1/families?id=eq.$FAM_A" \
    -H "apikey: $SERVICE_KEY" -H "Authorization: Bearer $SERVICE_KEY" >/dev/null
  [ -n "${FAM_B:-}" ] && curl -s -X DELETE "$SUPABASE_URL/rest/v1/families?id=eq.$FAM_B" \
    -H "apikey: $SERVICE_KEY" -H "Authorization: Bearer $SERVICE_KEY" >/dev/null
}
trap cleanup EXIT

echo "Creando familias y admins de prueba..."

FAM_A=$(curl -s -X POST "$SUPABASE_URL/rest/v1/families" \
  -H "apikey: $SERVICE_KEY" -H "Authorization: Bearer $SERVICE_KEY" \
  -H "Content-Type: application/json" -H "Prefer: return=representation" \
  -d '{"name":"RLS Test Family A"}' | jq -r '.[0].id')

FAM_B=$(curl -s -X POST "$SUPABASE_URL/rest/v1/families" \
  -H "apikey: $SERVICE_KEY" -H "Authorization: Bearer $SERVICE_KEY" \
  -H "Content-Type: application/json" -H "Prefer: return=representation" \
  -d '{"name":"RLS Test Family B"}' | jq -r '.[0].id')

PASSWORD="RlsTest_$(date +%s)!"

ADMIN_A_ID=$(curl -s -X POST "$SUPABASE_URL/auth/v1/admin/users" \
  -H "apikey: $SERVICE_KEY" -H "Authorization: Bearer $SERVICE_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"rls-test-a@escuela-de-vida.local\",\"password\":\"$PASSWORD\",\"email_confirm\":true}" | jq -r '.id')

ADMIN_B_ID=$(curl -s -X POST "$SUPABASE_URL/auth/v1/admin/users" \
  -H "apikey: $SERVICE_KEY" -H "Authorization: Bearer $SERVICE_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"rls-test-b@escuela-de-vida.local\",\"password\":\"$PASSWORD\",\"email_confirm\":true}" | jq -r '.id')

curl -s -X POST "$SUPABASE_URL/rest/v1/users" \
  -H "apikey: $SERVICE_KEY" -H "Authorization: Bearer $SERVICE_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"id\":\"$ADMIN_A_ID\",\"family_id\":\"$FAM_A\",\"email\":\"rls-test-a@escuela-de-vida.local\",\"role\":\"parent_admin\",\"display_name\":\"RLS Test A\"}" >/dev/null

curl -s -X POST "$SUPABASE_URL/rest/v1/users" \
  -H "apikey: $SERVICE_KEY" -H "Authorization: Bearer $SERVICE_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"id\":\"$ADMIN_B_ID\",\"family_id\":\"$FAM_B\",\"email\":\"rls-test-b@escuela-de-vida.local\",\"role\":\"parent_admin\",\"display_name\":\"RLS Test B\"}" >/dev/null

CATEGORY_B=$(curl -s -X POST "$SUPABASE_URL/rest/v1/categories" \
  -H "apikey: $SERVICE_KEY" -H "Authorization: Bearer $SERVICE_KEY" \
  -H "Content-Type: application/json" -H "Prefer: return=representation" \
  -d "{\"family_id\":\"$FAM_B\",\"name\":\"Secreta de B\",\"color\":\"#ff0000\",\"type\":\"materia\"}" | jq -r '.[0].id')

echo "Logueando como admin de la familia A..."
JWT_A=$(curl -s -X POST "$SUPABASE_URL/auth/v1/token?grant_type=password" \
  -H "apikey: $ANON_KEY" -H "Content-Type: application/json" \
  -d "{\"email\":\"rls-test-a@escuela-de-vida.local\",\"password\":\"$PASSWORD\"}" | jq -r '.access_token')

echo ""
echo "Tests:"

# 1. A no puede leer la categoría de B
READ_B=$(curl -s "$SUPABASE_URL/rest/v1/categories?id=eq.$CATEGORY_B" \
  -H "apikey: $ANON_KEY" -H "Authorization: Bearer $JWT_A")
check "A no puede leer la categoría de B" "$([ "$(echo "$READ_B" | jq 'length')" = "0" ] && echo true || echo false)"

# 2. A solo ve sus propias categorías (ninguna todavía)
READ_OWN=$(curl -s "$SUPABASE_URL/rest/v1/categories" \
  -H "apikey: $ANON_KEY" -H "Authorization: Bearer $JWT_A")
check "A no ve categorías ajenas en el listado general" "$([ "$(echo "$READ_OWN" | jq 'length')" = "0" ] && echo true || echo false)"

# 3. A no puede actualizar la categoría de B (insert/update con family_id ajeno debe fallar)
UPDATE_B=$(curl -s -o /dev/null -w "%{http_code}" -X PATCH "$SUPABASE_URL/rest/v1/categories?id=eq.$CATEGORY_B" \
  -H "apikey: $ANON_KEY" -H "Authorization: Bearer $JWT_A" -H "Content-Type: application/json" \
  -d '{"name":"hackeado"}')
check "A no puede actualizar la categoría de B (0 filas afectadas)" "$([ "$UPDATE_B" = "204" ] && [ "$(curl -s "$SUPABASE_URL/rest/v1/categories?id=eq.$CATEGORY_B&select=name" -H "apikey: $SERVICE_KEY" -H "Authorization: Bearer $SERVICE_KEY" | jq -r '.[0].name')" = "Secreta de B" ] && echo true || echo false)"

# 4. A puede crear una categoría propia
CREATE_A=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$SUPABASE_URL/rest/v1/categories" \
  -H "apikey: $ANON_KEY" -H "Authorization: Bearer $JWT_A" -H "Content-Type: application/json" \
  -d "{\"family_id\":\"$FAM_A\",\"name\":\"De A\",\"color\":\"#00ff00\",\"type\":\"materia\"}")
check "A puede crear una categoría en su propia familia" "$([ "$CREATE_A" = "201" ] && echo true || echo false)"

# 5. A NO puede crear una categoría spoofeando family_id de B
CREATE_SPOOF=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$SUPABASE_URL/rest/v1/categories" \
  -H "apikey: $ANON_KEY" -H "Authorization: Bearer $JWT_A" -H "Content-Type: application/json" \
  -d "{\"family_id\":\"$FAM_B\",\"name\":\"Intento de spoof\",\"color\":\"#000000\",\"type\":\"materia\"}")
check "A no puede insertar spoofeando family_id de B" "$([ "$CREATE_SPOOF" = "403" ] && echo true || echo false)"

echo ""
echo "$PASS pasaron, $FAIL fallaron."
[ "$FAIL" = "0" ]
