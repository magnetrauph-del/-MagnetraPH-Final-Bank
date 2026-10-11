// quote-calc.js - v1 - pure na kuwenta at pag-check ng Quote Maker (Quotes). Walang emoji.
// Walang DOM, network, storage, login o Firebase. Puwedeng i-test sa Node.
// Pera: buong centavo (BigInt; P1.00 = 100n). Dami: hundredths (1.5 = 150n). Porsyento: basis points (12.5% = 1250n).
// Amount ng bawat linya = round half up sa centavo; ang subtotal ay suma ng mga naka-print na amount (laging tugma).

export const LIMITS = Object.freeze({ name: 60, contact: 80, quoteNo: 30, desc: 120, notes: 600, items: 30 });
const QTY_MIN = 1n;            // 0.01
const QTY_MAX = 9999999n;      // 99,999.99
const PRICE_MAX = 999999999n;  // P9,999,999.99
const TOTAL_MAX = 99999999999n; // P999,999,999.99
const BP_MIN = 1n;             // 0.01%
const BP_MAX = 10000n;         // 100%
export const MONEY = Object.freeze({ QTY_MIN, QTY_MAX, PRICE_MAX, TOTAL_MAX, BP_MIN, BP_MAX });

const PESO = "\u20B1";
// Digits na may tamang comma (1,500 / 12,345,678) o walang comma; opsyonal na decimal point
const NUM_RE = /^(\d{1,3}(?:,\d{3})+|\d+)?(?:\.(\d*))?$/;

// "1,500.50" -> 150050n (hundredths). Walang minus, exponent, espasyo sa loob, o higit 2 decimal.
function parseHundredths(text, { peso = false, percent = false } = {}) {
  let s = typeof text === "string" ? text.trim() : "";
  if (!s) return { ok: false, code: "empty" };
  if (peso && s.startsWith(PESO)) s = s.slice(PESO.length).trimStart();
  if (percent && s.endsWith("%")) s = s.slice(0, -1).trimEnd();
  if (/^[-\u2212]/.test(s)) return { ok: false, code: "negative" };
  const m = NUM_RE.exec(s);
  if (!m || (!m[1] && !m[2])) return { ok: false, code: "format" };
  const frac = m[2] || "";
  if (frac.length > 2) return { ok: false, code: "decimals" };
  const whole = (m[1] || "0").replace(/,/g, "");
  if (whole.replace(/^0+/, "").length > 13) return { ok: false, code: "max" };
  return { ok: true, value: BigInt(whole) * 100n + BigInt((frac + "00").slice(0, 2)) };
}
const inRange = (r, min, max) => (!r.ok ? r : r.value < min ? { ok: false, code: "min" } : r.value > max ? { ok: false, code: "max" } : r);

// Presyo bawat isa: P0.00 hanggang P9,999,999.99 (puwede ang P0.00 para sa libreng item)
export const parseMoney = (text) => inRange(parseHundredths(text, { peso: true }), 0n, PRICE_MAX);
// Dami: 0.01 hanggang 99,999.99 (bawal ang 0)
export const parseQty = (text) => inRange(parseHundredths(text), QTY_MIN, QTY_MAX);
// Porsyento ng diskwento: 0.01% hanggang 100%
export const parsePercent = (text) => inRange(parseHundredths(text, { percent: true }), BP_MIN, BP_MAX);
// Halaga ng diskwento: higit sa P0, hanggang sa pinakamataas na total (ang subtotal ang tunay na hangganan)
export const parseDiscountAmount = (text) => inRange(parseHundredths(text, { peso: true }), 1n, TOTAL_MAX);

// round half up (para sa hindi negatibong numero)
const divRound = (n, d) => (n + d / 2n) / d;
export const lineAmount = (priceCentavos, qtyHundredths) => divRound(priceCentavos * qtyHundredths, 100n);
export const percentOf = (centavos, bp) => divRound(centavos * bp, 10000n);

const ISO_RE = /^(\d{4})-(\d{2})-(\d{2})$/;
export function isISODate(s) {
  const m = typeof s === "string" ? ISO_RE.exec(s) : null;
  if (!m) return false;
  const y = Number(m[1]), mo = Number(m[2]), d = Number(m[3]);
  if (y < 2000 || y > 2100 || mo < 1 || mo > 12 || d < 1) return false;
  const dt = new Date(Date.UTC(y, mo - 1, d));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === mo - 1 && dt.getUTCDate() === d;
}

const str = (v) => (typeof v === "string" ? v.trim() : "");
const len = (s) => Array.from(s).length;

// model: { from:{name,contact}, to:{name,contact}, date, validUntil, quoteNo,
//          items:[{desc, qtyText, priceText}], discount:{mode:"none"|"amount"|"percent", text}, notes }
// Ibinabalik: { ok, errors:[{field, code}], lines:[{qty, price, amount}], subtotal, discount:{mode, bp, amount}, total }
export function computeQuote(model) {
  const m = model || {};
  const errors = [];
  const add = (field, code) => errors.push({ field, code });
  const text = (field, v, max, required) => {
    const s = str(v);
    if (required && !s) add(field, "empty");
    else if (len(s) > max) add(field, "long");
  };
  text("from.name", m.from && m.from.name, LIMITS.name, true);
  text("from.contact", m.from && m.from.contact, LIMITS.contact, false);
  text("to.name", m.to && m.to.name, LIMITS.name, true);
  text("to.contact", m.to && m.to.contact, LIMITS.contact, false);

  const items = Array.isArray(m.items) ? m.items : [];
  if (!items.length) add("items", "none");
  else if (items.length > LIMITS.items) add("items", "tooMany");
  const lines = items.map((it, i) => {
    text(`items.${i}.desc`, it && it.desc, LIMITS.desc, true);
    const q = parseQty(it && it.qtyText);
    const p = parseMoney(it && it.priceText);
    if (!q.ok) add(`items.${i}.qty`, q.code);
    if (!p.ok) add(`items.${i}.price`, p.code);
    let amount = q.ok && p.ok ? lineAmount(p.value, q.value) : null;
    if (amount !== null && amount > TOTAL_MAX) { add(`items.${i}.price`, "tooLarge"); amount = null; }
    return { qty: q.ok ? q.value : null, price: p.ok ? p.value : null, amount };
  });

  let subtotal = null;
  if (lines.length && lines.length <= LIMITS.items && lines.every((l) => l.amount !== null)) {
    subtotal = lines.reduce((a, l) => a + l.amount, 0n);
    if (subtotal > TOTAL_MAX) { add("total", "tooLarge"); subtotal = null; }
  }

  const mode = m.discount && (m.discount.mode === "amount" || m.discount.mode === "percent") ? m.discount.mode : "none";
  const discount = { mode, bp: null, amount: mode === "none" ? 0n : null };
  if (mode === "amount") {
    const d = parseDiscountAmount(m.discount.text);
    if (!d.ok) add("discount", d.code);
    else if (subtotal !== null && d.value > subtotal) add("discount", "over");
    else discount.amount = d.value;
  } else if (mode === "percent") {
    const d = parsePercent(m.discount.text);
    if (!d.ok) add("discount", d.code);
    else { discount.bp = d.value; if (subtotal !== null) discount.amount = percentOf(subtotal, d.value); }
  }
  const total = subtotal !== null && discount.amount !== null ? subtotal - discount.amount : null;

  if (!isISODate(str(m.date))) add("date", str(m.date) ? "date" : "empty");
  const vu = str(m.validUntil);
  if (vu) {
    if (!isISODate(vu)) add("validUntil", "date");
    else if (isISODate(str(m.date)) && vu < str(m.date)) add("validUntil", "beforeDate");
  }
  text("quoteNo", m.quoteNo, LIMITS.quoteNo, false);
  text("notes", m.notes, LIMITS.notes, false);

  return { ok: errors.length === 0, errors, lines, subtotal, discount, total };
}

/* ---------- Format (sariling formatter; hindi Intl, para pare-pareho sa lahat ng browser) ---------- */
const group = (digits) => digits.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
export function formatPeso(centavos) {
  const v = typeof centavos === "bigint" ? centavos : BigInt(centavos);
  const neg = v < 0n;
  const s = (neg ? -v : v).toString().padStart(3, "0");
  return (neg ? "-" : "") + PESO + group(s.slice(0, -2)) + "." + s.slice(-2);
}
// 150n -> "1.5", 200n -> "2", 123456n -> "1,234.56" (dami o porsyento)
export function formatHundredths(h) {
  const s = (typeof h === "bigint" ? h : BigInt(h)).toString().padStart(3, "0");
  const frac = s.slice(-2).replace(/0+$/, "");
  return group(s.slice(0, -2)) + (frac ? "." + frac : "");
}
export const formatQty = formatHundredths;

/* ---------- Text para sa Messenger/Viber (walang HTML) ---------- */
// L: mga label sa wika ng quotation, galing sa quote-i18n.js (docLabels), kasama ang L.fmtDate(iso)
export function toPlainText(model, result, L) {
  const m = model || {};
  const out = [];
  const push = (...xs) => xs.forEach((x) => out.push(x));
  push(L.title);
  if (str(m.quoteNo)) push(`${L.quoteNo}: ${str(m.quoteNo)}`);
  push(`${L.date}: ${L.fmtDate(str(m.date))}`);
  if (str(m.validUntil)) push(`${L.validUntil}: ${L.fmtDate(str(m.validUntil))}`);
  push("", `${L.from}: ${str(m.from && m.from.name)}`);
  if (str(m.from && m.from.contact)) push(str(m.from.contact));
  push("", `${L.preparedFor}: ${str(m.to && m.to.name)}`);
  if (str(m.to && m.to.contact)) push(str(m.to.contact));
  push("", `${L.items}:`);
  (m.items || []).forEach((it, i) => {
    const ln = result.lines[i];
    push(`${i + 1}. ${str(it.desc)}`, `   ${formatQty(ln.qty)} x ${formatPeso(ln.price)} = ${formatPeso(ln.amount)}`);
  });
  push("", `${L.subtotal}: ${formatPeso(result.subtotal)}`);
  if (result.discount.mode !== "none") {
    const label = result.discount.mode === "percent" ? L.discountPct(formatHundredths(result.discount.bp)) : L.discount;
    push(`${label}: -${formatPeso(result.discount.amount)}`);
  }
  push(`${L.total}: ${formatPeso(result.total)}`);
  if (str(m.notes)) push("", `${L.notes}:`, str(m.notes).replace(/\r\n?/g, "\n"));
  push("", L.disclaimer);
  return out.join("\n");
}
