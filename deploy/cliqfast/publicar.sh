#!/usr/bin/env bash
# Publica a Reunião CliqFast na VPS da CliqGestão (alias SSH em MEET_VPS, padrão cliqgestao-vps).
#   publicar.sh            prévia do que o rsync enviaria (nada muda)
#   publicar.sh --apply    envia o código e reconstrói/sobe os serviços
#   publicar.sh status     contêineres e saúde
#   publicar.sh logs [svc] últimas linhas
#   publicar.sh migrate    migrações do Django
# Código em /opt/meet/code; segredos em /opt/meet/config/.env (nunca vão pelo rsync); banco e backups em volumes.
set -euo pipefail
VPS="${MEET_VPS:-cliqgestao-vps}"
DIR="${MEET_DIR:-/opt/meet}"
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
COMPOSE="cd $DIR/code && docker compose -p meet -f deploy/cliqfast/compose.yaml"
EXCLUDES=(--exclude .git --exclude node_modules --exclude .venv --exclude __pycache__ --exclude '*.pyc' --exclude .pytest_cache
  --exclude .ruff_cache --exclude dist --exclude build --exclude coverage --exclude '.env' --exclude '.env.*' --exclude 'env.d/development'
  --exclude '*.pem' --exclude '*.key' --exclude data --exclude '*.dump' --exclude '*.sql.gz' --exclude .devenv --exclude .direnv)
sync() { rsync -az "$@" "${EXCLUDES[@]}" "$ROOT/" "$VPS:$DIR/code/"; }
case "${1:-}" in
  --apply)
    ssh "$VPS" "mkdir -p $DIR/code $DIR/config && test -f $DIR/config/.env" || { echo "Falta $DIR/config/.env na VPS." >&2; exit 1; }
    sync
    ssh "$VPS" "$COMPOSE up -d --build --remove-orphans </dev/null && $COMPOSE ps"
    ;;
  status) ssh "$VPS" "$COMPOSE ps </dev/null" ;;
  logs) ssh "$VPS" "$COMPOSE logs --tail=${3:-80} ${2:-} </dev/null" ;;
  migrate) ssh "$VPS" "$COMPOSE exec -T backend python manage.py migrate </dev/null" ;;
  "") sync --dry-run --itemize-changes | grep -v '/$' | head -200; echo "(prévia: rode com --apply para enviar)" ;;
  *) sed -n '2,8p' "$0"; exit 1 ;;
esac
