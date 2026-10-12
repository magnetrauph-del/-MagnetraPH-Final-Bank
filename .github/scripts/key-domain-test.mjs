// key-domain-test.mjs - READ-ONLY. Asks Google directly how each site key treats each website address.
// A blank test page is answered locally as if it were on that address (nothing deployed, real sites not contacted);
// it only loads reCAPTCHA Enterprise with the key. Prints key fingerprints only.
import { chromium } from "playwright";
import { readFileSync } from "node:fs";
const fp = (k) => `${k.slice(0, 4)}...${k.slice(-4)}`;
const src = readFileSync("public/firebase-init.js", "utf8");
const CODE_KEY = (src.slice(src.indexOf("const PROD_CONFIG"), src.indexOf("const DEV_CONFIG")).match(/recaptchaSiteKey:\s*"([^"]+)"/) || [])[1];
// The two key IDs the owner found in Google Cloud project magnetra-ultra (site keys are public identifiers).
const KEYS = [["site code key", CODE_KEY], ["magnetra-ultra key 1", "6Ld2_ektAAAAAO8Dm0XPXWD2r2bWnDttMzoOuKW4"], ["magnetra-ultra key 2 (magnetraphultra)", "6LcxAbYtAAAAAGyYoPFaDPVlFE-yPwzCYQ1GN2Ox"]];
const ORIGINS = ["https://magnetra.app", "https://magnetra-ultra.web.app", "https://magnetra-ultra--release-check-qagxb0c0.web.app", "https://magnetra.vercel.app", "http://localhost"];
const browser = await chromium.launch();
const lines = [];
for (const [label, key] of KEYS) {
  const row = [];
  for (const origin of ORIGINS) {
    const ctx = await browser.newContext();
    await ctx.route(origin + "/**", (route) => route.fulfill({ status: 200, contentType: "text/html",
      body: `<!doctype html><title>key test</title><script src="https://www.google.com/recaptcha/enterprise.js?render=${key}"></script>` }));
    const page = await ctx.newPage();
    let verdict = "";
    try {
      await page.goto(origin + "/keytest.html", { waitUntil: "load", timeout: 30000 });
      const exec = await page.evaluate((k) => new Promise((res) => {
        const t = setTimeout(() => res("no answer"), 12000);
        try { grecaptcha.enterprise.ready(() => grecaptcha.enterprise.execute(k, { action: "keytest" }).then((x) => { clearTimeout(t); res(x ? "token issued" : "empty"); }, (e) => { clearTimeout(t); res("error " + String(e).slice(0, 60)); })); }
        catch (e) { clearTimeout(t); res("script error " + String(e).slice(0, 60)); }
      }), key);
      await page.waitForTimeout(1500);
      let banner = "";
      for (const f of page.frames()) if (/recaptcha\/enterprise\/anchor/.test(f.url())) {
        const t = await f.evaluate(() => document.body ? document.body.innerText : "").catch(() => "");
        const m = String(t).match(/Invalid domain for site key|Invalid site key|Invalid key type|not loaded in api\.js|Localhost is not in the list|ERROR for site owner[^"\\]*/i);
        if (m) banner = m[0];
      }
      verdict = banner ? `REFUSED: ${banner}` : exec === "token issued" ? "ACCEPTED (token issued)" : `unclear (${exec})`;
    } catch (e) { verdict = "page error " + String(e.message).slice(0, 60); }
    row.push(`  ${origin.replace(/^https?:\/\//, "")}: ${verdict}`);
    await ctx.close();
  }
  lines.push(`${label} ${fp(key)}`, ...row);
}
await browser.close();
const body = lines.join("\n"); console.log(body);
console.log(`::notice title=3 How Google treats each key on each address::${body.replace(/%/g, "%25").replace(/\n/g, "%0A")}`);
