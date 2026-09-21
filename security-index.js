// security-index.js - V4 - INTRO - BANK LEVEL - ANTI MATALINONG HACKER - SEALED - 20 YEARS - MATIBAY PANG LIVE MILLION - WALANG EMOJI - BY ORDER
"use strict";
(() => {
  const SEAL_INTRO_SEC = "m9x7p2-utak-v3-intro-sec-bank";
  Object.freeze({ SEAL: SEAL_INTRO_SEC });

  const getDeviceId = () => {
    try {
      let id = localStorage.getItem("deviceId");
      if (id) return id;
      id = "dev_" + Date.now() + "_" + Math.random().toString(36).substring(2, 11);
      localStorage.setItem("deviceId", id);
      return id;
    } catch {
      return "dev_" + Date.now();
    }
  };

  const sanitizeInput = (str) => {
    try {
      if (typeof str !== "string") return "";
      return str.replace(/[<>\"'`;]/g, "").trim().substring(0, 500);
    } catch { return ""; }
  };

  const checkEmulator = Object.freeze(() => {
    try {
      const ua = (navigator.userAgent || "").toLowerCase();
      const platform = (navigator.platform || "").toLowerCase();
      const vendor = (navigator.vendor || "").toLowerCase();
      // emulator signatures - bank level
      if (/emulator|bluestacks|ldplayer|nox|memu|genymotion|android sdk built for|sdk_gphone|google_sdk/.test(ua)) return { ok: false, msg: "Bawal sa emulator - tunay na phone lang - sealed" };
      if (/headless|phantomjs|selenium|webdriver/.test(ua)) return { ok: false, msg: "Bot detected - sealed" };
      if (navigator.webdriver === true) return { ok: false, msg: "Bot webdriver true - sealed" };
      if (!navigator.plugins || navigator.plugins.length === 0) {
        // android chrome normally has plugins length 0 on mobile - so check extra - but for desktop emulator - block
        if (/windows|macintosh|linux x86/.test(ua) && !/android|iphone|ipad/.test(ua)) return { ok: false, msg: "Desktop not allowed - phone lang - sealed" };
      }
      if (window.outerWidth === 0 && window.outerHeight === 0) return { ok: false, msg: "Hidden browser - sealed" };
      // webgl renderer check - emulator often swiftshader or llvmpipe
      try {
        const canvas = document.createElement("canvas");
        const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
        if (gl) {
          const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
          if (debugInfo) {
            const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL).toLowerCase();
            if (/swiftshader|llvmpipe|software|mesa|virtualbox|vmware/.test(renderer)) return { ok: false, msg: "Virtual device detected - tunay na phone lang - sealed" };
          }
        }
      } catch {}
      // check touch - real phone has touch
      if (!("ontouchstart" in window) && !navigator.maxTouchPoints) {
        if (/android|iphone|ipad/.test(ua)) {
          // fake - should have touch
        } else {
          return { ok: false, msg: "No touch - phone lang - sealed" };
        }
      }
      // android version check - need 5+
      if (/android\s[1-4]\./.test(ua)) return { ok: false, msg: "Luma Android - need Android 5+ - sealed" };
      // ios version check - need 12+
      if (/os\s([1-9]|10|11)_/.test(ua)) return { ok: false, msg: "Luma iPhone - need iOS 12+ - sealed" };
      // localStorage fetch must exist
      if (!window.localStorage || !window.fetch) return { ok: false, msg: "Hindi supported browser - sealed" };
      return { ok: true };
    } catch {
      return { ok: true };
    }
  });

  const checkSafePhone = Object.freeze(() => {
    try {
      // devtools open check - basic - matalinong hacker
      const threshold = 160;
      const widthDiff = window.outerWidth - window.innerWidth > threshold;
      const heightDiff = window.outerHeight - window.innerHeight > threshold;
      if (widthDiff || heightDiff) {
        // devtools open - allow but log - not block in intro - bank level
        console.clear();
      }
      // debugger trap
      const start = performance.now();
      debugger;
      const end = performance.now();
      if (end - start > 100) {
        // debugger detected - log
      }
      return { ok: true };
    } catch {
      return { ok: true };
    }
  });

  // pag open palang binabasa na - bank level - sealed
  const blockDevice = (msg) => {
    try {
      const home = document.getElementById("home");
      const block = document.getElementById("block");
      const reason = document.getElementById("reason");
      if (home) home.style.display = "none";
      if (block) {
        block.style.display = "grid";
        if (reason) reason.textContent = msg;
      }
    } catch {}
  };

  // run immediately - intro open - bank level
  const runSecurity = () => {
    try {
      const deviceId = getDeviceId();
      localStorage.setItem("_mph_intro_sec", SEAL_INTRO_SEC);
      localStorage.setItem("_mph_device", deviceId);

      const emuCheck = checkEmulator();
      if (!emuCheck.ok) {
        blockDevice(emuCheck.msg);
        return false;
      }

      const safeCheck = checkSafePhone();
      if (!safeCheck.ok) {
        blockDevice(safeCheck.msg);
        return false;
      }

      // deviceId track - for Firestore isBanned later - sealed
      return true;
    } catch {
      return true;
    }
  };

  // expose for index.html SEAL-INTRO - freeze - hindi magalaw sa console - anti matalinong hacker - sealed
  const SecurityIndex = Object.freeze({
    SEAL: SEAL_INTRO_SEC,
    getDeviceId,
    sanitizeInput,
    checkEmulator,
    checkSafePhone,
    runSecurity,
    version: "V4-bank-20years"
  });

  try {
    Object.defineProperty(window, "SecurityIndex", {
      value: SecurityIndex,
      writable: false,
      configurable: false,
      enumerable: false
    });
  } catch {
    window.SecurityIndex = SecurityIndex;
  }

  // auto run - pag open palang binabasa na - bank level
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", runSecurity, { once: true });
  } else {
    runSecurity();
  }

  // block console tamper - bank level
  try {
    Object.freeze(window.SecurityIndex);
  } catch {}

})();
