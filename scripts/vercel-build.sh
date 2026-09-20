#!/usr/bin/env bash
# Build na Vercel. Com BOOTSTRAP_ON_BUILD=1, antes de compilar: aplica migrações (aditivas, idempotentes),
# garante curso/edição/turma e a conta do professor (sem contas de teste) e importa o conteúdo
# (páginas já importadas não ganham nova versão). Sem a variável, apenas compila.
#
# Trava de ambiente: o bootstrap escreve no banco de DATABASE_URL. Quando um Preview herda a
# DATABASE_URL de produção, um build passa a migrar e semear a base real. Por isso, fora de
# produção o bootstrap só roda com BOOTSTRAP_ALLOW_PREVIEW=1, definida no ambiente que tiver
# banco próprio. VERCEL_ENV ausente significa build fora da Vercel, onde quem chama decide.
set -euo pipefail

bootstrap="${BOOTSTRAP_ON_BUILD:-0}"

if [ "$bootstrap" = "1" ] && [ -n "${VERCEL_ENV:-}" ] && [ "$VERCEL_ENV" != "production" ] &&
   [ "${BOOTSTRAP_ALLOW_PREVIEW:-0}" != "1" ]; then
  echo "bootstrap: ignorado em VERCEL_ENV=$VERCEL_ENV, para não escrever no banco de produção."
  echo "bootstrap: confirme que DATABASE_URL deste ambiente aponta para um banco próprio"
  echo "bootstrap: e então defina BOOTSTRAP_ALLOW_PREVIEW=1 nele."
  bootstrap="0"
fi

if [ "$bootstrap" = "1" ]; then
  echo "bootstrap: migrações"
  npm run --silent db:migrate
  echo "bootstrap: semente (produção, sem contas de teste)"
  NODE_ENV=production SEED_TEST_ACCOUNTS=0 npm run --silent db:seed
  echo "bootstrap: conteúdo"
  npm run --silent content:import
fi
next build
