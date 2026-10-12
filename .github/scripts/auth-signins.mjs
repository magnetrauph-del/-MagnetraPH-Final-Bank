// auth-signins.mjs - READ-ONLY. Recent Firebase Authentication activity for project magnetra-ultra:
// only accounts that signed in or refreshed a token in the last 6 hours. Prints NO emails or names:
// a 6-character id prefix, email-verified flag, providers, created / last sign-in / last token refresh times.
import { createSign } from "node:crypto";
const sa = JSON.parse(process.env.SA_JSON || "{}");
const b64 = (o) => Buffer.from(JSON.stringify(o)).toString("base64url"), now = Math.floor(Date.now() / 1000);
const u = b64({ alg: "RS256", typ: "JWT" }) + "." + b64({ iss: sa.client_email, scope: "https://www.googleapis.com/auth/cloud-platform", aud: "https://oauth2.googleapis.com/token", iat: now, exp: now + 600 });
const tr = await fetch("https://oauth2.googleapis.com/token", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
  body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: u + "." + createSign("RSA-SHA256").update(u).sign(sa.private_key).toString("base64url") }) });
const tok = (await tr.json()).access_token; console.log(`::add-mask::${tok}`);
const L = [];
const r = await fetch("https://identitytoolkit.googleapis.com/v1/projects/magnetra-ultra/accounts:batchGet?maxResults=500", { headers: { Authorization: `Bearer ${tok}` } });
const j = await r.json().catch(() => ({}));
if (!r.ok) L.push(`cannot read Firebase Authentication users: HTTP ${r.status} ${j?.error?.status || ""} ${String(j?.error?.message || "").slice(0, 100)}`);
else {
  const users = j.users || [], since = Date.now() - 6 * 3600000;
  const iso = (ms) => (ms ? new Date(Number(ms)).toISOString().replace(".000", "") : "-");
  const recent = users.filter((x) => Number(x.lastLoginAt || 0) > since || Date.parse(x.lastRefreshAt || 0) > since);
  L.push(`${users.length} accounts in total; ${recent.length} signed in or refreshed a token in the last 6 h`);
  for (const x of recent) L.push(`id ${String(x.localId).slice(0, 6)}… verified=${x.emailVerified === true} providers=${(x.providerUserInfo || []).map((p) => p.providerId).join("+") || "-"} disabled=${!!x.disabled} created=${iso(x.createdAt)} lastSignIn=${iso(x.lastLoginAt)} lastTokenRefresh=${x.lastRefreshAt || "-"}`);
}
const body = L.join("\n"); console.log(body);
console.log(`::notice title=8 Firebase sign-ins (no emails)::${body.replace(/%/g, "%25").replace(/\n/g, "%0A")}`);
