#!/bin/sh
set -eu

if [ "${RUN_DB_MIGRATIONS:-true}" = "true" ]; then
	atlas migrate apply \
		--allow-dirty \
		--dir "file:///app/packages/db/migrations" \
		--url "env://DATABASE_URL"
fi

exec /app/server
