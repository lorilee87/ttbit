#!/usr/bin/env bash
# Testa, empacota e envia a versão pronta para a branch gh-pages (GitHub Pages).
set -euo pipefail
cd "$(dirname "$0")/.."
npm test
npm run build
touch dist/.nojekyll
REMOTE=$(git remote get-url origin)
cd dist
rm -rf .git
git init -q -b gh-pages
git add -A
git commit -qm "publica $(date +%Y-%m-%d\ %H:%M)"
git push -qf "$REMOTE" gh-pages
rm -rf .git
echo "Publicado."
