// appcheck-shared.js - v3.1
// SHARED CODE: iisang file para sa DEV/SPCK at PROD/LIVE. Walang DEV o PROD config dito.
// Ang environment (DEV project na may debug token, o PROD project na may reCAPTCHA Enterprise)
// ay pinipili ng firebase-init.js; ginagamit lang ng file na ito ang appCheck na ginawa roon.
// HINDI ito nag-i-initialize ng App Check. Ang init ay nasa firebase-init.js (app -> App Check -> auth).
// Ito ang tagakuha ng token para sa auth-core at tagagawa ng mga hint para sa security-core.
// Ang tunay na harang sa bot ay ang Worker (bine-verify ang X-Firebase-AppCheck) at ang
// enforcement sa Firebase Console. Ang mga check sa client dito ay pang-hint lang.
import { appCheck } from "./firebase-init.js";
import { getToken } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app-check.js";

export const isAppCheckReady = () => !!appCheck;

// Kinukuha ng auth-core sa bawat /api call. Kapag null, tatanggihan ng Worker (401).
export async function getAppCheckToken(forceRefresh = false) {
  if (!appCheck) return null;
  try {
    const result = await getToken(appCheck, forceRefresh);
    if (!result || result.error || !result.token) return null;
    return result.token;
  } catch {
    return null;
  }
}

/* ---------- Mga hint lang (HINDI security) ---------- */
// Madaling pekein ang client, kaya huwag umasa dito. Hindi rin ito humaharang sa user,
// para hindi mabiktima ang totoong tao (false positive).
function looksAutomated() {
  return (
    navigator.webdriver === true ||
    /headless|phantomjs|genymotion|emulator/i.test(navigator.userAgent) ||
    !!window._phantom || !!window.__nightmare
  );
}

// Para sa security-core: hint lang kung mukhang bot. Huwag gamitin bilang pang-block.
export function isDeviceSafe() {
  return !looksAutomated();
}

// Random na ID (hindi fingerprint, kaya mas privacy-friendly). Hindi "mag_" ang simula ng key,
// para hindi mabura ng logout ng auth-core (clearAppStorage) at manatiling parehas ang device.
const DEVICE_KEY = "mgdev_id";
let memoryId = null;
let createdThisLoad = false;

function makeId() {
  if (self.crypto?.randomUUID) return crypto.randomUUID();
  const b = new Uint8Array(16);
  crypto.getRandomValues(b);
  return Array.from(b, (x) => x.toString(16).padStart(2, "0")).join("");
}

export function getDeviceId() {
  try {
    let id = localStorage.getItem(DEVICE_KEY);
    if (!id) {
      id = makeId();
      localStorage.setItem(DEVICE_KEY, id);
      createdThisLoad = true;
    }
    return id;
  } catch {
    if (!memoryId) { memoryId = makeId(); createdThisLoad = true; }
    return memoryId;
  }
}

// True kung bago ang device sa page load na ito. Ang server ang dapat magpasya kung
// "bagong device" para sa isang user; huwag magtiwala sa client.
export function isNewDevice() {
  getDeviceId();
  return createdThisLoad;
}
