#!/bin/sh

original_db=placecount_test
working_db=placecount_test_run
db_lock=scripts/.test-db-lock

lock_test_db() {
  if ! mkdir "$db_lock" 2>/dev/null; then
    echo 'Another development, test or export command holds the database lock.' >&2
    exit 1
  fi
}

unlock_test_db() {
  rmdir "$db_lock"
}

compose() {
  docker compose --profile test "$@"
}

start_test_db() {
  compose up -d --wait test-db
}

psql_db() {
  database=$1
  shift
  compose exec -T test-db psql -X -v ON_ERROR_STOP=1 \
    -U placecount_test -d "$database" "$@"
}

create_db() {
  compose exec -T test-db createdb -U placecount_test "$@"
}

drop_db() {
  compose exec -T test-db dropdb -U placecount_test --if-exists --force "$1"
}

load_seed() {
  psql_db "$1" --single-transaction --file=- < "$2"
}

dump_rows() {
  compose exec -T test-db pg_dump -U placecount_test -d "$1" \
    --no-owner --no-privileges --data-only --column-inserts \
    --on-conflict-do-nothing
}
