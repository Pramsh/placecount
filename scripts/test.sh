#!/bin/sh
set -eu

exec sh scripts/with-test-db.sh container \
  docker compose --profile test run --build --rm -e NODE_ENV=test dev-app node --test "$@"
