// prod-origin-probe.mjs - PRE-RELEASE, READ-ONLY probe of the new build on the production origin.
// A headless browser opens https://magnetra.app/login.html, but every magnetra.app request is answered from
// this repo's public/ folder (the build that would be released). Nothing is deployed and the real site is not
// contacted. All OTHER requests are real: Firebase SDK, reCAPTCHA Enterprise, App Check, Identity Toolkit, Worker.
// No login, no account, no data written: the only Worker call without login must be refused (401).
// Never prints tokens, API keys or site keys.
import { chromium } from "playwright";
import { readFileSync, existsSync, statSync } from "node:fs";
import { extname, join } from "node:path";

const PREVIEW = "https://magnetra-ultra--release-check-qagxb0c0.web.app";
const TYPES = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml", ".png": "image/png", ".txt": "text/plain; charset=utf-8", ".json": "application/json" };
const scrub = (s) => String(s ?? "")
  .replace(/([?&](key|k|render|token)=)[^&\s"')]+/gi, "$1<hidden>")
  .replace(/AIza[0-9A-Za-z_-]{20,}/g, "<api key>").replace(/6L[0-9A-Za-z_-]{38}/g, "<site key>")
  .replace(/eyJ[0-9A-Za-z_-]{20,}(\.[0-9A-Za-z_-]+)*/g, "<token>").replace(/[0-9A-Za-z_-]{80,}/g, "<long>")
  .replace(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[a-z]{2,}/g, "<email>").slice(0, 220);
const noQuery = (u) => { try { const x = new URL(u); return x.host + x.pathname; } catch { return scrub(u); } };
const notices = [];
const notice = (t, lines) => { const b = lines.join("\n").slice(0, 3900); console.log(`--- ${t}\n${b}`); notices.push([t, b]); };

async function probe(browser, label, base, intercept) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  if (intercept) {
    await ctx.route("https://magnetra.app/**", async (route) => {
      const path = new URL(route.request().url()).pathname;
      const f = join("public", decodeURIComponent(path === "/" ? "/index.html" : path));
      if (existsSync(f) && statSync(f).isFile()) {
        return route.fulfill({ status: 200, body: readFileSync(f), headers: { "content-type": TYPES[extname(f)] || "application/octet-stream" } });
      }
      return route.fulfill({ status: 404, body: "not found", headers: { "content-type": "text/plain" } });
    });
  }
  const page = await ctx.newPage();
  const consoleLines = [], net = [], failed = [];
  page.on("console", (m) => { if (["error", "warning"].includes(m.type())) consoleLines.push(`${m.type()}: ${scrub(m.text())}`); });
  page.on("pageerror", (e) => consoleLines.push(`pageerror: ${scrub(e.message)}`));
  page.on("response", (r) => {
    const u = r.url();
    if (/exchangeRecaptchaEnterpriseToken|identitytoolkit|securetoken|recaptcha\/enterprise|workers\.dev|firebaseappcheck/.test(u)) net.push(`${r.request().method()} ${noQuery(u)} -> ${r.status()}`);
  });
  page.on("requestfailed", (q) => failed.push(`${q.method()} ${noQuery(q.url())}: ${scrub(q.failure()?.errorText)}`));

  const t0 = Date.now();
  let loadStatus = "";
  try { const resp = await page.goto(base + "/login.html", { waitUntil: "load", timeout: 45000 }); loadStatus = resp ? resp.status() : "?"; }
  catch (e) { loadStatus = "failed: " + scrub(e.message); }
  await page.waitForTimeout(4000);
  // reCAPTCHA shows its own error banner (e.g. "Invalid domain for site key") inside its frame; read the text only.
  const rcFrames = [];
  // Which key does the page actually send to reCAPTCHA? Compare with firebase-init.js (fingerprint only).
  const codeSrc = readFileSync("public/firebase-init.js", "utf8");
  const codeKey = (codeSrc.slice(codeSrc.indexOf("const PROD_CONFIG"), codeSrc.indexOf("const DEV_CONFIG")).match(/recaptchaSiteKey:\s*"([^"]+)"/) || [])[1] || "";
  for (const f of page.frames()) {
    if (/recaptcha\/enterprise\/anchor/.test(f.url())) {
      const u = new URL(f.url()), k = u.searchParams.get("k") || "", co = u.searchParams.get("co") || "";
      let origin = ""; try { origin = Buffer.from(co.replace(/\./g, "="), "base64").toString("utf8"); } catch {}
      rcFrames.push(`key sent ${k.slice(0, 4)}...${k.slice(-4)} (same as firebase-init.js: ${k && k === codeKey ? "YES" : "NO"}), origin reported to Google: ${origin || "?"}`);
    }
    if (/recaptcha\/enterprise\/(anchor|bframe)/.test(f.url())) {
      const t = await f.evaluate(() => document.body ? document.body.innerText : "").catch(() => "");
      rcFrames.push(scrub(String(t).replace(/\s+/g, " ").trim().slice(0, 160)) || "(no text)");
    }
  }
  const ui = await page.evaluate(() => ({ title: document.title, hasEmail: !!document.querySelector("input[type=email]"), hasPassword: !!document.querySelector("input[type=password]") })).catch(() => ({}));

  const r = await page.evaluate(async () => {
    const out = {};
    let ac = "";
    try {
      const fi = await import("/firebase-init.js");
      out.env = fi.ENV; out.workerHost = new URL(fi.API_BASE).host; out.appCheckInitialised = !!fi.appCheck; out.authInitialised = !!fi.auth;
      try { await fi.auth.authStateReady(); out.signedIn = !!fi.auth.currentUser; } catch (e) { out.signedIn = "error " + (e.code || e.message); }
      try {
        const A = await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js");
        await A.initializeRecaptchaConfig(fi.auth); out.identityToolkit = "reachable with this origin (config call ok)";
      } catch (e) { out.identityToolkit = "error " + (e.code || "") + " " + String(e.message).slice(0, 120); }
      try {
        const AC = await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-app-check.js");
        const t = await AC.getToken(fi.appCheck, true);
        ac = t && t.token ? t.token : "";
        out.appCheck = ac ? "token received" : "no token";
      } catch (e) { out.appCheck = "error " + (e.code || "") + " " + String(e.message).slice(0, 160); }
      try { const h = await fetch(fi.API_BASE + "/"); out.workerHealth = `${h.status} ${(await h.text()).slice(0, 40)}`; }
      catch (e) { out.workerHealth = "blocked (CORS or network): " + e.message; }
      try {
        const s = await fetch(fi.API_BASE + "/api/signup", { method: "POST", headers: { "Content-Type": "application/json", ...(ac ? { "X-Firebase-AppCheck": ac } : {}) }, body: "{}" });
        out.workerNoLogin = `${s.status} ${(await s.text()).slice(0, 60)} (App Check token ${ac ? "sent" : "not available"})`;
      } catch (e) { out.workerNoLogin = "blocked (CORS or network): " + e.message; }
    } catch (e) { out.fatal = String(e.message).slice(0, 160); }
    out.webdriver = navigator.webdriver === true;
    return out;
  }).catch((e) => ({ fatal: scrub(e.message) }));

  notice(`${label}`, [
    `page: ${base.replace("https://", "")}/login.html ${intercept ? "(new build answered from public/, real site not contacted)" : "(deployed preview)"} -> ${loadStatus}; title "${ui.title || "-"}"; email field ${ui.hasEmail ? "yes" : "no"}; password field ${ui.hasPassword ? "yes" : "no"}; ${Date.now() - t0} ms`,
    ...Object.entries(r).map(([k, v]) => `${k}: ${scrub(v)}`),
    `reCAPTCHA frame text: ${rcFrames.join(" | ") || "-"}`,
    `network: ${net.length ? net.join(" | ") : "-"}`,
    `failed requests: ${failed.length ? failed.join(" | ") : "none"}`,
    `console errors/warnings (${consoleLines.length}): ${consoleLines.slice(0, 8).join(" | ") || "none"}`,
  ]);
  await ctx.close();
}

const browser = await chromium.launch();
await probe(browser, "1 Production origin magnetra.app (new build, not deployed)", "https://magnetra.app", true);
await probe(browser, "2 Preview origin (deployed new build)", PREVIEW, false);
await browser.close();
for (const [t, b] of notices) console.log(`::notice title=${t}::${b.replace(/%/g, "%25").replace(/\r/g, "%0D").replace(/\n/g, "%0A")}`);
