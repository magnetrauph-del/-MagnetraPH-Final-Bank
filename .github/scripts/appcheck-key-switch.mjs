// appcheck-key-switch.mjs - OWNER-APPROVED (12 Oct 2026, preview testing): switch the App Check reCAPTCHA Enterprise
// site key of the MagnetraPH web app from 6LfM...sDle to 6Ld2...uKW4. Changes ONLY the siteKey field
// (updateMask=siteKey); token lifetime and minimum score stay as they are. Enforcement is not touched.
// Idempotent: does nothing if the new key is already registered; stops if the current key is not the expected old one.
// Prints key fingerprints only.
import { createSign } from "node:crypto";
import { readFileSync } from "node:fs";
const OLD = { first: "6LfM", last: "sDle" };
const NEW_KEY = "6Ld2_ektAAAAAO8Dm0XPXWD2r2bWnDttMzoOuKW4";
const fp = (k) => (k ? `${k.slice(0, 4)}...${k.slice(-4)}` : "-");
const src = readFileSync("public/firebase-init.js", "utf8");
const prod = src.slice(src.indexOf("const PROD_CONFIG"), src.indexOf("const DEV_CONFIG"));
const pick = (k) => (prod.match(new RegExp(k + ':\\s*"([^"]+)"')) || [])[1] || "";
const APP_ID = pick("appId"), NUMBER = pick("messagingSenderId");
const URL_ = `https://firebaseappcheck.googleapis.com/v1/projects/${NUMBER}/apps/${APP_ID}/recaptchaEnterpriseConfig`;
const lines = [];
const done = (level) => { const b = lines.join("\n"); console.log(b); console.log(`::${level} title=App Check key switch::${b.replace(/%/g, "%25").replace(/\n/g, "%0A")}`); process.exit(level === "error" ? 1 : 0); };
const sa = JSON.parse(process.env.SA_JSON || "{}");
const b64 = (o) => Buffer.from(JSON.stringify(o)).toString("base64url"), now = Math.floor(Date.now() / 1000);
const u = b64({ alg: "RS256", typ: "JWT" }) + "." + b64({ iss: sa.client_email, scope: "https://www.googleapis.com/auth/cloud-platform", aud: "https://oauth2.googleapis.com/token", iat: now, exp: now + 600 });
const tr = await fetch("https://oauth2.googleapis.com/token", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
  body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: u + "." + createSign("RSA-SHA256").update(u).sign(sa.private_key).toString("base64url") }) });
const tok = (await tr.json()).access_token; console.log(`::add-mask::${tok}`);
const call = async (method, url, body) => { const r = await fetch(url, { method, headers: { Authorization: `Bearer ${tok}`, "Content-Type": "application/json" }, body: body && JSON.stringify(body) });
  const j = await r.json().catch(() => ({})); return { ok: r.ok, s: r.status, j, err: r.ok ? "" : `HTTP ${r.status} ${j?.error?.status || ""} ${String(j?.error?.message || "").replace(/6L[0-9A-Za-z_-]{38}/g, (k) => fp(k)).slice(0, 160)}` }; };
const before = await call("GET", URL_);
if (!before.ok) { lines.push(`cannot read the current registration: ${before.err}`); done("error"); }
const cur = before.j.siteKey || "";
lines.push(`before: ${fp(cur)}, token lifetime ${before.j.tokenTtl || "-"}, min score ${before.j.riskAnalysis?.minValidScore ?? "-"}`);
if (cur === NEW_KEY) { lines.push("already registered with 6Ld2...uKW4: nothing changed"); done("notice"); }
if (!(cur.startsWith(OLD.first) && cur.endsWith(OLD.last))) { lines.push("STOPPED: the current key is not the expected 6LfM...sDle; nothing changed"); done("error"); }
const p = await call("PATCH", `${URL_}?updateMask=siteKey`, { siteKey: NEW_KEY });
if (!p.ok) { lines.push(`NOT CHANGED: Firebase refused the update: ${p.err}`); done("error"); }
const after = await call("GET", URL_);
lines.push(`after: ${fp(after.j.siteKey)}, token lifetime ${after.j.tokenTtl || "-"}, min score ${after.j.riskAnalysis?.minValidScore ?? "-"}`);
lines.push(after.j.siteKey === NEW_KEY ? "CHANGED: App Check now uses 6Ld2...uKW4 (only siteKey changed)" : "WARNING: read-back does not show the new key");
lines.push(`undo: set the App Check reCAPTCHA Enterprise site key back to ${OLD.first}...${OLD.last} (Firebase console, App Check, Apps, magnetraphultra)`);
done(after.j.siteKey === NEW_KEY ? "notice" : "error");
