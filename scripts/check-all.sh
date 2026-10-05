#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")/.."

export LOCAL_UID="$(id -u)"
export LOCAL_GID="$(id -g)"

printf '\n=== Compose: configuración ===\n'
docker compose --env-file .env config --quiet

printf '\n=== Node: formato, lint, tipos y tests ===\n'
docker compose --env-file .env run --rm -T tooling \
  pnpm check </dev/null

printf '\n=== Node: builds ===\n'
docker compose --env-file .env run --rm -T tooling \
  pnpm build </dev/null

printf '\n=== PostgreSQL: conexiones ===\n'
for command in db:check db:check:test; do
  docker compose --env-file .env run --rm -T db-tools \
    pnpm --filter @backstage/api "$command" </dev/null
done

printf '\n=== PostgreSQL: tests ===\n'
docker compose --env-file .env run --rm -T db-tools \
  pnpm --filter @backstage/api test:database </dev/null

printf '\n=== Flask: imagen y dependencias ===\n'
docker compose --env-file .env build webhooks </dev/null
docker compose --env-file .env run --rm -T webhooks \
  python -m pip check </dev/null

printf '\n=== Flask: tests ===\n'
docker compose --env-file .env run --rm -T webhooks \
  python -m pytest -p no:cacheprovider </dev/null

printf '\n=== API: disponibilidad con PostgreSQL real ===\n'
trap 'docker compose --env-file .env stop api >/dev/null' EXIT

docker compose --env-file .env up \
  -d --wait --wait-timeout 180 api </dev/null

curl --fail-with-body --max-time 15 -sS \
  http://127.0.0.1:3001/health/ready
printf '\n'

docker compose --env-file .env stop api </dev/null
trap - EXIT

printf '\n=== Git: espacios ===\n'
git --no-pager diff --check

printf '\nVERIFICACIÓN GENERAL COMPLETADA\n'
