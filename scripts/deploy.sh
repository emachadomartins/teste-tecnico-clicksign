#!/usr/bin/env bash
# Publica no servidor a versão que está no GitHub (branch main).
# Uso: make deploy  (ou DEPLOY_HOST=outro-host make deploy)
set -euo pipefail

DEPLOY_HOST="${DEPLOY_HOST:-evandro-home-server}"
DEPLOY_PATH="${DEPLOY_PATH:-/opt/teste-tecnico-clicksign}"
PUBLIC_URL="${PUBLIC_URL:-https://evandro-home-server.tyrannosaurus-quillback.ts.net}"

step() { printf '\n\033[1;35m==> %s\033[0m\n' "$1"; }

# Roda sempre a partir da raiz do projeto, de qualquer pasta
cd "$(dirname "$0")/.."

step "Conferindo se tudo foi enviado ao GitHub"
git fetch --quiet origin main
if [ -n "$(git log origin/main..main --oneline)" ]; then
  echo "Há commits na main local que não estão no GitHub. Rode git push antes." >&2
  exit 1
fi
if [ -n "$(git status --porcelain)" ]; then
  echo "Aviso: há alterações não commitadas. Elas não vão para o servidor."
fi

step "Enviando os .env.production"
# Os .env.production ficam só na sua máquina (fora do git). Cada um é gravado
# como .env na pasta correspondente do servidor: ./.env.production vira
# $DEPLOY_PATH/.env, ./api/.env.production vira $DEPLOY_PATH/api/.env, etc.
env_files=$(find . -maxdepth 2 -name .env.production -not -path '*/node_modules/*' | sort)
if [ -z "$env_files" ]; then
  echo "Nenhum .env.production local: o servidor continua com os .env que já tem."
fi
for file in $env_files; do
  dir=$(dirname "${file#./}")
  target="$DEPLOY_PATH/$dir/.env"
  [ "$dir" = "." ] && target="$DEPLOY_PATH/.env"
  # Gravado com permissão 600: só o seu usuário no servidor consegue ler
  ssh "$DEPLOY_HOST" "umask 077 && cat > $target" < "$file"
  echo "${file#./} → $target"
done

step "Atualizando o servidor ($DEPLOY_HOST)"
ssh "$DEPLOY_HOST" bash -s <<EOF
set -euo pipefail
cd $DEPLOY_PATH
git pull --ff-only origin main
docker compose up -d --build --wait
docker image prune -f
tailscale funnel --bg 5000
tailscale funnel --bg --set-path /docs 4000
tailscale funnel --bg --set-path /api 3000
EOF

step "Conferindo os endereços públicos"
failed=0
for path in / /docs/ /api/project; do
  code=$(curl -s -o /dev/null -m 15 -w '%{http_code}' "$PUBLIC_URL$path" || true)
  echo "$path → $code"
  [ "$code" = 200 ] || failed=1
done

if [ "$failed" = 1 ]; then
  echo "Algum endereço não respondeu. Veja os logs com: ssh $DEPLOY_HOST 'cd $DEPLOY_PATH && docker compose logs --tail 50'" >&2
  exit 1
fi

step "Deploy concluído: $PUBLIC_URL"
