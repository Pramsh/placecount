#!/bin/sh
set -eu

exec sh scripts/with-test-db.sh dev \
  docker compose --profile test up --build -d dev-app
