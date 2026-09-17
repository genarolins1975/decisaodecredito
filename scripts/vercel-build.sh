#!/usr/bin/env bash
# Build na Vercel. Com BOOTSTRAP_ON_BUILD=1, antes de compilar: aplica migrações (aditivas, idempotentes),
# garante curso/edição/turma e a conta do professor (sem contas de teste) e importa o conteúdo
# (páginas já importadas não ganham nova versão). Sem a variável, apenas compila.
set -euo pipefail
if [ "${BOOTSTRAP_ON_BUILD:-0}" = "1" ]; then
  echo "bootstrap: migrações"
  npm run --silent db:migrate
  echo "bootstrap: semente (produção, sem contas de teste)"
  NODE_ENV=production SEED_TEST_ACCOUNTS=0 npm run --silent db:seed
  echo "bootstrap: conteúdo"
  npm run --silent content:import
fi
next build
