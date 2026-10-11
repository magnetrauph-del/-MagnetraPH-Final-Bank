// release-security-check.mjs - READ-ONLY. Status/header checks only (HTTP HEAD: no file content is downloaded).
// 1. Lists the files of the current LIVE release and of the release-check PREVIEW (8ec1316 build) via the
//    Firebase Hosting API with a read-only token (paths only).
// 2. Sends HEAD requests for every sensitive path (.git, .github, backend/config, Android) and common
//    backend paths to magnetra.app, magnetra-ultra.web.app and the preview. Prints status, type and size only.
import { createSign } from "node:crypto";
import { readdirSync } from "node:fs";
import { join } from "node:path";

const PROJECT = "magnetra-ultra", SITE = "magnetra-ultra";
const H = "https://firebasehosting.googleapis.com/v1beta1";
const SCOPES = "https://www.googleapis.com/auth/cloud-platform.read-only https://www.googleapis.com/auth/firebase.readonly";
const LIVE = ["https://magnetra.app", "https://magnetra-ultra.web.app"];
const PREVIEW = "https://magnetra-ultra--release-check-qagxb0c0.web.app";
const notices = [];
const cap = (s, n = 3500) => (s.length > n ? s.slice(0, n) + " ...(cut)" : s);
const notice = (t, lines) => { const b = cap(lines.join("\n")); console.log(`--- ${t}\n${b}`); notices.push([t, b]); };
const clean = (s) => String(s ?? "").replace(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+/g, "<email>").slice(0, 200);

async function token() {
  const sa = JSON.parse(process.env.SA_JSON || "{}");
  if (!sa.client_email || !sa.private_key) throw new Error("service account secret missing or not JSON");
  const b64 = (o) => Buffer.from(JSON.stringify(o)).toString("base64url");
  const now = Math.floor(Date.now() / 1000);
  const unsigned = b64({ alg: "RS256", typ: "JWT" }) + "." + b64({ iss: sa.client_email, scope: SCOPES, aud: "https://oauth2.googleapis.com/token", iat: now, exp: now + 600 });
  const sig = createSign("RSA-SHA256").update(unsigned).sign(sa.private_key).toString("base64url");
  const r = await fetch("https://oauth2.googleapis.com/token", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: unsigned + "." + sig }) });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || !j.access_token) throw new Error(`token request failed: HTTP ${r.status} ${clean(j.error)}`);
  console.log(`::add-mask::${j.access_token}`);
  return j.access_token;
}
async function api(tok, url) {
  const r = await fetch(url, { headers: { Authorization: `Bearer ${tok}` } });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(`HTTP ${r.status} ${clean(j?.error?.status)} for ${url.replace(H, "")}`);
  return j;
}
async function versionFiles(tok, channel) {
  const ch = await api(tok, `${H}/sites/${SITE}/channels/${channel}`);
  const ver = ch.release?.version?.name;
  const paths = [];
  let page = "";
  do {
    const f = await api(tok, `${H}/${ver}/files?pageSize=1000${page ? "&pageToken=" + encodeURIComponent(page) : ""}`);
    for (const x of f.files || []) paths.push(x.path);
    page = f.nextPageToken || "";
  } while (page);
  return { ver: ver.split("/").pop(), time: ch.release?.releaseTime, paths: paths.sort() };
}
const category = (p) =>
  p.startsWith("/.git/") || p === "/.git" ? "git" :
  p.startsWith("/.github/") ? "github" :
  p.startsWith("/__/") ? "firebase-reserved" :
  /\.rules$|^\/firebase\.json$|^\/\.firebaserc$|^\/functions(\/|$)|^\/\.env|^\/package(-lock)?\.json$|^\/worker\.js$|^\/wrangler\.toml$|^\/firestore\.indexes\.json$|^\/legacy\//i.test(p) ? "backend-config" :
  /\.(java|kt|gradle|properties|keystore|jks|apk|aab)$|androidmanifest\.xml$|^\/gradlew|proguard/i.test(p) ? "android" : "site";
const SENSITIVE = new Set(["git", "github", "backend-config", "android"]);
async function head(base, p) {
  const url = base + p.split("/").map(encodeURIComponent).join("/");
  try {
    const r = await fetch(url, { method: "HEAD", redirect: "manual", headers: { "Cache-Control": "no-cache" } });
    return { s: r.status, ct: (r.headers.get("content-type") || "-").split(";")[0], len: r.headers.get("content-length") || "-" };
  } catch (e) { return { s: "ERR", ct: clean(e.cause?.code || e.message), len: "-" }; }
}
const hist = (rs) => Object.entries(rs.reduce((m, r) => ((m[r.s] = (m[r.s] || 0) + 1), m), {})).map(([k, v]) => `${k}x${v}`).join(" ");

const COMMON = ["/.git", "/.git/", "/.git/HEAD", "/.git/config", "/.git/index", "/.git/logs/HEAD", "/.git/refs/heads/main", "/.git/packed-refs",
  "/.git/ORIG_HEAD", "/.git/FETCH_HEAD", "/.git/shallow", "/.gitignore", "/.github/workflows/firebase-hosting-merge.yml",
  "/.github/workflows/firebase-hosting-live-release.yml", "/.github/scripts/check-hosting.sh", "/firebase.json", "/.firebaserc",
  "/firestore.rules", "/firestore.indexes.json", "/storage.rules", "/database.rules.json", "/functions/index.js", "/functions/package.json",
  "/functions/src/login.js", "/worker.js", "/wrangler.toml", "/package.json", "/.env", "/legacy/README.md", "/login (1).html",
  "/MainActivity.java", "/build.gradle", "/androidmanifest.xml", "/AndroidManifest.xml", "/public/index.html"];

const verdict = [];
try {
  const tok = await token();
  const live = await versionFiles(tok, "live");
  const prev = await versionFiles(tok, "release-check");
  const byCat = {};
  for (const p of live.paths) (byCat[category(p)] ||= []).push(p);
  notice("1 Live release contents (paths only)", [
    `live version ${live.ver}, released ${live.time}, ${live.paths.length} files`,
    ...Object.entries(byCat).map(([c, ps]) => `${c}: ${ps.length}${c === "site" || c === "git" ? "" : "  " + ps.join(" ")}`),
  ]);

  // Every sensitive path in the live release + the common list, on both live hosts and the preview
  const targets = [...new Set([...live.paths.filter((p) => SENSITIVE.has(category(p))), ...COMMON])];
  const results = {};
  for (const base of [...LIVE, PREVIEW]) {
    results[base] = [];
    for (const p of targets) results[base].push({ p, c: category(p), ...(await head(base, p)) });
  }
  const n = 2;
  for (const base of LIVE) {
    const rs = results[base], exposed = rs.filter((r) => r.s === 200);
    const lines = [`${targets.length} sensitive/common paths checked with HEAD: ${hist(rs)}`];
    for (const c of ["git", "github", "backend-config", "android"]) {
      const cr = rs.filter((r) => r.c === c);
      lines.push(`${c}: ${cr.length} checked, ${cr.filter((r) => r.s === 200).length} served (200)`);
    }
    lines.push("served examples: " + exposed.filter((r) => r.c !== "git").concat(exposed.filter((r) => r.c === "git").slice(0, 8))
      .map((r) => `${r.p} ${r.s} ${r.ct} ${r.len}B`).join(" | "));
    notice(`${n + LIVE.indexOf(base)} Live ${base.replace("https://", "")}`, lines);
    verdict.push(`${base.replace("https://", "")}: ${exposed.length} of ${targets.length} sensitive paths are publicly served now`);
  }
  // Preview = the exact 8ec1316 build
  const pr = results[PREVIEW], bad = pr.filter((r) => r.s !== 404);
  notice("4 Preview (8ec1316 build) same paths", [`${targets.length} paths checked with HEAD: ${hist(pr)}`,
    bad.length ? "NOT 404: " + bad.map((r) => `${r.p} ${r.s}`).join(" | ") : "all return 404"]);
  verdict.push(`preview (8ec1316 build): ${bad.length ? bad.length + " paths NOT blocked" : "all " + targets.length + " sensitive paths return 404"}`);

  // Old site pages from the live release that the new build no longer serves
  const pub = new Set(readdirSync("public", { withFileTypes: true }).filter((d) => d.isFile() && !d.name.endsWith(".md")).map((d) => "/" + d.name));
  const oldOnly = live.paths.filter((p) => category(p) === "site" && !pub.has(p));
  const oldRes = [];
  for (const p of oldOnly) oldRes.push({ p, ...(await head(PREVIEW, p)) });
  // Files in the preview version beyond public/ (Firebase adds /__/firebase/init.js and init.json itself)
  const extra = prev.paths.filter((p) => !pub.has(p) && !p.startsWith("/__/"));
  const missing = [...pub].filter((p) => !prev.paths.includes(p));
  notice("5 Preview version vs public/", [`preview version ${prev.ver}, released ${prev.time}, ${prev.paths.length} files (${pub.size} from public/ + Firebase reserved /__/ files)`,
    `files beyond public/: ${extra.length ? extra.join(" ") : "none"}`, `public/ files missing: ${missing.length ? missing.join(" ") : "none"}`,
    `old live-only site files (${oldOnly.length}) on the preview: ${hist(oldRes) || "-"}`]);
  verdict.push(`preview version contains only public/ files: ${extra.length || missing.length ? "NO" : "yes"}`);
} catch (e) {
  notice("0 Error", [clean(e.message)]);
  verdict.push("check incomplete: " + clean(e.message));
}
notice("6 Verdict", verdict);
for (const [t, b] of notices) console.log(`::notice title=${t}::${b.replace(/%/g, "%25").replace(/\r/g, "%0D").replace(/\n/g, "%0A")}`);
