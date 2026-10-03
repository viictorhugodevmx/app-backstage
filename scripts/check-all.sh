#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")/.."

export LOCAL_UID="$(id -u)"
export LOCAL_GID="$(id -g)"

printf '\n=== Node: formato, lint, tipos y tests ===\n'
docker compose run --rm -T tooling pnpm check </dev/null

printf '\n=== Node: builds ===\n'
docker compose run --rm -T tooling pnpm build </dev/null

printf '\n=== Flask: construir imagen ===\n'
docker compose build webhooks </dev/null

printf '\n=== Flask: dependencias ===\n'
docker compose run --rm -T webhooks \
  python -m pip check </dev/null

printf '\n=== Flask: tests ===\n'
docker compose run --rm -T webhooks \
  python -m pytest -p no:cacheprovider </dev/null

printf '\n=== Git: espacios y conflictos de parche ===\n'
git diff --check

printf '\nVERIFICACIÓN GENERAL COMPLETADA\n'
