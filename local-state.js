// local-state.js - v2 - maliit na lokal na estado na pinaghahatian ng Dashboard at ng mga tool. Walang emoji.
// v2 (P1 Free completion): Friendly Care on/off (5) at ang konteksto ng huling quotation para sa Follow-up (6).
// Walang network, walang Firebase, walang server. Ang frozen logout (Auth Core) ang nagbubura ng lahat ng "mag_*"
// sa localStorage at ng buong sessionStorage, kaya nabubura rin ang mga ito pagka-logout (ligtas sa hiram na phone).
//
// 1) Business Profile (localStorage "mag_bizprofile"): pangalan ng business at contact LANG.
//    - Galing lang sa tina-type ng user sa Business Profile. Walang hinuhulaan, walang idinadagdag.
//    - Naka-version para madagdagan sa susunod (category, logo, oras, atbp.) nang hindi nasisira ang luma.
// 2) Natapos na gawain sa session na ito (sessionStorage "mag_done"): bilang lang (walang laman, pangalan o text).
//    Binibilang lang kapag talagang nangyari: nagawa ang PNG ng banner, nakopya ang quotation, nakopya o na-share
//    ang follow-up message. Ito ang ebidensya ng Friendly Care sa Dashboard.
// 3) Friendly Care (sessionStorage "mag_care"): "1" kapag naipakita na (isang beses lang bawat session).
// 4) Wika: binabasa lang ang "mgpref_lang" (hawak ng frozen login-i18n.js); Filipino/Taglish kapag wala pang pinili.
// 5) Friendly Care on/off (localStorage "mgpref_care"): "off" lang kapag pinatay ng user sa Settings. Preference ito ng
//    device (hindi personal na data), kaya naiiwan pagka-logout, tulad ng wika at itsura. Walang laman = naka-on.
// 6) Huling quotation (sessionStorage "mag_qctx"): pagkatapos lang ng TOTOONG kopya o print ng Quotation. Pangalan ng
//    customer, unang item, ilang item, total (centavo), wika ng dokumento at oras. Para lang may maalok ang Follow-up sa
//    parehong tab; hindi kailanman sa URL, sa localStorage o sa server. Nabubura kapag isinara ang tab, pagka-logout
//    (frozen Auth Core), pagkalipas ng 12 oras, o kapag pinindot ng user ang "Alisin". Walang hinuhulaang value: kapag
//    hindi kasya sa field ng Follow-up ang pangalan o item, hindi na ito isinasama (walang pinuputol).
import { cleanText } from "./security-core-shared.js";

export const BIZ_KEY = "mag_bizprofile";
export const DONE_KEY = "mag_done";
export const CARE_KEY = "mag_care";
// Kasya sa lahat ng tool: Instant Banner (40/50), Quotes (60/80)
export const BIZ_LIMITS = Object.freeze({ name: 40, contact: 50 });
export const DONE_KINDS = Object.freeze(["banner", "quote", "followup"]);
const BIZ_VERSION = 1;

const store = (kind) => { try { return kind === "session" ? window.sessionStorage : window.localStorage; } catch { return null; } };
const read = (kind, key) => { try { return store(kind)?.getItem(key) ?? null; } catch { return null; } };
const write = (kind, key, value) => {
  try { const st = store(kind); if (!st) return false; if (value === null) st.removeItem(key); else st.setItem(key, value); return true; } catch { return false; }
};
const has = (o, k) => o != null && Object.prototype.hasOwnProperty.call(o, k);
// Isang linya: nililinis ng frozen security core, saka pinagdudugtong ang mga espasyo at bagong linya
export const oneLine = (v, max) => cleanText(typeof v === "string" ? v.replace(/\s+/g, " ") : "", max);

/* ---------- Business Profile ---------- */
// Ibinabalik: { name, contact } (puwedeng walang laman ang alinman), o null kapag walang naka-save.
export function readBusinessProfile() {
  const raw = read("local", BIZ_KEY);
  if (!raw) return null;
  try {
    const o = JSON.parse(raw);
    if (!o || typeof o !== "object" || o.v !== BIZ_VERSION) return null;
    const p = { name: oneLine(o.name, BIZ_LIMITS.name), contact: oneLine(o.contact, BIZ_LIMITS.contact) };
    return p.name || p.contact ? p : null;
  } catch { return null; }
}
// Sine-save ang nililinis na laman. Kapag parehong walang laman: binubura ang profile.
// Ibinabalik: { ok, profile } (profile = null kapag nabura).
export function saveBusinessProfile({ name, contact } = {}) {
  const p = { name: oneLine(name, BIZ_LIMITS.name), contact: oneLine(contact, BIZ_LIMITS.contact) };
  if (!p.name && !p.contact) return { ok: write("local", BIZ_KEY, null), profile: null };
  return { ok: write("local", BIZ_KEY, JSON.stringify({ v: BIZ_VERSION, ...p })), profile: p };
}

/* ---------- Mga natapos na gawain (session lang) ---------- */
export function readDone() {
  const out = { banner: 0, quote: 0, followup: 0 };
  try {
    const o = JSON.parse(read("session", DONE_KEY) || "{}");
    for (const k of DONE_KINDS) if (has(o, k) && Number.isInteger(o[k]) && o[k] > 0 && o[k] < 10000) out[k] = o[k];
  } catch {}
  return out;
}
export function doneTotal(d = readDone()) { return DONE_KINDS.reduce((n, k) => n + d[k], 0); }
export function markDone(kind) {
  if (!DONE_KINDS.includes(kind)) return;
  const d = readDone();
  d[kind] += 1;
  write("session", DONE_KEY, JSON.stringify(d));
}

/* ---------- Friendly Care (isang beses bawat session) ---------- */
export const careShown = () => read("session", CARE_KEY) === "1";
export const setCareShown = () => write("session", CARE_KEY, "1");

/* ---------- Friendly Care on/off (Settings) ---------- */
export const CARE_PREF_KEY = "mgpref_care";
export const careEnabled = () => read("local", CARE_PREF_KEY) !== "off";
export const setCareEnabled = (on) => write("local", CARE_PREF_KEY, on ? null : "off");

/* ---------- Huling quotation (session lang) para sa Follow-up ---------- */
export const QCTX_KEY = "mag_qctx";
export const QCTX_MAX_AGE_MS = 12 * 60 * 60 * 1000;
// Kapareho ng limit ng Follow-up (pangalan 40, produkto 60). Mas mahaba: hindi isinasama (walang pinuputol).
export const QCTX_LIMITS = Object.freeze({ customer: 40, item: 60, items: 30 });
const graphemeCount = (s) => Array.from(s).length;
const fits = (s, max) => (s && graphemeCount(s) <= max ? s : "");
function cleanCtx(o) {
  if (!o || typeof o !== "object") return null;
  const customer = fits(oneLine(o.customer, 200), QCTX_LIMITS.customer);
  const item = fits(oneLine(o.item, 200), QCTX_LIMITS.item);
  const count = Number.isInteger(o.count) && o.count >= 1 && o.count <= QCTX_LIMITS.items ? o.count : 0;
  const total = typeof o.total === "string" && /^\d{1,16}$/.test(o.total) ? o.total : "";
  const lang = o.lang === "en" || o.lang === "fil" ? o.lang : "";
  const at = Number.isFinite(o.at) ? o.at : 0;
  if (!total || !count || !lang || !at) return null; // kulang: walang konteksto (walang hula)
  return { customer, item, count, total, lang, at };
}
// Tinatawag lang ng Quotation pagkatapos ng kumpirmadong kopya o pagsara ng print screen.
export function saveQuoteContext({ customer, item, count, total, lang } = {}) {
  const c = cleanCtx({ customer, item, count, total: typeof total === "bigint" ? total.toString() : total, lang, at: Date.now() });
  if (!c) return false;
  return write("session", QCTX_KEY, JSON.stringify(c));
}
// Ibinabalik ang konteksto, o null (wala, sira, o lampas na sa 12 oras: binubura na rin).
export function readQuoteContext(now = Date.now()) {
  const raw = read("session", QCTX_KEY);
  if (!raw) return null;
  let c = null;
  try { c = cleanCtx(JSON.parse(raw)); } catch { c = null; }
  if (!c || now - c.at > QCTX_MAX_AGE_MS || c.at - now > 60000) { write("session", QCTX_KEY, null); return null; }
  return c;
}
export const clearQuoteContext = () => write("session", QCTX_KEY, null);

/* ---------- Wika: Taglish (Filipino) ang default ng MagnetraPH ---------- */
// Ang frozen login-i18n.js ang may-ari ng "mgpref_lang" at ito lang ang nagsi-save nito; dito BINABASA lang.
// Kapag wala pang piniling wika ang user, "en" ang default ng frozen file. Sa Dashboard at mga tool, Filipino/Taglish
// ang default; English lang kapag pinili ito ng user. Walang isinusulat dito (walang hinuhulaang pinili).
export const LANG_KEY = "mgpref_lang";
export const DEFAULT_LANG = "fil";
// Wika ng page: ang naka-save na pinili ("en" o "fil"), o ang default kapag wala pa.
// Kapag hindi mabasa ang storage: sinusunod ang frozen file (prefLang), para gumana pa rin ang pagpili sa page na ito.
const isLang = (v) => v === "en" || v === "fil";
export function appLang(prefLang) {
  const fallback = isLang(prefLang) ? prefLang : DEFAULT_LANG;
  const st = store("local");
  if (!st) return fallback;
  let saved;
  try { saved = st.getItem(LANG_KEY); } catch { return fallback; }
  return isLang(saved) ? saved : DEFAULT_LANG;
}
