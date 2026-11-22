#!/bin/sh
set -eu

. scripts/test-db.sh

mode=${1:-}
case "$mode" in
  local|watch|container|dev|reset) ;;
  *)
    echo 'Usage: sh scripts/with-test-db.sh {local|watch|container|dev|reset} [command ...]' >&2
    exit 2
    ;;
esac
shift

lock_test_db
template="placecount_seed_$$"
cleanup() {
  if [ "${template_created:-}" ]; then
    drop_db "$template" >/dev/null || true
  fi
  unlock_test_db
}
trap cleanup EXIT
trap 'exit 130' INT
trap 'exit 143' HUP TERM

if [ "$mode" != dev ]; then
  running_dev=$(compose ps --status running --quiet dev-app)
  if [ -n "$running_dev" ]; then
    echo 'Development is using the shared database. Export any changes and stop dev-app before running tests or resetting the database.' >&2
    exit 1
  fi
fi
start_test_db

# Validate the seed before replacing the original and its working copy.
create_db "$template"
template_created=yes
load_seed "$template" scripts/test-seed.sql >/dev/null
if [ "$mode" = dev ]; then
  compose stop dev-app
fi
drop_db "$working_db" >/dev/null
drop_db "$original_db" >/dev/null
psql_db postgres -c "ALTER DATABASE \"$template\" RENAME TO \"$original_db\"" >/dev/null
template_created=
create_db --template="$original_db" "$working_db"
printf 'Loaded %s from scripts/test-seed.sql and cloned it to %s.\n' "$original_db" "$working_db"

case "$mode" in
  local|watch)
    export POSTGRES_HOST=127.0.0.1 POSTGRES_PORT=5432
    export POSTGRES_USER=placecount_test POSTGRES_DATABASE="$working_db"
    ;;
esac

if [ "$#" -gt 0 ]; then
  "$@"
fi
