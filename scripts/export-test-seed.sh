#!/bin/sh
set -eu

. scripts/test-db.sh

if [ "$#" -ne 0 ]; then
  echo 'Usage: corepack yarn dev:export-test-seed' >&2
  exit 2
fi

lock_test_db
seed=scripts/test-seed.sql
merge_db="placecount_export_$$"
cleanup() {
  if [ "${merge_created:-}" ]; then
    drop_db "$merge_db" >/dev/null || true
  fi
  if [ "${work_dir:-}" ]; then
    rm -rf "$work_dir"
  fi
  unlock_test_db
}
trap cleanup EXIT
trap 'exit 130' INT
trap 'exit 143' HUP TERM

if ! source_db=$(compose exec -T dev-app printenv POSTGRES_DATABASE 2>/dev/null); then
  echo 'Start development with corepack yarn dev:run before exporting the seed.' >&2
  exit 1
fi
# Also allow an app still using the previous development database to export before restarting.
case "$source_db" in
  "$working_db"|placecount_dev_run) ;;
  *) echo 'dev-app is connected to an unexpected database.' >&2; exit 1 ;;
esac

work_dir=$(mktemp -d scripts/.seed-export.XXXXXX)
cp "$seed" "$work_dir/original.sql"
dump_rows "$source_db" > "$work_dir/new-rows.sql"
create_db "$merge_db"
merge_created=yes

# Keep both the handwritten seed and rows from previous exports.
# The dump uses ON CONFLICT DO NOTHING, so rows already in the seed take precedence.
load_seed "$merge_db" "$work_dir/original.sql" >/dev/null
load_seed "$merge_db" "$work_dir/new-rows.sql" >/dev/null

awk '
  /^-- BEGIN EXPORTED DATABASE ROWS \(generated\) --$/ { generated = 1; next }
  /^-- END EXPORTED DATABASE ROWS \(generated\) --$/ { generated = 0; next }
  !generated { print }
' "$work_dir/original.sql" > "$work_dir/merged.sql"
printf '%s\n' '-- BEGIN EXPORTED DATABASE ROWS (generated) --' >> "$work_dir/merged.sql"
dump_rows "$merge_db" >> "$work_dir/merged.sql"
printf '%s\n' '-- END EXPORTED DATABASE ROWS (generated) --' >> "$work_dir/merged.sql"

if ! cmp -s "$seed" "$work_dir/original.sql"; then
  echo 'The seed changed during export. Run the export again against the updated file.' >&2
  exit 1
fi
mv "$work_dir/merged.sql" "$seed"
printf 'Merged rows from %s into %s.\n' "$source_db" "$seed"
