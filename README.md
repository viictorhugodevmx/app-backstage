# Backstage

Aplicación para coordinar la producción de eventos.

## Estado actual

Preparación local con Next.js, NestJS sobre Fastify y Flask.
Incluye contenedores de desarrollo y pruebas iniciales.
Las funcionalidades de negocio se implementarán en los siguientes pasos.

## Entorno

- Node 22.19.0.
- pnpm 12.8.1.
- Docker Engine y Docker Compose.
- Git y GitHub CLI.

## Preparación

```bash
export LOCAL_UID="$(id -u)"
export LOCAL_GID="$(id -g)"

docker compose build tooling webhooks

docker compose run --rm -T tooling \
  pnpm install --frozen-lockfile \
  --store-dir /workspace/.cache/pnpm-store
```

## Desarrollo

```bash
export LOCAL_UID="$(id -u)"
export LOCAL_GID="$(id -g)"

docker compose up api web webhooks
```

Con poca memoria disponible, ejecutar un servicio a la vez.

| Servicio    | Dirección                    |
| ----------- | ---------------------------- |
| Web         | http://localhost:3000        |
| Salud API   | http://localhost:3001/health |
| Salud Flask | http://localhost:3002/health |

Ctrl+C detiene los servicios iniciados en primer plano.

## Verificación

Desde Ubuntu, en la raíz del proyecto:

```bash
bash scripts/check-all.sh
```

Comprueba formato, lint, tipos, pruebas JavaScript, builds,
dependencias Python, pruebas Flask y espacios de Git.

## Estructura

- apps/web: frontend Next.js.
- apps/api: API NestJS y Fastify.
- apps/webhooks: servicio Flask.
- packages: futuros paquetes compartidos.
- infra: infraestructura.
- scripts: comandos generales.

## Configuración

Los archivos .env.example documentan las variables.
Los archivos privados .env quedan fuera de Git.
Actualmente Compose proporciona las variables necesarias.
Nest todavía no carga automáticamente archivos .env.

## Documentación

- PROJECT.md: objetivo y alcance.
- BLUEPRINT.md: ruta de implementación.
- DECISIONS.md: decisiones técnicas.
- STATUS.md: avances y pendientes.

Las imágenes actuales son de desarrollo y pruebas.

## PostgreSQL local

PostgreSQL 17.11 utiliza un volumen persistente administrado por Compose.

| Uso        | Base           | Usuario        |
| ---------- | -------------- | -------------- |
| Desarrollo | backstage      | backstage_app  |
| Pruebas    | backstage_test | backstage_test |

Desde Ubuntu: localhost:5433.
Desde los contenedores: db:5432.

Las contraseñas locales se conservan en .env, fuera de Git.

### Comandos de base

Desde la raíz del repositorio, después de instalar dependencias:

```bash
export LOCAL_UID="$(id -u)"
export LOCAL_GID="$(id -g)"

docker compose --env-file .env up -d --wait db

docker compose --env-file .env exec -T db \
  psql -U backstage_admin -d postgres \
  -v ON_ERROR_STOP=1 < infra/db/provision.sql

docker compose --env-file .env run --rm -T tooling \
  pnpm --filter @backstage/api build

docker compose --env-file .env run --rm -T db-tools \
  pnpm --filter @backstage/api db:migrate

docker compose --env-file .env run --rm -T db-tools \
  pnpm --filter @backstage/api db:migrate:test

docker compose --env-file .env run --rm -T db-tools \
  pnpm --filter @backstage/api db:seed

docker compose --env-file .env run --rm -T db-tools \
  pnpm --filter @backstage/api test:database
```

Antes de provisionar en una instalación nueva, preparar en .env las
variables DB_ADMIN_PASSWORD, DB_APP_PASSWORD y DB_TEST_PASSWORD.

El seed conserva los eventos existentes y no duplica sus slugs.
Las migraciones aplicadas no deben modificarse ni eliminarse.

### Salud y disponibilidad

- /health: comprueba que la API responde.
- /health/ready: consulta PostgreSQL y devuelve 503 si falla.

El script de auditoría inicia y detiene la API para comprobar disponibilidad.
PostgreSQL queda funcionando después de la auditoría.

Para detener la base sin borrar sus datos:

```bash
docker compose stop db
```

## API de eventos

| Método | Ruta               | Operación             |
| ------ | ------------------ | --------------------- |
| GET    | /events            | Listado paginado      |
| GET    | /events/:id        | Detalle por UUID      |
| POST   | /events            | Crear en estado draft |
| PATCH  | /events/:id        | Editar campos         |
| POST   | /events/:id/cancel | Cancelar              |

### Listado

Parámetros opcionales:

- page: 1–10000; predeterminado 1.
- limit: 1–100; predeterminado 20.
- status: draft, planning, ready, live, completed o cancelled.

Respuesta: items, total, page y limit.

### Crear un evento

```json
{
  "slug": "evento-de-ejemplo",
  "title": "Evento de ejemplo",
  "description": "Producción ficticia.",
  "venue": "Foro de ejemplo",
  "city": "Tuxtla",
  "startsAt": "2026-12-01T18:00:00-06:00",
  "endsAt": "2026-12-01T22:00:00-06:00",
  "capacity": 100
}
```

Las fechas requieren zona horaria.
La fecha final debe ser posterior a la inicial.
El estado inicial se establece en el servidor.

### Editar y cancelar

PATCH acepta únicamente los campos que se desean cambiar.
Los campos omitidos se conservan.
Se rechazan ediciones vacías, valores null y campos desconocidos.

La cancelación repetida devuelve el evento ya cancelado.
Un evento completed no puede cancelarse.

### Respuestas

- 200: lectura, edición o cancelación correctas.
- 201: evento creado.
- 400: entrada inválida.
- 404: evento inexistente.
- 409: slug duplicado o conflicto de cancelación.

### Comprobación HTTP

Con la API funcionando:

```bash
node scripts/smoke-events.mjs
```

El script crea un evento ficticio, lo edita y lo deja cancelado.
Cada ejecución crea su propio evento de evidencia.

La autenticación y autorización se incorporan en el Paso 3.

## API de eventos

| Método | Ruta               | Operación             |
| ------ | ------------------ | --------------------- |
| GET    | /events            | Listado paginado      |
| GET    | /events/:id        | Detalle por UUID      |
| POST   | /events            | Crear en estado draft |
| PATCH  | /events/:id        | Editar campos         |
| POST   | /events/:id/cancel | Cancelar              |

### Listado

Parámetros opcionales:

- page: 1–10000; predeterminado 1.
- limit: 1–100; predeterminado 20.
- status: draft, planning, ready, live, completed o cancelled.

Respuesta: items, total, page y limit.

### Crear un evento

```json
{
  "slug": "evento-de-ejemplo",
  "title": "Evento de ejemplo",
  "description": "Producción ficticia.",
  "venue": "Foro de ejemplo",
  "city": "Tuxtla",
  "startsAt": "2026-12-01T18:00:00-06:00",
  "endsAt": "2026-12-01T22:00:00-06:00",
  "capacity": 100
}
```

Las fechas requieren zona horaria.
La fecha final debe ser posterior a la inicial.
El estado inicial se establece en el servidor.

### Editar y cancelar

PATCH acepta únicamente los campos que se desean cambiar.
Los campos omitidos se conservan.
Se rechazan ediciones vacías, valores null y campos desconocidos.

La cancelación repetida devuelve el evento ya cancelado.
Un evento completed no puede cancelarse.

### Respuestas

- 200: lectura, edición o cancelación correctas.
- 201: evento creado.
- 400: entrada inválida.
- 404: evento inexistente.
- 409: slug duplicado o conflicto de cancelación.

### Comprobación HTTP

Con la API funcionando:

```bash
node scripts/smoke-events.mjs
```

El script crea un evento ficticio, lo edita y lo deja cancelado.
Cada ejecución crea su propio evento de evidencia.

La autenticación y autorización se incorporan en el Paso 3.

## Autenticación y autorización

Backstage utiliza Auth0 con una aplicación Regular Web Application.

- /account permite iniciar y cerrar sesión.
- /events consulta eventos desde el servidor de Next.js.
- Next.js envía un access token a NestJS.
- NestJS verifica RS256, emisor, audiencia, expiración y permisos.
- Los endpoints de salud permanecen públicos.
- Los endpoints de eventos requieren autenticación.
- HTTP 401 indica token ausente, inválido o vencido.
- HTTP 403 indica permisos insuficientes.

### Roles

| Rol                | Permisos                                                 |
| ------------------ | -------------------------------------------------------- |
| backstage-viewer   | read:events                                              |
| backstage-producer | read:events, create:events, update:events                |
| backstage-admin    | read:events, create:events, update:events, cancel:events |

La aplicación debe tener User-Delegated Access autorizado para la API.
La API debe tener RBAC habilitado y agregar permisos al access token.

### Variables locales

Next.js carga apps/web/.env.local.
El ejemplo se encuentra en apps/web/.env.example.

NestJS recibe AUTH0_DOMAIN y AUTH0_AUDIENCE desde Docker Compose.
La audiencia configurada es https://backstage.local/api.

Los Client Secrets, secretos de sesión y tokens no se versionan.

### Verificación

scripts/check-all.sh ejecuta las comprobaciones automáticas.

scripts/smoke-events.mjs requiere las variables temporales
BACKSTAGE_SMOKE_ADMIN_TOKEN y BACKSTAGE_SMOKE_VIEWER_TOKEN.

El smoke crea un evento ficticio y lo deja cancelado.
Cada ejecución crea un nuevo evento de evidencia.

La ruta /auth/access-token está deshabilitada por defecto.
Para el smoke puede habilitarse temporalmente en desarrollo con
AUTH0_ENABLE_ACCESS_TOKEN_ENDPOINT=true y reiniciando el frontend.
Después debe deshabilitarse y reiniciarse nuevamente.
En producción permanece deshabilitada.

El procedimiento de cierre utiliza un reporte en .cache/verification.
