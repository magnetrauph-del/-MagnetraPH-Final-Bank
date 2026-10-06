// help-sheet.js - v1 (P1) - maliit na "?" na tulong sa loob ng bawat tool. Walang emoji.
// - Lalabas LANG kapag pinindot ng user ang "?" (walang kusang tutorial, walang popup sa pagbukas).
// - Isang sheet (native <dialog>) sa ibabaw ng tool: hindi umaalis sa page, kaya hindi nawawala ang ginagawa.
// - "Buksan ang Help Center": bagong tab (para maiwan ang tool at ang tina-type dito).
// - Galing ang laman sa help-content.js (Taglish o English). textContent lang, walang innerHTML.
// mountHelpSheet({ button, topicId, getLang }) -> { open(), close() -> boolean, refresh() }
import { getTopic, topicText, ui } from "./help-content.js?v=1";

const NS = "http://www.w3.org/2000/svg";
const has = (o, k) => o != null && Object.prototype.hasOwnProperty.call(o, k);

function h(tag, attrs = {}, ...kids) {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) if (v !== false && v != null) n.setAttribute(k, v === true ? "" : String(v));
  n.append(...kids.filter((k) => k != null && k !== false));
  return n;
}
function icon(name) {
  const s = document.createElementNS(NS, "svg");
  for (const [k, v] of [["width", "24"], ["height", "24"], ["aria-hidden", "true"], ["focusable", "false"]]) s.setAttribute(k, v);
  const u = document.createElementNS(NS, "use");
  u.setAttribute("href", "#" + name);
  s.append(u);
  return s;
}
// Isang bloke ng laman (talata, hakbang, listahan, tanong-sagot). Ang "report" ay nasa Help Center lang.
export function renderBlock(block, lang) {
  if (has(block, "p")) return h("p", { class: "helpP" }, block.p);
  if (has(block, "ol")) return h("ol", { class: "helpSteps" }, ...block.ol.map((s) => h("li", {}, s)));
  if (has(block, "ul")) return h("ul", { class: "helpBullets" }, ...block.ul.map((s) => h("li", {}, s)));
  if (has(block, "qa")) return h("dl", { class: "helpQa" }, ...block.qa.flatMap(([q, a]) => [h("dt", {}, q), h("dd", {}, a)]));
  if (has(block, "links")) {
    return h("p", { class: "helpLinks" }, ...block.links.flatMap(([href, key], i) =>
      [i ? " · " : null, h("a", { href }, ui(lang, key))].filter(Boolean)));
  }
  return null;
}

export function mountHelpSheet({ button, topicId, getLang }) {
  const topic = getTopic(topicId);
  if (!button || !topic) return { open() {}, close: () => false, refresh() {} };
  const lang = () => (getLang && getLang() === "en" ? "en" : "fil");

  const d = h("dialog", { class: "sheet helpSheet ctxHelp", id: "ctxHelp", "aria-labelledby": "ctxHelpTitle" });
  const title = h("h2", { id: "ctxHelpTitle", tabindex: "-1" });
  const closeBtn = h("button", { type: "button", class: "closeBtn", id: "ctxHelpClose" }, icon("i-close"));
  const body = h("div", { class: "helpBody" });
  const more = h("a", { class: "btn block helpMore", href: "/help.html#" + topic.id, target: "_blank", rel: "noopener" });
  d.append(h("div", { class: "sheetHead" }, title, closeBtn), body, more);
  document.body.append(d);

  function render() {
    const l = lang();
    const x = topicText(topic, l);
    title.textContent = x.title;
    closeBtn.setAttribute("aria-label", ui(l, "close"));
    body.replaceChildren(h("p", { class: "sheetDesc" }, x.summary), ...x.body.map((b) => renderBlock(b, l)).filter(Boolean));
    more.textContent = ui(l, "openCenter");
    button.setAttribute("aria-label", ui(l, "helpAria", x.title));
  }
  function open() {
    if (d.open) return;
    render();
    button.setAttribute("aria-expanded", "true");
    try { d.showModal(); } catch { d.setAttribute("open", ""); }
    title.focus();
  }
  function close() {
    if (!d.open) return false;
    try { d.close(); } catch { d.removeAttribute("open"); onClosed(); }
    return true;
  }
  function onClosed() {
    button.setAttribute("aria-expanded", "false");
    if (button.isConnected && button.getClientRects().length) button.focus();
  }
  // Pindot sa labas ng sheet: isara (kung doon din nagsimula ang pindot)
  let downOutside = false;
  const outside = (e) => { const r = d.getBoundingClientRect(); return e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom; };
  d.addEventListener("pointerdown", (e) => { downOutside = e.target === d && outside(e); });
  d.addEventListener("click", (e) => { const ok = downOutside && e.target === d && outside(e); downOutside = false; if (ok) close(); });
  d.addEventListener("close", onClosed);
  closeBtn.addEventListener("click", close);
  button.setAttribute("aria-haspopup", "dialog");
  button.setAttribute("aria-expanded", "false");
  button.setAttribute("aria-controls", "ctxHelp");
  button.addEventListener("click", open);
  render();
  return { open, close, refresh: () => { if (d.open) render(); else button.setAttribute("aria-label", ui(lang(), "helpAria", topicText(topic, lang()).title)); } };
}
