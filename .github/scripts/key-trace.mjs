// key-trace.mjs - READ-ONLY (GET + testIamPermissions only). Where is the site key used by firebase-init.js registered?
// Prints key fingerprints only (first 4 ... last 4). Never prints tokens, API keys or full site keys.
import { createSign } from "node:crypto";
import { readFileSync } from "node:fs";
const fp = (k) => (k ? `${k.slice(0, 4)}...${k.slice(-4)}` : "-");
const clean = (s) => String(s ?? "").replace(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+/g, "<email>").replace(/6L[0-9A-Za-z_-]{38}/g, (k) => fp(k)).slice(0, 180);
const src = readFileSync("public/firebase-init.js", "utf8");
const prod = src.slice(src.indexOf("const PROD_CONFIG"), src.indexOf("const DEV_CONFIG"));
const pick = (k) => (prod.match(new RegExp(k + ':\\s*"([^"]+)"')) || [])[1] || "";
const CODE_KEY = pick("recaptchaSiteKey"), APP_ID = pick("appId"), NUMBER = pick("messagingSenderId"), PROJECT = pick("projectId");
const notices = [];
const notice = (t, lines) => { const b = lines.join("\n"); console.log(`--- ${t}\n${b}`); notices.push([t, b]); };
async function token() {
  const sa = JSON.parse(process.env.SA_JSON || "{}");
  const b64 = (o) => Buffer.from(JSON.stringify(o)).toString("base64url"), now = Math.floor(Date.now() / 1000);
  const u = b64({ alg: "RS256", typ: "JWT" }) + "." + b64({ iss: sa.client_email, scope: "https://www.googleapis.com/auth/cloud-platform", aud: "https://oauth2.googleapis.com/token", iat: now, exp: now + 600 });
  const r = await fetch("https://oauth2.googleapis.com/token", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: u + "." + createSign("RSA-SHA256").update(u).sign(sa.private_key).toString("base64url") }) });
  const j = await r.json(); console.log(`::add-mask::${j.access_token}`); return j.access_token;
}
const tok = await token();
const get = async (url) => { const r = await fetch(url, { headers: { Authorization: `Bearer ${tok}` } }); const j = await r.json().catch(() => ({})); return { ok: r.ok, s: r.status, j, err: r.ok ? "" : `HTTP ${r.status} ${clean(j?.error?.status)} ${clean(j?.error?.message)}` }; };

// 1. Firebase web apps and their App Check registration
const A = [`site code (public/firebase-init.js): key ${fp(CODE_KEY)}, project ${PROJECT}, app id ...${APP_ID.slice(-6)}`];
const apps = await get(`https://firebase.googleapis.com/v1beta1/projects/${PROJECT}/webApps?pageSize=50`);
const list = apps.ok ? (apps.j.apps || []).map((a) => ({ id: a.appId, name: a.displayName || "(no name)", state: a.state })) : [{ id: APP_ID, name: "(could not list apps: " + apps.err + ")" }];
for (const a of list) {
  const e = await get(`https://firebaseappcheck.googleapis.com/v1/projects/${NUMBER}/apps/${a.id}/recaptchaEnterpriseConfig`);
  const v3 = await get(`https://firebaseappcheck.googleapis.com/v1/projects/${NUMBER}/apps/${a.id}/recaptchaV3Config`);
  A.push(`web app "${clean(a.name)}" (...${a.id.slice(-6)}${a.id === APP_ID ? ", the app the site code uses" : ""}${a.state ? ", " + a.state : ""}): ` +
    `App Check reCAPTCHA Enterprise key ${e.ok ? fp(e.j.siteKey) + (e.j.siteKey ? (e.j.siteKey === CODE_KEY ? " = site code key" : " != site code key") : " (none)") : "unreadable " + e.err}; ` +
    `reCAPTCHA v3 ${v3.ok ? (v3.j.siteSecretSet ? "registered" : "not registered") : "unreadable"}`);
}
notice("1 Site code vs Firebase App Check", A);

// 2. Google Cloud projects this deploy account can see, and whether it may list reCAPTCHA keys in them
const P = [];
const projs = await get("https://cloudresourcemanager.googleapis.com/v1/projects?pageSize=200");
const ids = projs.ok ? (projs.j.projects || []).map((p) => p.projectId) : [];
P.push(projs.ok ? `projects visible to the deploy account: ${ids.length} (${ids.join(", ") || "none"})` : `cannot list projects: ${projs.err}`);
for (const id of new Set([PROJECT, ...ids])) {
  const k = await get(`https://recaptchaenterprise.googleapis.com/v1/projects/${id}/keys?pageSize=100`);
  if (k.ok) P.push(`${id}: ${(k.j.keys || []).map((x) => { const kid = x.name.split("/").pop(); return fp(kid) + (kid === CODE_KEY ? " (= site code key)" : ""); }).join(", ") || "no keys"}`);
  else P.push(`${id}: cannot list reCAPTCHA keys (${k.err})`);
  const one = await get(`https://recaptchaenterprise.googleapis.com/v1/projects/${id}/keys/${CODE_KEY}`);
  P.push(`${id}: direct lookup of the site code key -> ${one.ok ? "FOUND here" : one.err}`);
}
notice("2 Google Cloud projects and reCAPTCHA keys", P);
for (const [t, b] of notices) console.log(`::notice title=${t}::${b.replace(/%/g, "%25").replace(/\n/g, "%0A")}`);
