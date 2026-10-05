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
