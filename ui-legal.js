// ui-legal.js - v1 (P0) - para sa privacy.html at terms.html. Walang emoji.
// - Public na page: walang Firebase, walang login check, walang network call, walang tracking.
// - Wika: ipinapakita ang "In short" / "Sa madaling salita" sa piniling wika ng app (mgpref_lang sa pamamagitan ng frozen
//   login-i18n.js; Taglish kapag wala pa). Ang buong legal na teksto ay English (sinasabi ito sa Taglish na buod).
// - Ang "English / Taglish" na pindutan ay nagse-save ng pinili, tulad ng Settings.
// - Bumalik: sa pinanggalingang page ng MagnetraPH (hal. Login, Create Account o Settings); kung wala, sa Login.
// - Gumagana pa rin nang walang JavaScript: makikita ang English na buod at ang buong teksto.
import { getLang as prefGetLang, setLang as prefSetLang } from "./login-i18n.js";
import { appLang } from "./local-state.js?v=2";

const $ = (id) => document.getElementById(id);
const T = {
  en: { back: "Back", backAria: "Go back", langSwitch: "Taglish", langSwitchAria: "Show the summary in Taglish" },
  fil: { back: "Bumalik", backAria: "Bumalik", langSwitch: "English", langSwitchAria: "Ipakita ang buod sa English" },
};
let lang = appLang(prefGetLang()) === "en" ? "en" : "fil";

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
  let same = false;
  try { same = new URL(document.referrer).origin === location.origin; } catch { same = false; }
  if (same && history.length > 1) { e.preventDefault(); history.back(); }
}

render();
const btn = $("langBtn");
btn.hidden = false;
btn.addEventListener("click", () => {
  lang = lang === "en" ? "fil" : "en";
  prefSetLang(lang); // iisang preference ng buong app (frozen login-i18n.js ang nagsi-save)
  render();
  btn.focus();
});
$("backLink").addEventListener("click", onBack);
