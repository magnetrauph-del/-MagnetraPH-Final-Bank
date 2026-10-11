// security-core-shared.js - v3
// Mga tulong sa seguridad at UX sa client. WALANG Firestore, WALANG secret, WALANG imports.
// Tunay na proteksyon: Firebase Auth (sariling limit sa login), App Check, Worker, Supabase RLS.
// Ang lock dito ay pang-UX lang (para hindi masagad ang user at ang Firebase). Madali itong
// laktawan ng bot, kaya HINDI ito ang harang.

/* ---------- Pang-UX na lock (per device) ---------- */
const DECAY_MS = 30 * 60000; // kapag 30 min na walang mali, nagsisimula ulit ang bilang
// [bilang ng mali, minuto ng lock], pinakamataas muna
const RULES = {
  login: [[12, 15], [8, 5], [5, 1]],
  default: [[8, 5], [5, 1]],
};
// Pinakamahabang lock sa RULES. Kapag mas mahaba pa rito ang natitira, mali ang orasan ng
// phone (hal. naurong ang petsa), kaya hindi dapat ma-lock nang matagal ang user.
const MAX_LOCK_MS = Math.max(...Object.values(RULES).flatMap((r) => r.map(([, m]) => m))) * 60000;

function lockError(mins) {
  const e = new Error(`Masyadong maraming subok. Subukan ulit pagkalipas ng ${mins} minuto.`);
  e.code = "app/locked"; // pareho ng auth-core: ang friendlyError ay nagpapakita ng message ng "app/"
  e.minutes = mins; // para makagawa ang bawat page ng sarili nitong mensahe
  return e;
}
const keyFor = (type) => "mag_lock_" + (String(type).replace(/[^a-z0-9_-]/gi, "").slice(0, 20) || "x");

function read(type) {
  let s = { count: 0, last: 0, until: 0 };
  try {
    const o = JSON.parse(localStorage.getItem(keyFor(type)) || "null");
    if (o && typeof o === "object") {
      s = { count: Math.max(0, Number(o.count) || 0), last: Number(o.last) || 0, until: Number(o.until) || 0 };
    }
  } catch {}
  const now = Date.now();
  if (s.until - now > MAX_LOCK_MS) s.until = 0;                 // umatras ang orasan
  if (s.last - now > 60000) { s.last = 0; s.count = 0; }       // oras mula sa "hinaharap"
  return s;
}
function write(type, v) { try { localStorage.setItem(keyFor(type), JSON.stringify(v)); } catch {} }

// Tawagin bago mag-login. (Ang email ay hindi ginagamit; nandito lang para hindi masira ang mga tawag.)
export async function checkLock(_email, type = "login") {
  const s = read(type);
  if (s.until > Date.now()) throw lockError(Math.ceil((s.until - Date.now()) / 60000));
}

// Tawagin kapag mali ang password.
export async function addFail(_email, type = "login") {
  const now = Date.now();
  const s = read(type);
  if (now - s.last > DECAY_MS) s.count = 0;
  s.count += 1;
  s.last = now;
  const hit = (RULES[type] || RULES.default).find(([n]) => s.count >= n);
  if (hit) s.until = now + hit[1] * 60000;
  write(type, s);
  if (hit) throw lockError(hit[1]);
}

// Tawagin kapag tama ang password (tagumpay ang login).
export async function resetLock(_email, type = "login") {
  try { localStorage.removeItem(keyFor(type)); } catch {}
}

/* ---------- Email ---------- */
// Hindi binabago ang email (ang "+" ay valid); nililinis lang ang espasyo at laki ng letra.
export function cleanEmail(e) {
  return typeof e === "string" ? e.trim().toLowerCase() : "";
}
// Pang-UX na check bago tumawag sa Firebase (ang Firebase pa rin ang huling nagpapasya).
// Hinaharang ang mga typo gaya ng "juan@gmail..com", "juan@.com", "juan.@gmail.com".
const LOCAL_OK = /^[^\s@<>()[\]\\,;:"]+$/;
const LABEL_OK = /^[\p{L}\p{N}](?:[\p{L}\p{N}-]{0,61}[\p{L}\p{N}])?$/u;
const TLD_OK = /^(?:\p{L}{2,63}|xn--[a-z0-9-]{1,59})$/u;
export function isValidEmail(e) {
  const s = cleanEmail(e);
  if (s.length > 254) return false;
  const at = s.indexOf("@");
  if (at < 1 || at !== s.lastIndexOf("@")) return false;
  const local = s.slice(0, at), domain = s.slice(at + 1);
  if (local.length > 64 || !LOCAL_OK.test(local)) return false;
  if (local.startsWith(".") || local.endsWith(".") || local.includes("..")) return false;
  const labels = domain.split(".");
  return labels.length >= 2 && labels.every((l) => LABEL_OK.test(l)) && TLD_OK.test(labels[labels.length - 1]);
}

/* ---------- Text ---------- */
// Nililinis ang text na itina-type o idini-paste ng user bago i-save o ipadala:
// - inaalis ang mga nakatagong control character (pinapanatili ang Tab at Enter)
// - inaalis ang mga nakatagong character na pambaligtad ng text (pang-spoof sa resibo o
//   pangalan) at ang zero-width space
// - inaayos ang sirang emoji (kalahating character), dahil tinatanggihan ito ng database
// - pare-parehong anyo ng letra (hal. "ñ"), at hindi hinahati ang emoji sa pagputol
// HINDI nito inaalis ang < > $ dahil kailangan ng tunay na data (halimbawa sa resibo).
const HIDDEN = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F​‪-‮⁦-⁩﻿]/g;
const fixSurrogates = (s) => s.replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]|[\uD800-\uDFFF]/g, (m) => (m.length === 2 ? m : ""));
export function cleanText(str, max = 500) {
  if (typeof str !== "string") return "";
  const s = fixSurrogates(str).normalize("NFC").replace(HIDDEN, "").trim();
  const chars = Array.from(s);
  return chars.length > max ? chars.slice(0, max).join("").trim() : s;
}

// Ang tamang proteksyon sa XSS ay sa OUTPUT: gumamit ng textContent, o i-escape gamit ito
// bago ilagay sa innerHTML o sa attribute na may quotes. Hindi ito para sa URL (href/src)
// o sa loob ng <script>.
export function escapeHtml(str) {
  return String(str ?? "").replace(/[&<>"']/g, (c) => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]
  ));
}

// Para hindi masira ang mga lumang tawag
export const sanitizeInput = (str) => cleanText(str, 500);
