// ui-legal.js - v1.1 - para sa privacy.html at terms.html. Walang emoji.
// - Public na page: walang Firebase, walang login check, walang network call, walang tracking.
// - Wika: ipinapakita ang "In short" / "Sa madaling salita" sa piniling wika ng app (mgpref_lang sa pamamagitan ng frozen
//   login-i18n.js; Taglish kapag wala pa). Ang buong legal na teksto ay English (sinasabi ito sa Taglish na buod).
// - v1.1: ang "English / Taglish" na pindutan ay para sa page na ito LANG (sa pagbisitang ito). Hindi na ito nagse-save
//   sa mgpref_lang, kaya hindi na nito binabago ang wika ng Login o ng app; ang Settings ang may-ari ng wika ng app.
// - Bumalik: sa pinanggalingang page ng MagnetraPH (hal. Login, Create Account o Settings); kung wala, sa Login.
// - Gumagana pa rin nang walang JavaScript: makikita ang English na buod at ang buong teksto.
import { getLang as prefGetLang } from "./login-i18n.js";
import { appLang } from "./local-state.js?v=2";

const $ = (id) => document.getElementById(id);
const T = {
  en: { back: "Back", backAria: "Go back", langSwitch: "Taglish", langSwitchAria: "Show the summary in Taglish" },
  fil: { back: "Back", backAria: "Go back", langSwitch: "English", langSwitchAria: "Ipakita ang buod sa English" },
};
let lang = appLang(prefGetLang()) === "en" ? "en" : "fil";
// Public-document navigation only. Keep the actual same-origin in-app entry,
// including its Account section, without accepting arbitrary return URLs.
const inApp = new Set(['/index.html', '/login.html', '/create.html', '/dashboard.html', '/account.html', '/banner.html', '/quote.html', '/followup.html', '/help.html', '/help-answer.html', '/privacy.html', '/terms.html']);
let previous = null;
try {
  const source = new URL(document.referrer);
  if (source.origin === location.origin && !source.username && !source.password && inApp.has(source.pathname) && source.href !== location.href) previous = source.href;
} catch { /* Direct visits keep the explicit Login fallback. */ }
$("backLink").href = previous || '/login.html';

function render() {
  const x = T[lang];
  document.documentElement.lang = lang;
  for (const s of document.querySelectorAll("[data-lang]")) s.hidden = s.getAttribute("data-lang") !== lang;
  for (const n of document.querySelectorAll("[data-en][data-fil]")) n.textContent = n.getAttribute("data-" + lang);
  $("backText").textContent = x.back;
  $("backLink").setAttribute("aria-label", x.backAria);
  const btn = $("langBtn");
  btn.textContent = x.langSwitch;
  btn.setAttribute("aria-label", x.langSwitchAria);
  btn.setAttribute("lang", lang === "en" ? "fil" : "en");
}
function onBack(e) {
  if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  if (previous && history.length > 1) { e.preventDefault(); history.back(); }
}

render();
const btn = $("langBtn");
btn.hidden = false;
btn.addEventListener("click", () => {
  lang = lang === "en" ? "fil" : "en";
  render();
  btn.focus();
});
$("backLink").addEventListener("click", onBack);
