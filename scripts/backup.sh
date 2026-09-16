#!/usr/bin/env bash
# Backup do banco (pg_dump custom) E dos arquivos privados (tar). Uso: scripts/backup.sh [destino]
set -euo pipefail
DEST="${1:-backups}"; STAMP=$(date -u +%Y%m%dT%H%M%SZ); mkdir -p "$DEST"
: "${DATABASE_URL:?defina DATABASE_URL}"
STORAGE_DIR="${STORAGE_LOCAL_DIR:-./storage}"
pg_dump --format=custom --no-owner --no-privileges "$DATABASE_URL" > "$DEST/db-$STAMP.dump"
if [ "${STORAGE_DRIVER:-local}" = "local" ]; then tar -czf "$DEST/files-$STAMP.tar.gz" -C "$(dirname "$STORAGE_DIR")" "$(basename "$STORAGE_DIR")"; else echo "STORAGE_DRIVER=$STORAGE_DRIVER: faça o backup do bucket com a ferramenta do provedor (versionamento/replicação)"; fi
sha256sum "$DEST"/*-"$STAMP".* > "$DEST/manifest-$STAMP.sha256"
echo "backup concluído: $DEST/db-$STAMP.dump $( [ -f "$DEST/files-$STAMP.tar.gz" ] && echo "$DEST/files-$STAMP.tar.gz" )"
