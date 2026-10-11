#!/usr/bin/env bash
# check-hosting.sh - read-only checks for the MagnetraPH site in public/.
#   bash .github/scripts/check-hosting.sh local          -> checks the files before a deploy
#   bash .github/scripts/check-hosting.sh <https://site> -> checks that the site serves exactly these files
# Changes nothing. Prints no keys or tokens (only file names, status codes and short hashes).
set -uo pipefail
cd "$(dirname "$0")/../.."
PUB=public
FAIL=0
ok()  { echo "PASS $*"; }
bad() { echo "FAIL $*"; FAIL=1; }

hosted_files() { # every file Firebase serves from public/ (firebase.json ignores *.md and dotfiles)
  (cd "$PUB" && find . -type f ! -name '*.md' ! -path '*/.*' | sed 's|^\./||' | sort)
}

if [ "${1:-}" = "local" ]; then
  for f in index.html login.html create.html dashboard.html firebase-init.js auth-core-shared.js appcheck-shared.js; do
    [ -f "$PUB/$f" ] && ok "present: $f" || bad "missing: $f"
  done
  # Backend-only or private files must never be inside the hosted folder
  leaked=$(cd "$PUB" && find . -type f \( -name 'worker*.js' -o -name '*.rules' -o -name 'firebase.json' -o -name '*.toml' \
            -o -name '.env*' -o -iname '*service*account*' -o -name 'package*.json' \) -o -type d -name functions | head -5)
  [ -z "$leaked" ] && ok "no backend or private files in $PUB/" || bad "backend/private files in $PUB/: $leaked"
  dots=$(cd "$PUB" && find . -mindepth 1 -name '.*' | head -5)
  [ -z "$dots" ] && ok "no dotfiles or dot-folders (.git, .github, .env) in $PUB/" || bad "dotfiles in $PUB/: $dots"
  [ -f .github/scripts/blocked-paths.txt ] && ok "blocked-paths list present ($(grep -vc '^#' .github/scripts/blocked-paths.txt) paths)" || bad "blocked-paths list missing"
  # Every local reference in the pages and scripts points to a real file
  missing=0
  refs=$( { grep -ohE '(src|href)="[^"]+"' "$PUB"/*.html | sed -E 's/^(src|href)="//; s/"$//';
            grep -ohE "[\"'](\./|/)[A-Za-z0-9_.-]+\.(js|css|html|png|svg|txt|json)(\?[^\"']*)?[\"']" "$PUB"/*.js | tr -d "\"'"; } \
          | grep -vE '^(https?:|mailto:|tel:|#|data:|javascript:)' | sed -E 's/[?#].*$//; s|^\./||; s|^/||' | grep -v '^$' | sort -u)
  for r in $refs; do [ -f "$PUB/$r" ] || { bad "broken reference: $r"; missing=1; }; done
  [ $missing -eq 0 ] && ok "all $(echo "$refs" | wc -l) local references resolve"
  # Security wiring must still be present (guards against accidental removal)
  grep -q 'initializeAppCheck' "$PUB/firebase-init.js" && grep -q 'ReCaptchaEnterpriseProvider' "$PUB/firebase-init.js" \
    && ok "App Check (reCAPTCHA Enterprise) still initialised in firebase-init.js" || bad "App Check wiring missing from firebase-init.js"
  grep -q 'X-Firebase-AppCheck' "$PUB/auth-core-shared.js" \
    && ok "API calls still send the App Check token" || bad "App Check header missing from auth-core-shared.js"
  grep -q '"public": "public"' firebase.json && ok "firebase.json serves public/" || bad "firebase.json does not point to public/"
  echo "$(hosted_files | wc -l) files will be hosted"
  exit $FAIL
fi

BASE="${1:?usage: check-hosting.sh local | https://site}"
BASE="${BASE%/}"
case "$BASE" in https://*) ;; *) echo "FAIL site must start with https://"; exit 1;; esac
TMP=$(mktemp -d)
fetch() { # fetch <path> <outfile> -> prints HTTP status; retries while the new release reaches the CDN
  local code=000
  for i in 1 2 3 4 5; do
    code=$(curl -sS -o "$2" -w '%{http_code}' --max-time 30 -H 'Cache-Control: no-cache' "$BASE/$1" 2>/dev/null) || code=000
    case "$code" in 000|5??) sleep 5;; *) break;; esac
  done
  echo "$code"
}
# Wait (up to about 3 minutes) until the new release reaches the CDN: index.html must match this build
for i in $(seq 1 18); do
  [ "$(fetch index.html "$TMP/idx")" = 200 ] && cmp -s "$TMP/idx" "$PUB/index.html" && break
  sleep 10
done
n=0; mism=0
while IFS= read -r f; do
  n=$((n+1)); enc=$(printf '%s' "$f" | sed 's/ /%20/g')
  want=$(sha256sum "$PUB/$f" | cut -c1-64)
  code=$(fetch "$enc" "$TMP/body"); got=$(sha256sum "$TMP/body" | cut -c1-64)
  if [ "$code" = 200 ] && [ "$got" = "$want" ]; then :; else bad "/$f -> HTTP $code, served ${got:0:12} expected ${want:0:12}"; mism=$((mism+1)); fi
done < <(hosted_files)
[ $mism -eq 0 ] && ok "all $n hosted files served with identical content (HTTP 200)"

home=$(fetch "" "$TMP/home"); [ "$home" = 200 ] && cmp -s "$TMP/home" "$PUB/index.html" \
  && ok "/ serves this build's index.html" || bad "/ -> HTTP $home, not this build's index.html"
for p in "dashboard.html" "login.html?verify=1" "followup.html?situation=quote-sent" "create.html"; do
  c=$(fetch "$p" "$TMP/direct"); [ "$c" = 200 ] && ok "direct open / refresh: /$p -> 200" || bad "direct open: /$p -> HTTP $c"
done
for p in "firebase.json" "firestore.rules" "functions/index.js" "functions/package.json" "worker.js" \
         "legacy/README.md" "login%20(1).html" "login-i18n%20(1).js" "css-dashboard%20(1).css" ".github/workflows/firebase-hosting-merge.yml" \
         "public/index.html" "no-such-page-check.html"; do
  c=$(fetch "$p" "$TMP/nf"); [ "$c" = 404 ] && ok "not served: /$p -> 404" || bad "should not be served: /$p -> HTTP $c"
done
# Every path in blocked-paths.txt (incl. the 79 files the 21 Sep release exposed) must return 404.
# HEAD only: if a path were still exposed, its content is never downloaded. A 200 "home page" answer also fails.
head_status() {
  local code=000
  for i in 1 2 3; do
    code=$(curl -sS -I -o /dev/null -w '%{http_code}' --max-time 20 -H 'Cache-Control: no-cache' "$BASE/$1" 2>/dev/null) || code=000
    case "$code" in 000|5??) sleep 3;; *) break;; esac
  done
  echo "$code"
}
bn=0; bfail=0
while IFS= read -r p; do
  case "$p" in ''|'#'*) continue;; esac
  bn=$((bn+1)); enc=$(printf '%s' "${p#/}" | sed 's/ /%20/g')
  c=$(head_status "$enc"); [ "$c" = 404 ] || { bad "blocked path served: $p -> HTTP $c"; bfail=$((bfail+1)); }
done < .github/scripts/blocked-paths.txt
[ $bfail -eq 0 ] && ok "all $bn blocked paths return 404 (.git, .github, rules, Android, backend, legacy)"
rm -rf "$TMP"
exit $FAIL
