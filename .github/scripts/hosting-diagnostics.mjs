// hosting-diagnostics.mjs - READ-ONLY look at the Firebase Hosting setup of magnetra-ultra.
// Uses the existing deploy service account with READ-ONLY scopes, so the token cannot change anything.
// Prints results as GitHub notices (readable without the log). Never prints keys, tokens or e-mail addresses.
import { createSign, createHash } from "node:crypto";
import { promises as dns } from "node:dns";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const PROJECT = "magnetra-ultra";
const SCOPES = "https://www.googleapis.com/auth/cloud-platform.read-only https://www.googleapis.com/auth/firebase.readonly";
const H = "https://firebasehosting.googleapis.com/v1beta1";
const notices = [];
const notice = (title, lines) => {
  const body = (Array.isArray(lines) ? lines : [lines]).join("\n");
  console.log(`--- ${title}\n${body}`);
  notices.push([title, body]);
};
const clean = (s) => String(s ?? "").replace(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+/g, "<email>").slice(0, 200);
const tail = (name) => String(name || "").split("/").pop();
const short = (buf) => createHash("sha256").update(buf).digest("hex").slice(0, 12);

async function token() {
  const sa = JSON.parse(process.env.SA_JSON || "{}");
  if (!sa.client_email || !sa.private_key) throw new Error("service account secret missing or not JSON");
  const b64 = (o) => Buffer.from(JSON.stringify(o)).toString("base64url");
  const now = Math.floor(Date.now() / 1000);
  const unsigned = b64({ alg: "RS256", typ: "JWT" }) + "." + b64({ iss: sa.client_email, scope: SCOPES, aud: "https://oauth2.googleapis.com/token", iat: now, exp: now + 600 });
  const sig = createSign("RSA-SHA256").update(unsigned).sign(sa.private_key).toString("base64url");
  const r = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: unsigned + "." + sig }),
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || !j.access_token) throw new Error(`token request failed: HTTP ${r.status} ${clean(j.error)}`);
  console.log(`::add-mask::${j.access_token}`);
  return j.access_token;
}

async function api(tok, url, init = {}) {
  const r = await fetch(url, { ...init, headers: { Authorization: `Bearer ${tok}`, "Content-Type": "application/json", ...(init.headers || {}) } });
  const j = await r.json().catch(() => ({}));
  return { ok: r.ok, status: r.status, j, err: r.ok ? "" : `HTTP ${r.status} ${clean(j?.error?.status)} ${clean(j?.error?.message)}` };
}

const result = { sites: [], domainSite: null };
try {
  const tok = await token();

  // 1. Sites in the project
  const s = await api(tok, `${H}/projects/${PROJECT}/sites?pageSize=50`);
  if (!s.ok) notice("1 Sites", `cannot list sites: ${s.err}`);
  result.sites = (s.j.sites || []).map((x) => ({ id: tail(x.name), url: x.defaultUrl, type: x.type || "" }));
  if (s.ok) notice("1 Sites", result.sites.map((x) => `${x.id}  ${x.type}  ${x.url}`).concat(result.sites.length ? [] : ["(none)"]));

  // 2. Custom domains per site (new API and legacy API)
  const dl = [];
  for (const site of result.sites) {
    const c = await api(tok, `${H}/projects/${PROJECT}/sites/${site.id}/customDomains?pageSize=50`);
    if (!c.ok) dl.push(`${site.id}: customDomains ${c.err}`);
    for (const d of c.j.customDomains || []) {
      const name = tail(d.name);
      dl.push(`${site.id}: ${name}  host=${d.hostState || "-"} ownership=${d.ownershipState || "-"} cert=${d.cert?.state || "-"}${d.redirectTarget ? " redirect=" + d.redirectTarget : ""}${d.reconciling ? " reconciling" : ""}`);
      if (name === "magnetra.app") result.domainSite = site.id;
    }
    const l = await api(tok, `${H}/sites/${site.id}/domains?pageSize=50`);
    if (!l.ok) dl.push(`${site.id}: domains(legacy) ${l.err}`);
    for (const d of l.j.domains || []) {
      dl.push(`${site.id}: [legacy] ${d.domainName}  status=${d.status || "-"} cert=${d.provisioning?.certStatus || "-"}${d.domainRedirect ? " redirect=" + d.domainRedirect.domainName : ""}`);
      if (d.domainName === "magnetra.app" && !result.domainSite) result.domainSite = site.id;
    }
  }
  notice("2 Custom domains", dl.length ? dl : ["(no custom domains returned)"]);

  // 3. Channels and 4. live release history (no user e-mails)
  const cl = [], rl = [];
  for (const site of result.sites) {
    const ch = await api(tok, `${H}/sites/${site.id}/channels?pageSize=50`);
    if (!ch.ok) cl.push(`${site.id}: ${ch.err}`);
    for (const c of ch.j.channels || []) cl.push(`${site.id}/${tail(c.name)}  ${c.url || ""}  last=${c.release?.releaseTime || "-"}  files=${c.release?.version?.fileCount ?? "-"}  expires=${c.expireTime || "never"}`);
    const r = await api(tok, `${H}/sites/${site.id}/channels/live/releases?pageSize=5`);
    if (!r.ok) rl.push(`${site.id}: ${r.err}`);
    for (const x of r.j.releases || []) rl.push(`${site.id}: ${x.releaseTime}  ${x.type}  version=${tail(x.version?.name)} files=${x.version?.fileCount ?? "-"}${x.message ? "  msg=" + clean(x.message) : ""}`);
    if (r.ok && !(r.j.releases || []).length) rl.push(`${site.id}: no live releases`);
  }
  notice("3 Channels", cl.length ? cl : ["(none)"]);
  notice("4 Live release history (latest 5 per site)", rl.length ? rl : ["(none)"]);

  // 4b. Exact file list of the version now on the release-check preview, compared with public/
  const fl = [];
  for (const site of result.sites) {
    const ch = await api(tok, `${H}/sites/${site.id}/channels/release-check`);
    const ver = ch.j?.release?.version?.name;
    if (!ver) { fl.push(`${site.id}: no release-check version (${ch.err || "none"})`); continue; }
    const paths = [];
    let page = "";
    do {
      const f = await api(tok, `${H}/${ver}/files?pageSize=1000${page ? "&pageToken=" + encodeURIComponent(page) : ""}`);
      if (!f.ok) { fl.push(`${site.id}: files ${f.err}`); break; }
      for (const x of f.j.files || []) paths.push(x.path);
      page = f.j.nextPageToken || "";
    } while (page);
    const hosted = new Set(readdirSync("public", { recursive: true, withFileTypes: true })
      .filter((d) => d.isFile() && !d.name.endsWith(".md") && !d.name.startsWith("."))
      .map((d) => "/" + join(d.parentPath ?? d.path, d.name).replace(/^public\//, "")));
    const extra = paths.filter((p) => !hosted.has(p)), missing = [...hosted].filter((p) => !paths.includes(p));
    fl.push(`${site.id}/release-check: ${paths.length} files in the deployed version, ${hosted.size} in public/`);
    fl.push(`in deployed version but not in public/: ${extra.length ? extra.join(", ") : "none"}`);
    fl.push(`in public/ but not deployed: ${missing.length ? missing.join(", ") : "none"}`);
  }
  // Live version: file names only, to see what a release replaces (and whether an offline service worker exists)
  for (const site of result.sites) {
    const ch = await api(tok, `${H}/sites/${site.id}/channels/live`);
    const ver = ch.j?.release?.version?.name;
    if (!ver) continue;
    const f = await api(tok, `${H}/${ver}/files?pageSize=1000`);
    const paths = (f.j.files || []).map((x) => x.path).sort();
    const sw = paths.filter((x) => /(sw|service-?worker|workbox)[^/]*\.js$|manifest(\.json|\.webmanifest)$/i.test(x));
    fl.push(`${site.id}/live: ${paths.length} files; service worker or manifest: ${sw.length ? sw.join(", ") : "none"}`);
    fl.push(`live files: ${paths.join(" ")}`);
  }
  notice("4b Preview and live file lists", fl);

  // 5. What this deploy account is allowed to do (testIamPermissions changes nothing)
  // Firebase Hosting IAM is per site: publishing a new live release needs firebasehosting.sites.update
  const want = ["firebasehosting.sites.list", "firebasehosting.sites.get", "firebasehosting.sites.update"];
  const p = await api(tok, `https://cloudresourcemanager.googleapis.com/v1/projects/${PROJECT}:testIamPermissions`, { method: "POST", body: JSON.stringify({ permissions: want }) });
  if (!p.ok) notice("5 Deploy account permissions", `could not test: ${p.err}`);
  else { const have = new Set(p.j.permissions || []); notice("5 Deploy account permissions", want.map((w) => `${have.has(w) ? "YES" : "NO "} ${w}`)); }
} catch (e) {
  notice("0 Error", clean(e.message));
}

// 6. DNS (public)
const dnsl = [];
for (const host of ["magnetra.app", "www.magnetra.app"]) {
  for (const [kind, fn] of [["A", dns.resolve4], ["AAAA", dns.resolve6], ["CNAME", dns.resolveCname]]) {
    try { dnsl.push(`${host} ${kind}: ${(await fn.call(dns, host)).join(", ")}`); } catch (e) { if (!/ENODATA|ENOTFOUND/.test(e.code)) dnsl.push(`${host} ${kind}: ${e.code}`); }
  }
}
try { dnsl.push(`magnetra.app NS: ${(await dns.resolveNs("magnetra.app")).join(", ")}`); } catch (e) { dnsl.push(`magnetra.app NS: ${e.code}`); }
notice("6 DNS", dnsl);

// 7. What each address serves now (public GET of / , same as any visitor)
const local = readFileSync("public/index.html");
const urls = ["https://magnetra.app", "https://www.magnetra.app", ...result.sites.map((x) => x.url).filter(Boolean)];
const seen = new Map(), pl = [];
for (const u of [...new Set(urls)]) {
  try {
    const r = await fetch(u + "/", { redirect: "manual", headers: { "Cache-Control": "no-cache" } });
    const buf = Buffer.from(await r.arrayBuffer());
    const h = (k) => r.headers.get(k);
    const title = (buf.toString("utf8").match(/<title>([^<]{0,60})/i) || [])[1] || "";
    const hash = short(buf); seen.set(u, hash);
    pl.push(`${u}/  HTTP ${r.status}${h("location") ? " -> " + h("location") : ""}  title="${title}"  sha=${hash}${hash === short(local) ? " (= this build)" : ""}  server=${h("server") || "-"}${h("cf-ray") ? " cf-ray" : ""}${h("x-served-by") ? " x-served-by=" + h("x-served-by") : ""}  cache=${h("cache-control") || "-"}`);
  } catch (e) { pl.push(`${u}/  ${clean(e.cause?.code || e.message)}`); }
}
notice("7 What each address serves now", pl);

// 8. Verdict
const v = [];
const def = result.sites.find((x) => x.type === "DEFAULT_SITE") || result.sites.find((x) => x.id === PROJECT);
v.push(`default site (used by firebase.json without "site"): ${def ? def.id : "unknown"}`);
v.push(`site that owns magnetra.app: ${result.domainSite || "not found in the API results"}`);
if (def && result.domainSite) v.push(result.domainSite === def.id ? "MATCH: a live release of the default site reaches magnetra.app" : `MISMATCH: firebase.json must target site "${result.domainSite}"`);
if (def) { const a = seen.get("https://magnetra.app"), b = seen.get(def.url); if (a && b) v.push(a === b ? "magnetra.app and the default site serve the same page now" : "magnetra.app and the default site serve DIFFERENT pages now"); }
notice("8 Verdict", v);

for (const [t, b] of notices) console.log(`::notice title=${t}::${b.replace(/%/g, "%25").replace(/\r/g, "%0D").replace(/\n/g, "%0A")}`);
