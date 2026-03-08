#!/bin/sh
set -eu

if [ "${RUN_DB_MIGRATIONS:-true}" = "true" ]; then
	if [ -z "${DATABASE_URL:-}" ]; then
		echo "DATABASE_URL is required when RUN_DB_MIGRATIONS=true" >&2
		exit 1
	fi

	atlas migrate apply \
		--allow-dirty \
		--dir "file:///app/packages/db/migrations" \
		--url "${DATABASE_URL}"
fi

exec /app/server
