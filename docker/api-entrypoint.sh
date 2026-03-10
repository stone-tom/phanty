#!/bin/sh
set -eu

if [ "${RUN_DB_MIGRATIONS:-true}" = "true" ] || [ "${RUN_AUTH_SEED:-false}" = "true" ]; then
	if [ -z "${DATABASE_URL:-}" ]; then
		echo "DATABASE_URL is required when RUN_DB_MIGRATIONS=true or RUN_AUTH_SEED=true" >&2
		exit 1
	fi
fi

if [ "${RUN_DB_MIGRATIONS:-true}" = "true" ]; then

	atlas migrate apply \
		--allow-dirty \
		--dir "file:///app/packages/db/migrations" \
		--url "${DATABASE_URL}"
fi

if [ "${RUN_AUTH_SEED:-false}" = "true" ]; then
	/app/auth-seed
fi

RUN_AUTH_SEED=false exec /app/server
