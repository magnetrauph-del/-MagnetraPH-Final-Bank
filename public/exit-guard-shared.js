// exit-guard-shared.js - v2 - "Tap back again to exit", tulad ng mga Android app.
// SHARED CODE: iisang file para sa DEV/SPCK at PROD/LIVE. Walang environment config dito.
// Unang pindot ng Back: lalabas ang toast. Pangalawang pindot sa loob ng 2 segundo: lalabas sa app.
// Kung may bukas na sheet o menu, isasara muna iyon ng Back (hindi agad lalabas).
// UX lang ito: hindi ito security o authorization.
//
// Paggamit:
//   import { initExitGuard } from "./exit-guard-shared.js";
//   const disarm = initExitGuard({ getText: () => "Tap back again to exit", closeOverlay: () => false });
//   - closeOverlay(): isara ang bukas na sheet at ibalik ang true; false kung walang bukas.
//   - disarm(): tawagin bago lumipat sa ibang page (hal. dashboard). Tinatanggal nito ang guard at
//     ang history entry na ginawa ng file na ito. Nagbabalik ng Promise; mas malinis kung hihintayin:
//       await disarm(); location.replace("/dashboard.html");

const WINDOW_MS = 2000;
const CLEANUP_MS = 300; // pinakamatagal na hihintayin ng disarm() bago magpatuloy
const ARM_EVENTS = ["pointerdown", "keydown", "touchstart"];
const ARM_OPTS = { capture: true, passive: true };

export function initExitGuard({ getText, closeOverlay = () => false, toastId = "exitToast" } = {}) {
  if (typeof history === "undefined" || !history.pushState) return () => Promise.resolve();

  // Tatak ng mga history entry na ginawa ng page load na ito lang. Dahil dito, ang sariling guard
  // entry lang ang puwedeng tanggalin ng disarm(), hindi ang ibang entry ng app o ng lumang load.
  const GUARD_ID = Math.random().toString(36).slice(2) + Date.now().toString(36);
  const isOwnGuard = (state) => !!(state && state.mgExitGuard === true && state.id === GUARD_ID);

  let armed = false;
  let lastBack = 0;
  let exiting = false;
  let hideTimer = null;
  let disarmPromise = null;

  let toast = document.getElementById(toastId);
  if (!toast) {
    toast = document.createElement("div");
    toast.id = toastId;
    document.body.appendChild(toast);
  }
  toast.setAttribute("role", "status");
  toast.setAttribute("aria-live", "polite");

  function showToast() {
    toast.textContent = getText ? getText() : "Tap back again to exit";
    toast.classList.add("show");
    clearTimeout(hideTimer);
    hideTimer = setTimeout(() => toast.classList.remove("show"), WINDOW_MS);
  }

  function pushGuard() {
    try { history.pushState({ mgExitGuard: true, id: GUARD_ID }, "", location.href); } catch {}
  }

  function removeArmListeners() {
    ARM_EVENTS.forEach((ev) => window.removeEventListener(ev, arm, ARM_OPTS));
  }

  // Kailangan munang may pinindot ang user bago mag-pushState; kung hindi, nilalaktawan
  // ito ng Chrome kapag pinindot ang Back.
  function arm() {
    if (armed || exiting) return;
    armed = true;
    removeArmListeners();
    if (!(history.state && history.state.mgExitGuard)) pushGuard();
  }
  ARM_EVENTS.forEach((ev) => window.addEventListener(ev, arm, ARM_OPTS));

  function onPopState() {
    if (exiting || !armed) return;

    // 1. May bukas na sheet: isara lang
    let closed = false;
    try { closed = closeOverlay() === true; } catch {}
    if (closed) { pushGuard(); return; }

    // 2. Pangalawang Back sa loob ng 2 segundo: lumabas
    const now = Date.now();
    if (now - lastBack < WINDOW_MS) {
      exiting = true;
      toast.classList.remove("show");
      history.back();
      return;
    }

    // 3. Unang Back: ipakita ang toast at manatili
    lastBack = now;
    pushGuard();
    showToast();
  }
  window.addEventListener("popstate", onPopState);

  // Para sa page na lumilipat (hal. papuntang dashboard): huwag nang harangin, at tanggalin ang
  // sariling guard entry para hindi maiwan ang login page sa ilalim ng susunod na page.
  // - Laging tinatanggal ang listener ng unang tap at ang popstate listener.
  // - history.back() lang kapag ang kasalukuyang entry ay tiyak na guard ng page load na ito.
  // - Hindi ito kailanman nagdadagdag ng bagong history entry.
  // - Iisang Promise lang kahit ilang beses tawagin; natatapos sa loob ng CLEANUP_MS kahit ano pa.
  return function disarm() {
    if (disarmPromise) return disarmPromise;
    exiting = true;
    removeArmListeners();
    window.removeEventListener("popstate", onPopState);
    clearTimeout(hideTimer);
    toast.classList.remove("show");

    disarmPromise = new Promise((resolve) => {
      let state = null;
      try { state = history.state; } catch {}
      if (!isOwnGuard(state)) { resolve(); return; }

      let done = false;
      let timer = null;
      const finish = () => {
        if (done) return;
        done = true;
        clearTimeout(timer);
        window.removeEventListener("popstate", finish);
        resolve();
      };
      window.addEventListener("popstate", finish);
      timer = setTimeout(finish, CLEANUP_MS);
      try { history.back(); } catch { finish(); }
    });
    return disarmPromise;
  };
}
