// report.js - v1 (P0) - "Mag-report ng problema": magaan, tapat, at walang server. Walang emoji.
// - Bubuksan ang email app ng user na may laman nang report (mailto:). ANG USER ANG MAGSE-SEND; walang ipinapadala dito.
//   Hindi sinasabing "naipadala na": hindi ito malalaman ng page.
// - Walang tahimik na pagkuha ng device info: isinasama LANG kapag nilagyan ng check, at ipinapakita muna kung ano mismo.
//   Walang email, user ID, token, pangalan ng customer o laman ng tool na kusang isinasama.
// - Kapag walang nagbukas na email app: may kopya ng buong report na puwedeng i-copy at i-email nang mano-mano.
// - Ginagamit ng Dashboard (Settings > Tulong, at ang Help sheet) at ng help.html. Native <dialog>, walang innerHTML.
import { cleanText } from "./security-core-shared.js";

export const SUPPORT_EMAIL = "support@magnetra.app";
export const APP_VERSION = "1.1";
export const REPORT_TYPES = Object.freeze(["result", "instructions", "design", "performance", "missing", "other"]);
export const MSG_MAX = 1000;

const S = {
  en: {
    title: "Report a problem",
    intro: "Tell us what happened. This opens your email app with the report filled in. You check it and send it yourself.",
    typeLegend: "What is it about?",
    "type.result": "Result (wrong or broken output)",
    "type.instructions": "Instructions (not clear)",
    "type.design": "Design or how it looks",
    "type.performance": "Speed or loading",
    "type.missing": "Something missing",
    "type.other": "Other",
    msgLabel: "What happened?",
    msgPh: "For example: the banner didn't download in the Messenger browser.",
    msgHint: (n) => `Don't include your password or your customers' personal details. Up to ${n} characters.`,
    deviceLabel: "Include device info",
    deviceHint: "Only what's listed below is added:",
    send: "Open my email app",
    sendNote: `You send it yourself. Nothing reaches us until you do. Our address: ${SUPPORT_EMAIL}`,
    errMsg: "Describe what happened first, even in a few words.",
    opened: "We tried to open your email app. If it opened, check the report there, then send it.",
    fallback: `Nothing opened? Copy the report below and email it to ${SUPPORT_EMAIL}.`,
    copyLabel: "Report text",
    copy: "Copy report",
    copied: "Report copied. Paste it in an email to us.",
    copyFail: "Copying isn't available here. Select the text and copy it.",
    close: "Close",
    subject: (type) => `MagnetraPH report: ${type}`,
    bodyType: "Type",
    bodyMsg: "What happened",
    bodyDevice: "Device info (I chose to include this)",
  },
  fil: {
    title: "Mag-report ng problema",
    intro: "Sabihin sa amin ang nangyari. Bubuksan nito ang email app mo na may laman nang report. Ikaw ang magche-check at magse-send.",
    typeLegend: "Tungkol saan ito?",
    "type.result": "Resulta (mali o sira ang lumabas)",
    "type.instructions": "Instructions (hindi malinaw)",
    "type.design": "Design o itsura",
    "type.performance": "Bilis o pag-load",
    "type.missing": "May kulang",
    "type.other": "Iba pa",
    msgLabel: "Ano ang nangyari?",
    msgPh: "Hal. Hindi na-download ang banner sa Messenger browser.",
    msgHint: (n) => `Huwag isama ang password mo o personal na detalye ng customer mo. Hanggang ${n} na character.`,
    deviceLabel: "Isama ang device info",
    deviceHint: "Ito lang ang idadagdag:",
    send: "Buksan ang email app ko",
    sendNote: `Ikaw ang magse-send. Wala kaming matatanggap hangga't hindi mo ito sine-send. Ang address namin: ${SUPPORT_EMAIL}`,
    errMsg: "Ikuwento muna ang nangyari, kahit maikli lang.",
    opened: "Sinubukan naming buksan ang email app mo. Kung bumukas, i-check doon ang report, saka i-send.",
    fallback: `Walang nagbukas? Kopyahin ang report sa ibaba at i-email sa ${SUPPORT_EMAIL}.`,
    copyLabel: "Text ng report",
    copy: "Kopyahin ang report",
    copied: "Nakopya ang report. I-paste ito sa email para sa amin.",
    copyFail: "Hindi puwedeng mag-copy dito. Piliin ang text at kopyahin ito.",
    close: "Isara",
    subject: (type) => `MagnetraPH report: ${type}`,
    bodyType: "Uri",
    bodyMsg: "Ano ang nangyari",
    bodyDevice: "Device info (pinili kong isama)",
  },
};
const has = (o, k) => o != null && Object.prototype.hasOwnProperty.call(o, k);
const NS = "http://www.w3.org/2000/svg";

/* ---------- Device info (ipinapakita muna; isinasama lang kapag pinili) ---------- */
function browserName(ua) {
  if (/FBAN|FBAV|FB_IAB/i.test(ua)) return "Facebook app browser";
  if (/Messenger/i.test(ua)) return "Messenger app browser";
  if (/Instagram/i.test(ua)) return "Instagram app browser";
  if (/TikTok|musical_ly|BytedanceWebview/i.test(ua)) return "TikTok app browser";
  const rules = [[/EdgA?\/(\d+)/, "Edge"], [/SamsungBrowser\/(\d+)/, "Samsung Internet"], [/OPR\/(\d+)/, "Opera"],
    [/(?:CriOS|Chrome)\/(\d+)/, "Chrome"], [/(?:FxiOS|Firefox)\/(\d+)/, "Firefox"], [/Version\/(\d+)[\d.]* .*Safari/, "Safari"]];
  for (const [re, name] of rules) { const m = re.exec(ua); if (m) return `${name} ${m[1]}`; }
  return "Other browser";
}
function systemName(ua) {
  let m;
  if ((m = /Android (\d+)/.exec(ua))) return `Android ${m[1]}`;
  if ((m = /(?:iPhone|iPad|iPod).*? OS (\d+)/.exec(ua))) return `iOS ${m[1]}`;
  if (/Windows/.test(ua)) return "Windows";
  if (/Mac OS X/.test(ua)) return "macOS";
  if (/Linux/.test(ua)) return "Linux";
  return "Other";
}
function localTime(d = new Date()) {
  const p = (n) => String(n).padStart(2, "0");
  const off = -d.getTimezoneOffset();
  const sign = off >= 0 ? "+" : "-";
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())} (UTC${sign}${p(Math.floor(Math.abs(off) / 60))}:${p(Math.abs(off) % 60)})`;
}
export function deviceInfo(lang) {
  const ua = String(navigator.userAgent || "");
  const root = document.documentElement;
  const forced = root.getAttribute("data-theme");
  const dark = forced ? forced === "dark" : (typeof matchMedia === "function" && matchMedia("(prefers-color-scheme: dark)").matches);
  return [
    ["Page", location.pathname],
    ["App", `MagnetraPH web ${APP_VERSION}`],
    ["Browser", browserName(ua)],
    ["System", systemName(ua)],
    ["Screen", `${screen.width} x ${screen.height}, window ${innerWidth} x ${innerHeight}`],
    ["Language", lang === "en" ? "English" : "Taglish"],
    ["Appearance", `${forced || "same as phone"} (${dark ? "dark" : "light"} now)`],
    ["Online", navigator.onLine === false ? "no" : "yes"],
    ["Time", localTime()],
  ];
}

/* ---------- Ang report sheet ---------- */
// createReport({ getLang }) -> { open(opener), close() -> boolean, isOpen(), refresh() }
export function createReport({ getLang }) {
  const lang = () => (getLang && getLang() === "en" ? "en" : "fil");
  const T = (k, ...a) => { const set = S[lang()]; const v = has(set, k) ? set[k] : S.en[k]; return typeof v === "function" ? v(...a) : v; };
  const texts = [];
  function h(tag, attrs = {}, ...kids) {
    const n = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) if (v !== false && v != null) n.setAttribute(k, v === true ? "" : String(v));
    n.append(...kids.filter((k) => k != null && k !== false));
    return n;
  }
  const tx = (tag, attrs, fn) => { const n = h(tag, attrs); n.textContent = fn(); texts.push([n, fn]); return n; };
  function icon(name) {
    const s = document.createElementNS(NS, "svg");
    for (const [k, v] of [["width", "24"], ["height", "24"], ["aria-hidden", "true"], ["focusable", "false"]]) s.setAttribute(k, v);
    const u = document.createElementNS(NS, "use");
    u.setAttribute("href", "#" + name);
    s.append(u);
    return s;
  }

  const d = h("dialog", { class: "sheet reportSheet", id: "reportDialog", "aria-labelledby": "reportTitle", "aria-describedby": "reportIntro" });
  const title = tx("h2", { id: "reportTitle", tabindex: "-1" }, () => T("title"));
  const closeBtn = h("button", { type: "button", class: "closeBtn", id: "reportClose" }, icon("i-close"));
  const syncCloseLabel = () => closeBtn.setAttribute("aria-label", T("close"));
  syncCloseLabel();
  const intro = tx("p", { class: "sheetDesc", id: "reportIntro" }, () => T("intro"));

  const radios = REPORT_TYPES.map((v) => h("input", { type: "radio", name: "reportType", value: v, id: "reportType-" + v }));
  const typeSet = h("fieldset", { class: "reportTypes" }, tx("legend", { class: "tName" }, () => T("typeLegend")),
    h("div", { class: "toolList" }, ...REPORT_TYPES.map((v, i) =>
      h("label", { class: "toolRow", for: "reportType-" + v }, radios[i], h("span", { class: "tText" }, tx("span", { class: "tName" }, () => T("type." + v)))))));

  const msg = h("textarea", { id: "reportMsg", class: "askInput reportArea", rows: "5", maxlength: String(MSG_MAX), "aria-describedby": "reportMsgHint reportErr" });
  const syncPh = () => msg.setAttribute("placeholder", T("msgPh"));
  syncPh();
  const msgField = h("div", { class: "reportField" }, tx("label", { class: "tName", for: "reportMsg" }, () => T("msgLabel")), msg,
    tx("p", { class: "sheetNote", id: "reportMsgHint" }, () => T("msgHint", MSG_MAX)));

  const devBox = h("input", { type: "checkbox", id: "reportDevice", "aria-controls": "reportDevicePreview", "aria-expanded": "false" });
  const devList = h("dl", { class: "reportPreview", id: "reportDevicePreview", hidden: true });
  const devRow = h("label", { class: "toolRow", for: "reportDevice" }, devBox, h("span", { class: "tText" }, tx("span", { class: "tName" }, () => T("deviceLabel"))));
  const devHint = tx("p", { class: "sheetNote", hidden: true }, () => T("deviceHint"));

  const err = h("p", { class: "sheetError", id: "reportErr", role: "alert", hidden: true });
  const sendBtn = h("button", { type: "submit", class: "askBtn reportSend" }, icon("i-mail"), tx("span", {}, () => T("send")));
  const sendNote = tx("p", { class: "sheetNote" }, () => T("sendNote"));
  const status = h("p", { class: "sheetNote reportStatus", role: "status" });
  const copyArea = h("textarea", { id: "reportCopyArea", class: "askInput reportArea", rows: "6", readonly: true });
  const copyBtn = tx("button", { type: "button", class: "btn" }, () => T("copy"));
  const copyMsg = h("p", { class: "sheetNote", role: "status" });
  const fallback = h("div", { class: "reportFallback", hidden: true },
    tx("p", { class: "sheetNote" }, () => T("fallback")),
    tx("label", { class: "tName", for: "reportCopyArea" }, () => T("copyLabel")), copyArea, h("div", { class: "askRow" }, copyBtn), copyMsg);

  const form = h("form", { novalidate: true }, typeSet, msgField, h("div", { class: "toolList" }, devRow), devHint, devList, err,
    h("div", { class: "askRow" }, sendBtn), sendNote, status, fallback);
  d.append(h("div", { class: "sheetHead" }, title, closeBtn), intro, form);
  document.body.append(d);

  let opener = null;
  let statusKey = null;
  let copyKey = null;
  const chosenType = () => { const r = radios.find((x) => x.checked); return r ? r.value : "other"; };

  function renderDevice() {
    devList.replaceChildren(...deviceInfo(lang()).flatMap(([k, v]) => [h("dt", {}, k), h("dd", {}, v)]));
  }
  function reportText() {
    const type = chosenType();
    const typeName = S.en["type." + type]; // English sa email: para sa support (pareho ang ayos kahit anong wika)
    const lines = [`${T("bodyType")}: ${typeName}`, "", `${T("bodyMsg")}:`, cleanText(msg.value, MSG_MAX).trim()];
    if (devBox.checked) {
      lines.push("", `--- ${T("bodyDevice")} ---`, ...deviceInfo(lang()).map(([k, v]) => `${k}: ${v}`));
    }
    return { subject: T("subject", typeName), body: lines.join("\r\n") };
  }
  function mailtoHref({ subject, body }) {
    return `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }
  function setStatus(key) { statusKey = key; status.textContent = key ? T(key) : ""; }
  function setCopyMsg(key) { copyKey = key; copyMsg.textContent = key ? T(key) : ""; }
  function reset() {
    radios.forEach((r) => { r.checked = false; });
    msg.value = "";
    msg.removeAttribute("aria-invalid");
    devBox.checked = false;
    devBox.setAttribute("aria-expanded", "false");
    devList.hidden = true;
    devHint.hidden = true;
    err.hidden = true;
    err.textContent = "";
    fallback.hidden = true;
    copyArea.value = "";
    setStatus(null);
    setCopyMsg(null);
  }

  devBox.addEventListener("change", () => {
    devBox.setAttribute("aria-expanded", String(devBox.checked));
    if (devBox.checked) renderDevice();
    devList.hidden = !devBox.checked;
    devHint.hidden = !devBox.checked;
  });
  msg.addEventListener("input", () => { msg.removeAttribute("aria-invalid"); if (!err.hidden) { err.hidden = true; err.textContent = ""; } });
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (cleanText(msg.value, MSG_MAX).trim().length < 3) {
      err.textContent = T("errMsg");
      err.hidden = false;
      msg.setAttribute("aria-invalid", "true");
      msg.focus();
      return;
    }
    const r = reportText();
    copyArea.value = `To: ${SUPPORT_EMAIL}\r\nSubject: ${r.subject}\r\n\r\n${r.body}`;
    const a = document.createElement("a");
    a.href = mailtoHref(r);
    a.hidden = true;
    document.body.append(a);
    try { a.click(); } catch { /* walang email app: nandiyan ang kopya */ }
    a.remove();
    setStatus("opened");
    setCopyMsg(null);
    fallback.hidden = false;
  });
  copyArea.addEventListener("focus", () => copyArea.select());
  copyBtn.addEventListener("click", async () => {
    let ok = false;
    try {
      if (window.isSecureContext && navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
        await navigator.clipboard.writeText(copyArea.value);
        ok = true;
      }
    } catch { ok = false; }
    setCopyMsg(ok ? "copied" : "copyFail");
    if (!ok) { copyArea.focus(); copyArea.select(); }
  });
  closeBtn.addEventListener("click", () => close());
  d.addEventListener("close", () => {
    const o = opener;
    opener = null;
    if (o) { o.setAttribute("aria-expanded", "false"); if (o.isConnected && o.getClientRects().length) o.focus(); }
  });

  function open(from) {
    if (d.open) return;
    reset();
    opener = from || null;
    if (opener) opener.setAttribute("aria-expanded", "true");
    try { d.showModal(); } catch { d.setAttribute("open", ""); }
    title.focus();
  }
  function close() {
    if (!d.open) return false;
    try { d.close(); } catch { d.removeAttribute("open"); }
    return true;
  }
  function refresh() {
    texts.forEach(([n, fn]) => { n.textContent = fn(); });
    syncCloseLabel();
    syncPh();
    if (statusKey) status.textContent = T(statusKey);
    if (copyKey) copyMsg.textContent = T(copyKey);
    if (!err.hidden) err.textContent = T("errMsg");
    if (devBox.checked) renderDevice();
  }
  return { open, close, isOpen: () => d.open, refresh, element: d };
}
