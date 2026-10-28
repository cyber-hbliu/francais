#!/bin/zsh
# Uploads your own book recordings (audio/comm/) to a PRIVATE GitHub repository,
# so the hosted site can play them on every device that has an audio token.
# The public site repository never contains these files (audio/comm/ is in .gitignore).
set -e
REPO="cyber-hbliu/francais-audio"
cd "$(dirname "$0")/audio/comm"
if [ ! -d .git ]; then
  git init -q -b main
  printf 'Enregistrements personnels du livre (dépôt privé).\nNoms : numéro de piste du CD, sur deux chiffres (04.mp3 = piste 4).\n' > LISEZMOI.txt
fi
git add -A
git commit -qm "Audio du livre $(date +%F)" || echo "Rien de nouveau à envoyer."
if ! gh repo view "$REPO" >/dev/null 2>&1; then
  gh repo create "$REPO" --private --source=. --push
else
  git remote get-url origin >/dev/null 2>&1 || git remote add origin "https://github.com/$REPO.git"
  git push -u origin main
fi
echo "OK : $(ls *.mp3 2>/dev/null | wc -l | tr -d ' ') fichiers audio dans le dépôt privé $REPO"
