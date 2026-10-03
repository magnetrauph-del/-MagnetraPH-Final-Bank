// followup-templates.js - v1 - Customer Follow-up Messages: mga sitwasyon, ang 30 message at ang pagbuo ng message. Walang emoji.
// PURO: walang DOM, walang network, walang storage, walang Firebase, walang AI. Puwedeng i-test sa Node.
// - 5 sitwasyon x 3 wika (Taglish, Filipino, English) x 2 version = 30 message na nakasulat na (hindi gawa ng AI).
//   Version 1: Warm & Caring. Version 2: Simple & Direct.
// - Ang tina-type ng user (pangalan, produkto, detalye, pirma) ay nililinis gamit ang cleanText ng frozen security core,
//   saka inilalagay bilang text lang. HINDI na ito binabasa ulit bilang template: ang "{name}" o "<b>" na tina-type ng user
//   ay lalabas nang eksakto.
// - DRAFT ang mga message: kailangan pa ng review ng owner at ng native Filipino/Taglish speaker bago i-release (spec AC19).
//
// Ayos ng template (para sa developer lang; hindi kailanman galing sa user):
//   {key}            laman ng field (name, product, detail, sender)
//   {key|salita}     laman ng field, o ang salita kapag walang laman
//   [ ... ]          buong bahagi na lalabas lang kapag may laman ang lahat ng {key} sa loob
//   \n               bagong linya (para sa pirma)
import { cleanText } from "./security-core-shared.js";

export const LIMITS = Object.freeze({ name: 40, product: 60, detail: 80, sender: 40, message: 1000 });
export const SITUATIONS = Object.freeze(["inquiry", "quote-sent", "thinking", "no-reply", "thank-you"]);
export const MSG_LANGS = Object.freeze(["tl", "fil", "en"]); // Taglish, Filipino, English
export const DEFAULT_MSG_LANG = "tl";
export const VERSIONS = Object.freeze([1, 2]);
// Wika ng message para sa lang attribute (walang sariling code ang Taglish; "fil" ang pinakamalapit)
export const MSG_HTML_LANG = Object.freeze({ tl: "fil", fil: "fil", en: "en" });

const FIELDS = ["name", "product", "detail", "sender"];

/* ---------- Ang 30 message ---------- */
const TEMPLATES = {
  inquiry: {
    tl: [
      "Hi {name|po}! Salamat ulit sa pagtanong[ tungkol sa {product}].[ Para sa reference po: {detail}] Kung may iba pa po kayong gustong malaman, message lang po kayo anytime. Happy to help po![\n- {sender}]",
      "Hi {name|po}! Salamat sa pag-inquire[ tungkol sa {product}].[ Detalye: {detail}] May iba pa po ba kayong tanong? Message lang po.[\n- {sender}]",
    ],
    fil: [
      "Magandang araw po[, {name}]! Salamat po sa pagtatanong ninyo[ tungkol sa {product}].[ Narito po ang detalye: {detail}] Kung may iba pa po kayong gustong malaman, huwag po kayong mahiyang magtanong. Mag-message lang po kayo kahit kailan.[\n- {sender}]",
      "Magandang araw po[, {name}]! Salamat po sa pagtatanong[ tungkol sa {product}].[ Detalye: {detail}] May iba pa po ba kayong tanong? Sabihan lang po ako.[\n- {sender}]",
    ],
    en: [
      "Hi {name|there}! Thank you again for asking[ about {product}].[ For your reference: {detail}] If there's anything else you'd like to know, feel free to message me anytime. Happy to help![\n- {sender}]",
      "Hi {name|there}! Thanks for asking[ about {product}].[ Details: {detail}] Any other questions? Just let me know.[\n- {sender}]",
    ],
  },
  "quote-sent": {
    tl: [
      "Hi {name|po}! Gusto ko lang po i-check kung natanggap n'yo na ang quotation[ para sa {product}].[ Para sa reference po: {detail}] Kung may tanong po kayo o gustong ipabago, sabihan n'yo lang ako para mapag-usapan natin. Take your time po. Salamat![\n- {sender}]",
      "Hi {name|po}! Natanggap n'yo na po ba ang quotation[ para sa {product}]?[ Detalye: {detail}] Kung may tanong o gustong ipabago, message lang po. Salamat![\n- {sender}]",
    ],
    fil: [
      "Magandang araw po[, {name}]! Gusto ko lang pong itanong kung natanggap na ninyo ang quotation[ para sa {product}].[ Narito po ang detalye: {detail}] Kung may tanong po kayo o gustong ipabago, sabihan lang po ninyo ako para mapag-usapan natin. Hindi ko po kayo minamadali. Salamat po![\n- {sender}]",
      "Magandang araw po[, {name}]! Natanggap na po ba ninyo ang quotation[ para sa {product}]?[ Detalye: {detail}] Kung may tanong po kayo o gustong ipabago, sabihan lang po ninyo ako. Salamat po![\n- {sender}]",
    ],
    en: [
      "Hi {name|there}! I just wanted to check if you received the quotation[ for {product}].[ For your reference: {detail}] If you have any questions or would like anything changed, just let me know and we can talk it through. No rush at all. Thank you![\n- {sender}]",
      "Hi {name|there}! Did you receive the quotation[ for {product}]?[ Details: {detail}] If you have questions or want changes, just let me know. Thanks![\n- {sender}]",
    ],
  },
  thinking: {
    tl: [
      "Hi {name|po}! Walang problema po, take your time. Salamat po sa pag-consider[ ng {product}].[ Para sa reference po: {detail}] Kung may tanong kayo habang nag-iisip, message lang po, nandito lang ako. Kayo po ang bahala, walang pressure.[\n- {sender}]",
      "Hi {name|po}! Sige po, take your time.[ Detalye: {detail}] Kung may tanong kayo[ tungkol sa {product}], message lang po. Salamat![\n- {sender}]",
    ],
    fil: [
      "Magandang araw po[, {name}]! Walang problema po, pag-isipan n'yo lang po. Salamat po sa interes ninyo[ sa {product}].[ Narito po ang detalye: {detail}] Kung may tanong po kayo habang nag-iisip, sabihan lang po ninyo ako. Kayo po ang bahala. Salamat po![\n- {sender}]",
      "Magandang araw po[, {name}]! Sige po, walang problema.[ Detalye: {detail}] Kung may tanong po kayo[ tungkol sa {product}], sabihan lang po ako. Salamat po![\n- {sender}]",
    ],
    en: [
      "Hi {name|there}! No problem at all, take your time.[ Thank you for considering {product}.][ For your reference: {detail}] If any questions come up while you're deciding, I'm happy to help. It's completely your call, no pressure. Thank you![\n- {sender}]",
      "Hi {name|there}! Sure, take your time.[ Details: {detail}] If you have questions[ about {product}], just message me. Thanks![\n- {sender}]",
    ],
  },
  "no-reply": {
    tl: [
      "Hi {name|po}! Gusto ko lang pong mag-follow up tungkol sa {product|inquiry n'yo}.[ Para sa reference po: {detail}] Kung may tanong pa po kayo, nandito lang ako. Kung hindi pa po ngayon ang tamang oras, okay lang po, message lang kayo kapag ready na. Salamat po![\n- {sender}]",
      "Hi {name|po}! Follow up lang po sa {product|inquiry n'yo}.[ Detalye: {detail}] Kung hindi pa ngayon, okay lang po. Message lang po kapag ready na kayo. Salamat![\n- {sender}]",
    ],
    fil: [
      "Magandang araw po[, {name}]! Gusto ko lang pong mag-follow up tungkol sa {product|tanong ninyo}.[ Narito po ang detalye: {detail}] Kung may tanong pa po kayo, nandito lang ako. Kung hindi pa po ngayon ang tamang oras, ayos lang po. Magsabi lang po kayo kapag handa na kayo. Salamat po![\n- {sender}]",
      "Magandang araw po[, {name}]! Follow up lang po tungkol sa {product|tanong ninyo}.[ Detalye: {detail}] Kung hindi pa po ngayon, ayos lang po. Sabihan lang po ako kapag handa na kayo. Salamat po![\n- {sender}]",
    ],
    en: [
      "Hi {name|there}! I just wanted to follow up on {product|your inquiry}.[ For your reference: {detail}] If you have any questions, I'm happy to help. And if now isn't the right time, that's completely okay. Just message me whenever you're ready. Thank you![\n- {sender}]",
      "Hi {name|there}! Just following up on {product|your inquiry}.[ Details: {detail}] If now isn't a good time, no problem. Message me when you're ready. Thanks![\n- {sender}]",
    ],
  },
  "thank-you": {
    tl: [
      "Hi {name|po}! Maraming salamat po sa pagbili[ ng {product}]. Sana po magustuhan n'yo.[ Para sa reference po: {detail}] Kung may tanong po kayo o may kailangan pa, message lang po anytime. Salamat po ulit sa tiwala![\n- {sender}]",
      "Hi {name|po}! Salamat po sa pagbili[ ng {product}].[ Detalye: {detail}] Kung may tanong, message lang po. Salamat ulit![\n- {sender}]",
    ],
    fil: [
      "Magandang araw po[, {name}]! Maraming salamat po sa pagbili ninyo[ ng {product}]. Sana po ay magustuhan ninyo.[ Narito po ang detalye: {detail}] Kung may tanong po kayo o may kailangan pa, mag-message lang po kayo kahit kailan. Salamat po ulit sa tiwala ninyo![\n- {sender}]",
      "Magandang araw po[, {name}]! Salamat po sa pagbili[ ng {product}].[ Detalye: {detail}] Kung may tanong po kayo, sabihan lang po ako. Salamat po ulit![\n- {sender}]",
    ],
    en: [
      "Hi {name|there}! Thank you so much for your purchase[ of {product}]. I hope you like it.[ For your reference: {detail}] If you have any questions or need anything, feel free to message me anytime. Thanks again for your support![\n- {sender}]",
      "Hi {name|there}! Thanks for your purchase[ of {product}].[ Details: {detail}] If you have any questions, just message me. Thanks again![\n- {sender}]",
    ],
  },
};

/* ---------- Pag-parse ng template (isang beses lang, sa pag-load) ---------- */
// Ibinabalik: [{ t: "text", s }, { t: "field", k, f }, { t: "opt", keys, c: [...] }]
// Nagkakamali agad (throw) kapag sira ang template, para hindi makarating sa user ang sirang message.
function parse(src, where) {
  const out = [];
  let stack = [out];
  let opt = null;
  let i = 0;
  const cur = () => stack[stack.length - 1];
  while (i < src.length) {
    const ch = src[i];
    if (ch === "[") {
      if (opt) throw new Error(`followup template ${where}: nested [`);
      opt = { t: "opt", keys: [], c: [] };
      cur().push(opt);
      stack.push(opt.c);
      i++;
    } else if (ch === "]") {
      if (!opt) throw new Error(`followup template ${where}: stray ]`);
      if (!opt.keys.length) throw new Error(`followup template ${where}: [ ] without a field`);
      stack.pop();
      opt = null;
      i++;
    } else if (ch === "{") {
      const end = src.indexOf("}", i);
      if (end < 0) throw new Error(`followup template ${where}: unclosed {`);
      const [k, ...rest] = src.slice(i + 1, end).split("|");
      if (!FIELDS.includes(k)) throw new Error(`followup template ${where}: unknown field ${k}`);
      const f = rest.join("|");
      if (!opt && !f) throw new Error(`followup template ${where}: {${k}} needs a fallback outside [ ]`);
      if (opt && !f) opt.keys.push(k);
      cur().push({ t: "field", k, f });
      i = end + 1;
    } else {
      let j = i;
      while (j < src.length && !"[]{}".includes(src[j])) j++;
      cur().push({ t: "text", s: src.slice(i, j) });
      i = j;
    }
  }
  if (opt) throw new Error(`followup template ${where}: unclosed [`);
  return out;
}

const PARSED = {};
for (const s of SITUATIONS) {
  PARSED[s] = {};
  for (const l of MSG_LANGS) {
    const list = TEMPLATES[s] && TEMPLATES[s][l];
    if (!Array.isArray(list) || list.length !== VERSIONS.length) throw new Error(`followup template ${s}/${l}: needs ${VERSIONS.length} versions`);
    PARSED[s][l] = list.map((src, v) => parse(src, `${s}/${l}/v${v + 1}`));
  }
}
Object.freeze(PARSED);

/* ---------- Paglilinis ng tina-type ng user ---------- */
const has = (o, k) => o != null && Object.prototype.hasOwnProperty.call(o, k);
// Isang linya lang: inaalis ang nakatagong character (cleanText), pinagsasama ang sobrang space, at nililimitahan ang haba.
function oneLine(value, max) {
  return cleanText(typeof value === "string" ? value : "", max).replace(/\s+/g, " ").trim();
}
// Ang pangalan, produkto at pirma ay nasa gitna ng pangungusap: inaalis ang tuldok, kuwit, tutuldok o semicolon sa dulo
// (hal. "Maria," -> "Hi Maria!"), para walang dobleng bantas.
const noTrail = (s) => s.replace(/[\s.,;:]+$/u, "");
// Ang detalye ay sariling pangungusap: nilalagyan ng tuldok kapag wala pang bantas sa dulo.
const sentence = (s) => (s && !/[.!?…]$/u.test(s) ? s + "." : s);

export function cleanInputs(raw = {}) {
  return {
    name: noTrail(oneLine(raw.name, LIMITS.name)),
    product: noTrail(oneLine(raw.product, LIMITS.product)),
    detail: sentence(oneLine(raw.detail, LIMITS.detail)),
    sender: noTrail(oneLine(raw.sender, LIMITS.sender)),
  };
}

/* ---------- Pagbuo ng message ---------- */
function render(nodes, v) {
  let out = "";
  for (const n of nodes) {
    if (n.t === "text") out += n.s;
    else if (n.t === "field") out += v[n.k] || n.f; // inilalagay bilang text; hindi na binabasa ulit
    else if (n.t === "opt" && n.keys.every((k) => v[k])) out += render(n.c, v);
  }
  return out;
}

export const isSituation = (s) => SITUATIONS.includes(s);
export const isMsgLang = (l) => MSG_LANGS.includes(l);
export const otherVersion = (v) => (v === 2 ? 1 : 2);

// compose({ situation, lang, version, name, product, detail, sender }) -> buong message (string).
// Walang sitwasyon (o hindi kilala) -> "". Hindi kilalang wika -> Taglish. Hindi kilalang version -> 1.
export function compose(input = {}) {
  const situation = has(input, "situation") ? input.situation : "";
  if (!isSituation(situation)) return "";
  const lang = isMsgLang(input.lang) ? input.lang : DEFAULT_MSG_LANG;
  const version = VERSIONS.includes(input.version) ? input.version : 1;
  const v = cleanInputs(input);
  const text = render(PARSED[situation][lang][version - 1], v);
  // Ayos ng linya lang: walang space sa dulo ng linya
  return text.split("\n").map((line) => line.replace(/[ \t]+$/u, "")).join("\n");
}
