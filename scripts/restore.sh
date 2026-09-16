#!/usr/bin/env bash
# Restauração em banco de destino (nunca em produção sem janela combinada). Uso: scripts/restore.sh <db.dump> [files.tar.gz] [DATABASE_URL_DESTINO]
set -euo pipefail
DUMP="${1:?informe o arquivo .dump}"; FILES="${2:-}"; TARGET="${3:-${RESTORE_DATABASE_URL:-}}"
: "${TARGET:?defina RESTORE_DATABASE_URL ou passe a URL de destino como 3º argumento}"
pg_restore --clean --if-exists --no-owner --no-privileges --dbname="$TARGET" "$DUMP"
if [ -n "$FILES" ]; then DEST="${STORAGE_LOCAL_DIR:-./storage}"; mkdir -p "$DEST"; tar -xzf "$FILES" -C "$(dirname "$DEST")"; fi
echo "restauração concluída em $TARGET"
