#!/bin/sh
# Backup diário do banco do Meet (pg_dump comprimido) no volume meet-backups, mantendo os últimos BACKUP_KEEP_DAYS dias.
# Usuário, senha e banco vêm do mesmo .env do Postgres (POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB).
set -eu
export PGUSER="${POSTGRES_USER}" PGPASSWORD="${POSTGRES_PASSWORD}" PGDATABASE="${POSTGRES_DB}"
KEEP="${BACKUP_KEEP_DAYS:-14}"
HOUR="${BACKUP_HOUR:-6}"
while true; do
  if [ "$(date -u +%H)" = "$(printf '%02d' "$HOUR")" ] && [ ! -f "/backups/.feito-$(date -u +%Y%m%d)" ]; then
    file="/backups/meet-$(date -u +%Y%m%d-%H%M).dump"
    if pg_dump --format=custom --compress=9 --file="$file.tmp"; then
      mv "$file.tmp" "$file"
      touch "/backups/.feito-$(date -u +%Y%m%d)"
      find /backups -name 'meet-*.dump' -mtime +"$KEEP" -delete
      find /backups -name '.feito-*' -mtime +2 -delete
      echo "backup ok: $file"
    else
      rm -f "$file.tmp"
      echo "backup FALHOU" >&2
    fi
  fi
  sleep 600
done
