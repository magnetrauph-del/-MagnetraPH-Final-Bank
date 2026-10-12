// cf-worker.mjs - Cloudflare Worker "magnetra-live-api": INSPECT (read-only) or DEPLOY the reviewed v3.
// Mode comes from worker/DEPLOY.txt (first non-comment line):
//   inspect
//   deploy sha256=<sha256 of worker/worker.js> drop=<NAMES,comma separated | none>
// Never prints the API token, secret values or plain-text values (only names, types and yes/no checks).
// Deploy keeps every existing binding by inheriting it from the current version (secret values are never read),
// except names listed in drop=. If any check after deploying fails, the previous deployment is restored.
import { createHash, generateKeyPairSync, createSign } from "node:crypto";
import { readFileSync } from "node:fs";

const API = process.env.CF_API_BASE || "https://api.cloudflare.com/client/v4";
const WORKER_URL = process.env.WORKER_URL || "https://magnetra-live-api.magnetrauph.workers.dev";
const TOKEN = process.env.CF_API_TOKEN || "", ACCT = (process.env.CF_ACCOUNT_ID || "").trim();
const SCRIPT = "magnetra-live-api";
const V3_SHA = "5f1077b980c885d9339bfc6a9a3eceef6e8be38e1d89bd70e4588c4bc7e1b25e"; // reviewed + tested v3
const PROD_ORIGINS = ["https://magnetra.app", "https://www.magnetra.app", "https://magnetra-ultra.web.app", "https://magnetra-ultra.firebaseapp.com"];
const OTHER_ORIGINS = ["https://magnetra.vercel.app", "https://magnetra-ultra--release-check-qagxb0c0.web.app", "http://magnetra.app", "https://magnetra.app.evil.example", "https://example.com", "null"];
const MUST_NOT = ["ALLOWED_ORIGINS", "ALLOWED_APP_IDS"];
if (TOKEN) console.log(`::add-mask::${TOKEN}`);

const notices = [];
const out = (title, lines, level = "notice") => { const b = lines.join("\n"); console.log(`--- ${title}\n${b}`); notices.push([level, title, b]); };
const flush = () => { for (const [l, t, b] of notices) console.log(`::${l} title=${t}::${b.slice(0, 3900).replace(/%/g, "%25").replace(/\r/g, "%0D").replace(/\n/g, "%0A")}`); };
const clean = (s) => String(s ?? "").replace(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+/g, "<email>").replace(/[A-Za-z0-9_-]{32,}/g, "<long>").slice(0, 160);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function cf(path, init = {}) {
  const r = await fetch(API + path, { ...init, headers: { Authorization: `Bearer ${TOKEN}`, ...(init.headers || {}) } });
  const text = await r.text();
  let j = {}; try { j = JSON.parse(text); } catch { j = { raw: text }; }
  const ok = r.ok && j.success !== false;
  return { ok, status: r.status, j, text, err: ok ? "" : `HTTP ${r.status} ${(j.errors || []).map((e) => `${e.code} ${clean(e.message)}`).join("; ")}` };
}

// ---------- mode and the reviewed file ----------
const modeLine = readFileSync("worker/DEPLOY.txt", "utf8").split("\n").map((l) => l.trim()).find((l) => l && !l.startsWith("#")) || "inspect";
const deploy = modeLine.startsWith("deploy");
const want = (modeLine.match(/sha256=([0-9a-f]{64})/) || [])[1] || "";
const dropList = ((modeLine.match(/drop=([A-Z_,]+|none)/) || [])[1] || "none").split(",").filter((x) => x && x !== "none");
const code = readFileSync("worker/worker.js");
const codeSha = createHash("sha256").update(code).digest("hex");
const appIdNum = ((code.toString().match(/PROD_APP_IDS\s*=\s*\[\s*"1:(\d+):web:/) || [])[1]) || "";

if (!TOKEN || !ACCT) {
  out("1 Cloudflare access", [`NOT CONFIGURED: GitHub secret CLOUDFLARE_API_TOKEN ${TOKEN ? "present" : "missing"}, CLOUDFLARE_ACCOUNT_ID ${ACCT ? "present" : "missing"}.`,
    "Nothing was read or changed in Cloudflare."], deploy ? "error" : "warning");
  flush(); process.exit(deploy ? 1 : 0);
}

// ---------- inspect (read-only) ----------
const access = [];
let v = await cf("/user/tokens/verify");
if (!v.ok) v = await cf(`/accounts/${ACCT}/tokens/verify`);
access.push(v.ok ? `API token: ${v.j.result?.status || "?"}${v.j.result?.expires_on ? ", expires " + v.j.result.expires_on : ", no expiry set"}` : `API token check failed: ${v.err}`);
// The account in CLOUDFLARE_ACCOUNT_ID must be the one holding magnetra-live-api as seen through the owner's
// Cloudflare connector (Worker tag below). Stop before reading anything else if it is not.
const EXPECTED_TAG = "63a9e9bc9b454f9fa6004479e36c3964";
const list = await cf(`/accounts/${ACCT}/workers/scripts`);
const mine = (list.j.result || []).find((x) => x.id === SCRIPT);
access.push(list.ok ? `account holds ${(list.j.result || []).length} Worker(s); ${SCRIPT}: ${mine ? (mine.tag === EXPECTED_TAG ? "found, same Worker as seen through the Cloudflare connector" : "found but a DIFFERENT Worker than the connector showed") : "NOT FOUND in this account"}` : `cannot list Workers: ${list.err}`);
if (!list.ok || !mine || mine.tag !== EXPECTED_TAG) { out("1 Cloudflare access", access.concat(["STOPPED: CLOUDFLARE_ACCOUNT_ID does not point to the account holding magnetra-live-api. Nothing else was read or changed."]), "error"); flush(); process.exit(1); }
const settings = await cf(`/accounts/${ACCT}/workers/scripts/${SCRIPT}/settings`);
const deps = await cf(`/accounts/${ACCT}/workers/scripts/${SCRIPT}/deployments`);
access.push(`read Worker settings: ${settings.ok ? "yes" : "NO (" + settings.err + ")"}; read deployments: ${deps.ok ? "yes" : "NO (" + deps.err + ")"}`);
out("1 Cloudflare access", access, settings.ok && deps.ok ? "notice" : "error");
if (!settings.ok || !deps.ok) { flush(); process.exit(1); }

const s = settings.j.result || {};
const bindings = s.bindings || [];
for (const b of bindings) if (b.text) console.log(`::add-mask::${b.text}`);
const byName = Object.fromEntries(bindings.map((b) => [b.name, b]));
const chk = [];
const need = (name, types, test, label) => {
  const b = byName[name];
  if (!b) { chk.push(`MISSING  ${name}`); return false; }
  if (!types.includes(b.type)) { chk.push(`WRONG TYPE ${name}: ${b.type} (needs ${types.join(" or ")})`); return false; }
  if (test && b.text !== undefined && !test(b.text)) { chk.push(`WRONG VALUE ${name} (${label})`); return false; }
  const shown = test && b.text === undefined ? "stored as a secret, value not checkable" : label;
  chk.push(`ok       ${name} (${b.type}${shown ? ", " + shown : ""})`); return true;
};
const okReq = [
  need("FIREBASE_PROJECT_ID", ["plain_text", "secret_text"], (t) => t.trim() === "magnetra-ultra", "equals magnetra-ultra"),
  need("FIREBASE_PROJECT_NUMBER", ["plain_text", "secret_text"], (t) => !!appIdNum && t.trim() === appIdNum, "matches the app id in worker.js"),
  need("SUPABASE_URL", ["plain_text", "secret_text"], (t) => /^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/.test(t.trim()), "looks like a Supabase project URL"),
  need("SUPABASE_SERVICE_ROLE", ["secret_text"], null, "secret, value not readable"),
].every(Boolean);
const present = MUST_NOT.filter((n) => byName[n]);
for (const n of MUST_NOT) chk.push(byName[n] ? `PRESENT  ${n} (${byName[n].type}) -> overrides the production list in v3; must be removed` : `absent   ${n} (good)`);
const others = bindings.filter((b) => !["FIREBASE_PROJECT_ID", "FIREBASE_PROJECT_NUMBER", "SUPABASE_URL", "SUPABASE_SERVICE_ROLE", ...MUST_NOT].includes(b.name));
chk.push(`other bindings kept as they are: ${others.length ? others.map((b) => `${b.name} (${b.type})`).join(", ") : "none"}`);
chk.push(`compatibility date ${s.compatibility_date || "-"}; flags ${(s.compatibility_flags || []).join(",") || "none"}; logs/observability ${s.observability?.enabled ? "on" : "off"}`);
out("2 Worker settings (names and checks only)", chk, okReq ? "notice" : "warning");

const cur = (deps.j.result?.deployments || [])[0];
const curVersions = (cur?.versions || []).map((x) => ({ version_id: x.version_id, percentage: x.percentage }));
// Cloudflare copies inherited settings from the most recently UPLOADED version, which is not always the deployed one.
const vl = await cf(`/accounts/${ACCT}/workers/scripts/${SCRIPT}/versions`);
const latest = (vl.j.result?.items || [])[0]?.id || "";
const latestIsDeployed = !!latest && curVersions.length === 1 && curVersions[0].version_id === latest && curVersions[0].percentage === 100;
const content = await cf(`/accounts/${ACCT}/workers/scripts/${SCRIPT}/content/v2`);
const body = content.ok ? content.text : "";
const dsha = body ? createHash("sha256").update(body).digest("hex") : "";
const first = (body.split("\n").find((l) => l.trim()) || "").replace(/[^\x20-\x7e]/g, "").slice(0, 80);
out("3 Deployed now", [
  `deployment ${cur?.id || "?"} created ${cur?.created_on || "?"}; versions ${curVersions.map((x) => x.version_id + " " + x.percentage + "%").join(", ") || "?"}`,
  content.ok ? `code: ${body.length} bytes; first line "${clean(first)}"; same as reviewed v3: ${dsha === V3_SHA ? "YES" : "no"}; mentions magnetra.vercel.app: ${body.includes("magnetra.vercel.app") ? "yes" : "no"}; secret-like text inside the code: ${/sb_secret_[A-Za-z0-9]|eyJ[A-Za-z0-9_-]{30,}\.[A-Za-z0-9_-]{20,}|service_role"\s*:/.test(body) ? "YES (rotate that secret after v3 is live)" : "none found"}` : `code not readable (${content.err})`,
  `latest uploaded version ${latest || "?"}: ${latestIsDeployed ? "is the deployed version (settings are copied from it)" : "NOT the single 100% deployed version"}`,
  `reviewed file worker/worker.js: sha256 ${codeSha.slice(0, 12)}..., ${codeSha === V3_SHA ? "matches the reviewed v3" : "DOES NOT match the reviewed v3"}`,
]);

if (!deploy) { out("9 Result", ["INSPECT ONLY: nothing was changed in Cloudflare."]); flush(); process.exit(0); }

// ---------- deploy (only when DEPLOY.txt says so) ----------
const stop = (why) => { out("9 Result", ["DEPLOY STOPPED, live Worker unchanged: " + why], "error"); flush(); process.exit(1); };
if (codeSha !== V3_SHA || want !== V3_SHA) stop("worker/worker.js or the requested sha256 is not the reviewed v3");
if (!okReq) stop("a required setting is missing or wrong (see 2); secrets cannot be created from here");
const undropped = present.filter((n) => !dropList.includes(n));
if (undropped.length) stop(`${undropped.join(", ")} present but not approved for removal (drop=)`);
if (!curVersions.length) stop("current deployment not readable, so a rollback would not be possible");
if (!latestIsDeployed) stop("the latest uploaded version is not the deployed version, so inherited settings could come from the wrong version");

const keep = bindings.filter((b) => !dropList.includes(b.name)).map((b) => ({ type: "inherit", name: b.name }));
const meta = {
  main_module: "worker.js",
  compatibility_date: s.compatibility_date || "2024-09-23",
  compatibility_flags: s.compatibility_flags || [],
  bindings: keep,
  annotations: { "workers/message": `v3 ${V3_SHA.slice(0, 12)} from GitHub ${String(process.env.GITHUB_SHA || "").slice(0, 7)}`, "workers/tag": "v3" },
};
const form = new FormData();
form.append("metadata", new Blob([JSON.stringify(meta)], { type: "application/json" }));
form.append("worker.js", new Blob([code], { type: "application/javascript+module" }), "worker.js");
const up = await cf(`/accounts/${ACCT}/workers/scripts/${SCRIPT}/versions?bindings_inherit=strict`, { method: "POST", body: form });
if (!up.ok || !up.j.result?.id) stop(`version upload refused: ${up.err}`);
const newVersion = up.j.result.id;
// Never deploy a version that silently lost a setting: read the uploaded version's binding names back first.
const nv = await cf(`/accounts/${ACCT}/workers/scripts/${SCRIPT}/versions/${newVersion}`);
const got = new Set((nv.j.result?.resources?.bindings || []).map((b) => b.name));
const lost = keep.map((b) => b.name).filter((n) => !got.has(n));
if (!nv.ok || lost.length) stop(`uploaded version ${newVersion} is missing settings (${nv.ok ? lost.join(", ") : nv.err}); it was NOT deployed`);
const dep = await cf(`/accounts/${ACCT}/workers/scripts/${SCRIPT}/deployments`, { method: "POST", headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ strategy: "percentage", versions: [{ version_id: newVersion, percentage: 100 }], annotations: { "workers/message": "MagnetraPH Worker v3 (owner-approved)" } }) });
if (!dep.ok) stop(`deployment refused: ${dep.err} (version ${newVersion} uploaded but NOT active)`);
const steps = [`uploaded version ${newVersion}; kept bindings: ${keep.map((b) => b.name).join(", ")}; removed: ${dropList.filter((n) => byName[n]).join(", ") || "none"}`,
  `deployment ${dep.j.result?.id || "?"} -> ${newVersion} 100%; previous: ${curVersions.map((x) => x.version_id + " " + x.percentage + "%").join(", ")}`];

// Verify which version Cloudflare actually serves now
const dnow = await cf(`/accounts/${ACCT}/workers/scripts/${SCRIPT}/deployments`);
const active = ((dnow.j.result?.deployments || [])[0]?.versions || []).map((x) => `${x.version_id} ${x.percentage}%`).join(", ");
const activeOk = active === `${newVersion} 100%`;
steps.push(`active now (read back from Cloudflare): ${active || "unreadable"} -> ${activeOk ? "the new v3 version" : "NOT the expected version"}`);
steps.push(`compatibility date kept: ${meta.compatibility_date}`);

// ---------- safe live checks (no valid tokens; nothing can be written) ----------
const b64 = (o) => Buffer.from(JSON.stringify(o)).toString("base64url");
const { privateKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
const forge = (payload) => { const u = b64({ alg: "RS256", kid: "forged-test-key", typ: "JWT" }) + "." + b64(payload); return u + "." + createSign("RSA-SHA256").update(u).sign(privateKey).toString("base64url"); };
const nowS = Math.floor(Date.now() / 1000);
const forgedId = forge({ iss: "https://securetoken.google.com/magnetra-ultra", aud: "magnetra-ultra", sub: "forged-test", email: "forged@example.invalid", email_verified: true, iat: nowS - 5, exp: nowS + 600, auth_time: nowS - 5 });
const forgedAc = forge({ iss: `https://firebaseappcheck.googleapis.com/${appIdNum}`, aud: [`projects/${appIdNum}`], sub: "forged", iat: nowS - 5, exp: nowS + 600 });
async function liveChecks() {
  const r = [], pre = async (o) => { const x = await fetch(WORKER_URL + "/api/signup", { method: "OPTIONS", headers: { Origin: o, "Access-Control-Request-Method": "POST", "Access-Control-Request-Headers": "content-type,authorization,x-firebase-appcheck" } }); return { s: x.status, a: x.headers.get("access-control-allow-origin") }; };
  for (const o of PROD_ORIGINS) { const x = await pre(o); r.push([`allowed ${o}: ${x.s} Allow-Origin ${x.a || "none"}`, x.s === 204 && x.a === o]); }
  for (const o of OTHER_ORIGINS) { const x = await pre(o); r.push([`refused ${o}: ${x.s} Allow-Origin ${x.a || "none"}`, !x.a]); }
  const post = async (h) => { const x = await fetch(WORKER_URL + "/api/signup", { method: "POST", headers: { Origin: "https://magnetra.app", "Content-Type": "application/json", ...h }, body: "{}" }); return { s: x.status, b: (await x.text()).slice(0, 60), cc: x.headers.get("cache-control"), xc: x.headers.get("x-content-type-options") }; };
  const a = await post({}); r.push([`no login: ${a.s} ${a.b} (no-store ${a.cc === "no-store" ? "yes" : "no"}, nosniff ${a.xc === "nosniff" ? "yes" : "no"}); 500 would mean a missing setting`, a.s === 401 && a.cc === "no-store" && a.xc === "nosniff"]);
  const f = await post({ Authorization: "Bearer " + forgedId, "X-Firebase-AppCheck": forgedAc }); r.push([`forged sign-in + App Check tokens: ${f.s} ${f.b}`, f.s === 401]);
  const g = await fetch(WORKER_URL + "/api/account", { method: "GET", headers: { Origin: "https://magnetra.app" } }); r.push([`GET /api/account without login: ${g.status}`, g.status === 401]);
  const h = await fetch(WORKER_URL + "/"); const hb = (await h.text()).slice(0, 40); r.push([`health: ${h.status} ${hb}`, h.status === 200]);
  const leak = [a.b, f.b].some((t) => /eyJ|Bearer|sb_|stack|Error:/.test(t)); r.push([`responses free of tokens and stack traces: ${leak ? "NO" : "yes"}`, !leak]);
  return r;
}
let res = [];
const WAIT = Number(process.env.CHECK_WAIT_MS || 10000);
for (let i = 0; i < 6; i++) { await sleep(WAIT); res = await liveChecks(); if (res.every(([, ok]) => ok)) break; }
const allOk = activeOk && res.every(([, ok]) => ok);
out("4 Live checks after deploy", res.map(([t, ok]) => `${ok ? "PASS" : "FAIL"} ${t}`), allOk ? "notice" : "error");
if (!allOk) {
  const back = await cf(`/accounts/${ACCT}/workers/scripts/${SCRIPT}/deployments`, { method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ strategy: "percentage", versions: curVersions, annotations: { "workers/message": "automatic rollback: v3 live checks failed" } }) });
  steps.push(back.ok ? `ROLLED BACK to the previous deployment (${curVersions.map((x) => x.version_id).join(", ")})` : `ROLLBACK FAILED: ${back.err}. Roll back in the Cloudflare dashboard: Deployments -> previous version.`);
  out("9 Result", ["DEPLOY FAILED CHECKS", ...steps], "error"); flush(); process.exit(1);
}
out("9 Result", ["DEPLOYED v3 and all live checks passed", ...steps, `rollback if ever needed: Cloudflare -> magnetra-live-api -> Deployments -> version ${curVersions[0].version_id} -> Rollback`]);
flush();
