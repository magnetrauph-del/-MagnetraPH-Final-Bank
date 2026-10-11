#!/usr/bin/env bash
# worker-blackbox.sh - READ-ONLY outside view of the DEPLOYED Worker (magnetra-live-api).
# Only OPTIONS (CORS preflight) and GET requests: nothing that can write or delete data. No tokens are sent.
# Expected for Worker v3: preflight 204 + Allow-Origin echoed ONLY for the 4 production origins; GET without
# login -> 401 {"error":"Unauthorized"}; no-store + nosniff headers.
set -uo pipefail
W=${WORKER_URL:-https://magnetra-live-api.magnetrauph.workers.dev}
out=()
pre() { # origin -> "status allow-origin"
  local h; h=$(curl -sS -o /dev/null -D - -X OPTIONS -H "Origin: $1" -H 'Access-Control-Request-Method: POST' \
    -H 'Access-Control-Request-Headers: content-type,authorization,x-firebase-appcheck' "$W/api/signup" | tr -d '\r')
  echo "$(echo "$h" | awk 'toupper($1) ~ /^HTTP/ {print $2; exit}') $(echo "$h" | awk -F': ' 'tolower($1)=="access-control-allow-origin"{print $2}')"
}
ok_all=1
for o in https://magnetra.app https://www.magnetra.app https://magnetra-ultra.web.app https://magnetra-ultra.firebaseapp.com; do
  r=$(pre "$o"); s=${r%% *}; a=${r#* }
  if [ "$a" = "$o" ]; then v="OK"; else v="NOT ALLOWED"; ok_all=0; fi
  out+=("intended  $o -> preflight $s, Allow-Origin: ${a:-none}  [$v]")
done
leak=0
for o in https://magnetra.vercel.app https://magnetra-ultra--release-check-qagxb0c0.web.app http://magnetra.app https://magnetra.app.evil.example https://example.com null; do
  r=$(pre "$o"); s=${r%% *}; a=${r#* }
  if [ -z "$a" ] || [ "$a" = "$s" ]; then v="refused"; a=""; else v="ANSWERED WITH ALLOW-ORIGIN"; leak=1; fi
  out+=("other     $o -> preflight $s, Allow-Origin: ${a:-none}  [$v]")
done
g=$(curl -sS -D "$RUNNER_TEMP/h1" "$W/api/signup" | head -c 60 | tr -d '\r\n%'); gs=$(awk 'toupper($1) ~ /^HTTP/ {print $2; exit}' "$RUNNER_TEMP/h1")
cc=$(awk -F': ' 'tolower($1)=="cache-control"{print $2}' "$RUNNER_TEMP/h1" | tr -d '\r'); xc=$(awk -F': ' 'tolower($1)=="x-content-type-options"{print $2}' "$RUNNER_TEMP/h1" | tr -d '\r')
u=$(curl -sS -o /dev/null -w '%{http_code}' "$W/api/does-not-exist")
hb=$(curl -sS "$W/" | head -c 60 | tr -d '\r\n%')
out+=("GET /api/signup without login -> $gs $g  (cache-control: ${cc:--}; nosniff: ${xc:--})")
out+=("GET /api/does-not-exist without login -> $u")
out+=("GET / -> $hb")
v3like="no"; [ "$ok_all" = 1 ] && [ "$leak" = 0 ] && [ "$gs" = 401 ] && v3like="yes"
out+=("VERDICT: intended origins all allowed: $([ $ok_all = 1 ] && echo yes || echo NO); other origins refused: $([ $leak = 0 ] && echo yes || echo NO); behaves like v3: $v3like")
printf '%s\n' "${out[@]}"
msg=$(printf '%s%%0A' "${out[@]}")
echo "::notice title=3 Deployed Worker (outside view, OPTIONS/GET only)::${msg}"
