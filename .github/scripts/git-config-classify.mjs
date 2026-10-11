// git-config-classify.mjs - READ-ONLY. Fetches the publicly exposed /.git/config and /.git/config.worktree of
// magnetra.app into memory only and reports WHAT KIND of credential (if any) they hold. The file content and any
// credential value are never printed or saved; any token found is masked in the log before anything is written.
const HOST = "https://magnetra.app";
const KINDS = [
  [/^ghs_/, "GitHub Actions / GitHub App installation token (short-lived: stops working when the job ends, at most hours)"],
  [/^ghp_/, "GitHub personal access token (classic): long-lived, MUST be revoked"],
  [/^github_pat_/, "GitHub fine-grained personal access token: long-lived, MUST be revoked"],
  [/^gho_/, "GitHub OAuth app token: MUST be revoked"],
  [/^ghu_/, "GitHub App user-to-server token: should be revoked"],
  [/^ghr_/, "GitHub refresh token: MUST be revoked"],
];
const kind = (t) => (KINDS.find(([re]) => re.test(t)) || [null, "unrecognised secret-like value: treat as exposed, rotate"])[1];
const mask = (v) => { if (v) console.log(`::add-mask::${v}`); };
const lines = [];

for (const path of ["/.git/config", "/.git/config.worktree"]) {
  let txt = "", status = 0;
  try { const r = await fetch(HOST + path, { headers: { "Cache-Control": "no-cache" } }); status = r.status; txt = await r.text(); }
  catch (e) { lines.push(`${path}: fetch failed (${e.cause?.code || e.message})`); continue; }
  if (status !== 200 || /^\s*<(!doctype|html)/i.test(txt)) { lines.push(`${path}: HTTP ${status}, not a git config file`); continue; }
  const found = [];
  // 1. actions/checkout style: extraheader = AUTHORIZATION: basic <base64(user:token)>
  for (const m of txt.matchAll(/extraheader\s*=\s*AUTHORIZATION:\s*(basic|bearer)\s+(\S+)/gi)) {
    mask(m[2]);
    let user = "", tok = m[2];
    if (m[1].toLowerCase() === "basic") { const d = Buffer.from(m[2], "base64").toString("utf8"); const i = d.indexOf(":"); user = d.slice(0, i); tok = d.slice(i + 1); }
    mask(tok);
    found.push(`http extraheader (${m[1]}${user ? ", user \"" + (user === "x-access-token" ? user : "other") + "\"" : ""}): ${kind(tok)}; length ${tok.length}`);
  }
  // 2. credentials inside a remote URL: https://user:token@host/...
  for (const m of txt.matchAll(/url\s*=\s*https?:\/\/([^@\s/]+)@/gi)) {
    const [u, p] = m[1].split(":"); mask(p); mask(u);
    found.push(p ? `remote URL with password/token: ${kind(p)}; length ${p.length}` : `remote URL with a user name only (no token)`);
  }
  // 3. any other GitHub-token-shaped value anywhere
  for (const m of txt.matchAll(/\b(ghp_|gho_|ghu_|ghs_|ghr_|github_pat_)[A-Za-z0-9_]{20,}/g)) {
    mask(m[0]);
    if (!found.some((f) => f.includes(kind(m[0])))) found.push(`token-shaped value: ${kind(m[0])}; length ${m[0].length}`);
  }
  const includes = [...txt.matchAll(/^\s*\[(include|includeIf)[^\]]*\]/gim)].length;
  const sections = [...txt.matchAll(/^\s*\[([A-Za-z]+)/gm)].map((m) => m[1]);
  lines.push(`${path}: ${txt.length} bytes; sections: ${[...new Set(sections)].join(", ") || "-"}${includes ? `; ${includes} include of another file (path not printed)` : ""}`);
  lines.push(`  credentials: ${found.length ? found.join(" | ") : "none found"}`);
}
const body = lines.join("\n");
console.log(body.replace(/[A-Za-z0-9+/=_-]{40,}/g, "<long>"));
console.log(`::notice title=7 Exposed .git config: credential type (value never printed)::${body.replace(/%/g, "%25").replace(/\n/g, "%0A")}`);
