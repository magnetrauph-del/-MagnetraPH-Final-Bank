// sound.js - v1 (P1) - isang mahinang "tapos na" na tunog para sa TOTOONG natapos na gawain. Walang emoji.
// - Naka-OFF sa simula. Ang user ang mag-o-on sa Settings > Tunog (localStorage "mgpref_sound" = "on").
//   Preference ito ng device (hindi personal na data), kaya naiiwan pagka-logout, tulad ng wika at itsura.
// - Isang tunog lang, mga 0.22 segundo: dalawang malambot na nota (Web Audio, ginawa dito; walang file, walang network).
// - Tinatawag LANG pagkatapos ng kumpirmadong resulta: nagawa ang banner (PNG), nakopya ang quotation, nakopya o
//   na-share ang message. Walang tunog sa pindot, paglipat ng page, error o paalala.
// - Hindi kapalit ng nakikitang mensahe: laging may text sa screen at para sa screen reader.
// - Kapag hindi kaya ng browser, naka-block, o naka-off: tahimik lang (walang error).
// - Sa Safari na may navigator.audioSession: "ambient", para sumunod sa silent switch ng iPhone (kailangan pang i-test sa
//   totoong device).
const KEY = "mgpref_sound";
const GAP_MS = 600; // hindi magkakasunod na tunog (hal. dobleng pindot)

const store = () => { try { return window.localStorage; } catch { return null; } };
export function soundOn() {
  try { return store()?.getItem(KEY) === "on"; } catch { return false; }
}
export function setSoundOn(on) {
  try { const st = store(); if (!st) return false; if (on) st.setItem(KEY, "on"); else st.removeItem(KEY); return true; } catch { return false; }
}

let ctx = null;
let last = 0;
function audio() {
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    if (!ctx) {
      try { if (navigator.audioSession) navigator.audioSession.type = "ambient"; } catch { /* ok lang */ }
      ctx = new AC();
    }
    if (ctx.state === "suspended") ctx.resume().catch(() => {});
    return ctx;
  } catch { return null; }
}
// Sa ilang phone (lalo na iPhone), kailangang "buksan" ang audio habang may pindot. Kapag naka-on lang ang tunog.
function unlock() { if (soundOn() && (!ctx || ctx.state !== "running")) audio(); }
if (typeof window !== "undefined") {
  for (const ev of ["pointerdown", "keydown"]) window.addEventListener(ev, unlock, { capture: true, passive: true });
}

function note(c, out, freq, start, dur, peak) {
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = "sine";
  o.frequency.setValueAtTime(freq, start);
  g.gain.setValueAtTime(0.0001, start);
  g.gain.exponentialRampToValueAtTime(peak, start + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
  o.connect(g);
  g.connect(out);
  o.start(start);
  o.stop(start + dur + 0.02);
}

// Ibinabalik: true kapag naipadala sa audio (hindi garantiya na narinig), false kapag naka-off o hindi kaya.
// preview: para sa "Pakinggan" sa Settings (tumutunog kahit naka-off, para marinig muna bago i-on).
export function playDone({ preview = false } = {}) {
  if (!preview && !soundOn()) return false;
  const now = Date.now();
  if (now - last < GAP_MS) return false;
  const c = audio();
  if (!c) return false;
  try {
    last = now;
    const t0 = c.currentTime + 0.01;
    const out = c.createGain();
    out.gain.setValueAtTime(1, t0);
    out.connect(c.destination);
    note(c, out, 784, t0, 0.13, 0.05);          // G5
    note(c, out, 1046.5, t0 + 0.07, 0.15, 0.04); // C6 (kabuuan: ~0.22 s)
    return true;
  } catch { return false; }
}
