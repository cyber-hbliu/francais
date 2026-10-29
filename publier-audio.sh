#!/bin/zsh
# Uploads your own recordings of the three books to a PRIVATE GitHub repository,
# so the hosted site can play them on every device that has an audio token:
#   audio/comm/  Communication progressive (CD tracks: 04.mp3 = track 4)
#   audio/gram/  Grammaire progressive
#   audio/voc/   Vocabulaire progressif
# The public site repository never contains these files (they are in .gitignore).
# They are copied into a separate folder, .audio-prive/, which is the private repository.
set -e
REPO="cyber-hbliu/francais-audio"
ROOT="$(cd "$(dirname "$0")" && pwd)"
DEPOT="$ROOT/.audio-prive"
mkdir -p "$DEPOT"
for d in comm gram voc; do
  if [ -d "$ROOT/audio/$d" ]; then mkdir -p "$DEPOT/$d"; rsync -a --delete --include='*.mp3' --exclude='*' "$ROOT/audio/$d/" "$DEPOT/$d/"; fi
done
cd "$DEPOT"
if [ ! -d .git ]; then
  git init -q -b main
  printf 'Enregistrements personnels des livres (dépôt privé).\ncomm/, gram/, voc/ : numéro de piste du CD sur deux chiffres (04.mp3 = piste 4).\n' > LISEZMOI.txt
fi
git add -A
git commit -qm "Audio des livres $(date +%F)" || echo "Rien de nouveau à envoyer."
if ! gh repo view "$REPO" >/dev/null 2>&1; then
  gh repo create "$REPO" --private --source=. --push
else
  git remote get-url origin >/dev/null 2>&1 || git remote add origin "https://github.com/$REPO.git"
  git push -u origin main
fi
echo "OK : $(find . -name '*.mp3' -not -path './.git/*' | wc -l | tr -d ' ') fichiers audio dans le dépôt privé $REPO"
