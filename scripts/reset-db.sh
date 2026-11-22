#!/bin/sh
set -eu

exec sh scripts/with-test-db.sh reset
