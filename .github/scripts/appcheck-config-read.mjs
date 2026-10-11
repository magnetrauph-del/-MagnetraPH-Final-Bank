// appcheck-config-read.mjs - READ-ONLY (HTTP GET only). Reads how App Check and reCAPTCHA Enterprise are set up
// for project magnetra-ultra and compares it with the key the site code uses. Prints only the first 4 characters
// of any site key, plus "same as code: yes/no". Never prints tokens, API keys or full site keys.
import { createSign } from "node:crypto";
import { readFileSync } from "node:fs";

const PROJECT = "magnetra-ultra";
const notices = [];
const notice = (t, lines) => { const b = lines.join("\n").slice(0, 3900); console.log(`--- ${t}\n${b}`); notices.push([t, b]); };
const clean = (s) => String(s ?? "").replace(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+/g, "<email>").replace(/6L[0-9A-Za-z_-]{38}/g, "<site key>").slice(0, 200);

const src = readFileSync("public/firebase-init.js", "utf8");
const prod = src.slice(src.indexOf("const PROD_CONFIG"), src.indexOf("const DEV_CONFIG"));
const pick = (k) => (prod.match(new RegExp(k + ':\\s*"([^"]+)"')) || [])[1] || "";
const CODE_KEY = pick("recaptchaSiteKey"), APP_ID = pick("appId"), NUMBER = pick("messagingSenderId");
const kp = (k) => (k ? k.slice(0, 4) + "..." : "-");
const same = (k) => (k && CODE_KEY ? (k === CODE_KEY ? "same as code: YES" : "same as code: NO") : "");

async function token() {
  const sa = JSON.parse(process.env.SA_JSON || "{}");
  const b64 = (o) => Buffer.from(JSON.stringify(o)).toString("base64url");
  const now = Math.floor(Date.now() / 1000);
  const unsigned = b64({ alg: "RS256", typ: "JWT" }) + "." + b64({ iss: sa.client_email, scope: "https://www.googleapis.com/auth/cloud-platform", aud: "https://oauth2.googleapis.com/token", iat: now, exp: now + 600 });
  const sig = createSign("RSA-SHA256").update(unsigned).sign(sa.private_key).toString("base64url");
  const r = await fetch("https://oauth2.googleapis.com/token", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: unsigned + "." + sig }) });
  const j = await r.json().catch(() => ({}));
  if (!j.access_token) throw new Error(`token request failed: HTTP ${r.status}`);
  console.log(`::add-mask::${j.access_token}`);
  return j.access_token;
}
const get = async (tok, url) => { // GET only
  const r = await fetch(url, { method: "GET", headers: { Authorization: `Bearer ${tok}` } });
  const j = await r.json().catch(() => ({}));
  return { ok: r.ok, j, err: r.ok ? "" : `HTTP ${r.status} ${clean(j?.error?.status)} ${clean(j?.error?.message).slice(0, 120)}` };
};

try {
  const tok = await token();
  const A = "https://firebaseappcheck.googleapis.com/v1";
  const lines = [`code uses: App Check provider = reCAPTCHA Enterprise, site key ${kp(CODE_KEY)}`];
  const svc = await get(tok, `${A}/projects/${PROJECT}/services?pageSize=50`);
  lines.push(svc.ok ? "enforcement: " + ((svc.j.services || []).map((s) => `${s.name.split("/").pop()}=${s.enforcementMode || "OFF"}`).join(", ") || "(no services listed = all unenforced)") : `enforcement: cannot read (${svc.err})`);
  const ent = await get(tok, `${A}/projects/${NUMBER}/apps/${APP_ID}/recaptchaEnterpriseConfig`);
  lines.push(ent.ok ? `web app reCAPTCHA Enterprise provider: ${ent.j.siteKey ? "registered, key " + kp(ent.j.siteKey) + ", " + same(ent.j.siteKey) + ", token lifetime " + (ent.j.tokenTtl || "-") + (ent.j.riskAnalysis ? ", min score " + JSON.stringify(ent.j.riskAnalysis) : "") : "NOT registered"}` : `web app reCAPTCHA Enterprise provider: cannot read (${ent.err})`);
  const v3 = await get(tok, `${A}/projects/${NUMBER}/apps/${APP_ID}/recaptchaV3Config`);
  lines.push(v3.ok ? `web app reCAPTCHA v3 provider: ${v3.j.siteSecretSet ? "registered (secret set)" : "not registered"}` : `web app reCAPTCHA v3 provider: cannot read (${v3.err})`);
  notice("4 App Check setup (Firebase)", lines);

  const keys = await get(tok, `https://recaptchaenterprise.googleapis.com/v1/projects/${PROJECT}/keys?pageSize=50`);
  if (!keys.ok) notice("5 reCAPTCHA Enterprise keys (Google Cloud)", [`cannot read (${keys.err})`]);
  else notice("5 reCAPTCHA Enterprise keys (Google Cloud)", (keys.j.keys || []).map((k) => {
    const id = k.name.split("/").pop(), w = k.webSettings;
    return `${kp(id)} ${same(id)} | "${clean(k.displayName)}" | ${w ? `web ${w.integrationType || "-"}, ` + (w.allowAllDomains ? "ALL domains" : "domains: " + (w.allowedDomains || []).join(", ")) : k.androidSettings ? "android" : k.iosSettings ? "ios" : "other"}`;
  }).concat((keys.j.keys || []).length ? [] : ["(no Enterprise keys in this project)"]));
} catch (e) { notice("4 App Check setup (Firebase)", ["error: " + clean(e.message)]); }

for (const [t, b] of notices) console.log(`::notice title=${t}::${b.replace(/%/g, "%25").replace(/\r/g, "%0D").replace(/\n/g, "%0A")}`);
