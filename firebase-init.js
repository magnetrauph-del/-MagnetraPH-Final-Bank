// firebase-init.js - v5.1 (iisang file para sa DEV/SPCK at PROD/LIVE)
// Pareho ang code sa lahat ng environment. Ang hostname ang pumipili kung aling CONFIG ang gagamitin.
// Tatlong bahagi ang file na ito:
//   1. PROD CONFIG   - mga value ng live na MagnetraPH
//   2. DEV CONFIG    - mga value ng hiwalay na DEV project (para sa SPCK lang)
//   3. SHARED LOGIC  - pareho sa DEV at PROD; huwag baguhin para sa isang environment lang
// Ito lang ang nag-i-initialize ng Firebase, Auth at App Check (tig-iisang beses).
// Pare-pareho dapat ang version (10.12.2) sa lahat ng file na nag-i-import mula sa gstatic.
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  initializeAppCheck,
  ReCaptchaEnterpriseProvider,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app-check.js";

// Pampubliko ang lahat ng value sa PROD CONFIG at DEV CONFIG (hindi secret). Ang proteksyon ay
// galing sa API key restrictions, authorized domains, App Check at sa Worker.
// BAWAL ilagay dito: service account, Firebase Admin key, Supabase key, Cloudflare secret,
// at App Check debug token.

/* =====================================================================
   1. PROD CONFIG  (LIVE)
   Ginagamit lang kapag ang hostname ay nasa PROD_HOSTS.
   ===================================================================== */
const PROD_HOSTS = ["magnetra.app", "www.magnetra.app", "magnetra-ultra.web.app", "magnetra-ultra.firebaseapp.com"];

const PROD_CONFIG = {
  firebase: {
    apiKey: "AIzaSyAvrs7zsH0R0OuAPpTxUs9DzHxE9R3B494",
    authDomain: "magnetra-ultra.firebaseapp.com",
    projectId: "magnetra-ultra",
    storageBucket: "magnetra-ultra.firebasestorage.app",
    messagingSenderId: "114134928326",
    appId: "1:114134928326:web:0ce9f84dc043128e7700c7",
  },
  // Kapag bukas ang site sa sariling domain, doon din dadaan ang Google login (iisang site).
  // Gumagana ito kahit humaharang ang browser sa third-party storage, at "magnetra.app" ang
  // makikita ng user. Kailangan: naka-connect ang magnetra.app sa Firebase Hosting, at nasa
  // Google Cloud OAuth client ang https://magnetra.app/__/auth/handler
  ownAuthDomains: ["magnetra.app", "www.magnetra.app"],
  ownAuthDomain: "magnetra.app",
  recaptchaSiteKey: "6LfM7rUtAAAAACjCTlJTnBHcROLrTUZDwnjTsDle",
  apiBase: "https://magnetra-live-api.magnetrauph.workers.dev",
  appCheckDebug: false, // laging false sa PROD (tinatanggihan ng SHARED LOGIC kapag true)
};

/* =====================================================================
   2. DEV CONFIG  (SPCK / sariling phone lang)
   Ginagamit lang kapag ang hostname ay nasa DEV_HOSTS (loopback: hindi maaabot ng ibang tao).
   Hiwalay na DEV Firebase project, DEV Worker at DEV Supabase: test data lang.
   Wala pa ang DEV project, kaya null ang firebase at recaptchaSiteKey: hindi magsisimula ang
   login sa DEV hanggang mailagay ang tamang value, at hindi ito kailanman lilipat sa PROD.
   ===================================================================== */
const DEV_HOSTS = ["localhost", "127.0.0.1"];

const DEV_CONFIG = {
  // Kopyahin mula sa DEV project: Project settings > General > Your apps > Web app > Config.
  firebase: null,
  ownAuthDomains: [],
  ownAuthDomain: null,
  // reCAPTCHA Enterprise site key na ginawa sa Google Cloud ng DEV project.
  recaptchaSiteKey: null,
  // DEV Worker: parehong code ng PROD Worker, iba lang ang settings at data.
  apiBase: "https://magnetra-dev-api.magnetrauph.workers.dev",
  // Sa DEV lang: ang Firebase SDK ang gagawa ng debug token sa browser mo at ipi-print ito sa
  // console. Ire-register mo iyon sa DEV project > App Check > Manage debug tokens.
  // Walang debug token na nakasulat sa code.
  appCheckDebug: true,
};

/* =====================================================================
   3. SHARED LOGIC  (pareho sa DEV at PROD)
   Pagpili ng environment -> pag-check ng config (fail closed) -> app -> App Check -> auth.
   ===================================================================== */
const CONFIGS = { prod: PROD_CONFIG, dev: DEV_CONFIG };

function configError(message) {
  const e = new Error(message);
  e.code = "app/config";
  return e;
}

// Ang hindi kilalang host ay HINDI ginagawang DEV o PROD: tumatanggi ang app (fail closed).
function detectEnv(host) {
  if (PROD_HOSTS.includes(host)) return "prod";
  if (DEV_HOSTS.includes(host)) return "dev";
  return null;
}

const REQUIRED_FIREBASE_KEYS = ["apiKey", "authDomain", "projectId", "messagingSenderId", "appId"];

function checkConfig(name, cfg) {
  const fb = cfg.firebase;
  if (!fb || REQUIRED_FIREBASE_KEYS.some((k) => typeof fb[k] !== "string" || !fb[k].trim())) {
    throw configError(`${name.toUpperCase()} Firebase config is not set in firebase-init.js`);
  }
  if (typeof cfg.recaptchaSiteKey !== "string" || !cfg.recaptchaSiteKey.trim()) {
    throw configError(`${name.toUpperCase()} reCAPTCHA site key is not set in firebase-init.js`);
  }
  if (typeof cfg.apiBase !== "string" || !/^https:\/\/[^/\s]+$/.test(cfg.apiBase)) {
    throw configError(`${name.toUpperCase()} Worker URL must be https:// with no path`);
  }
  if (cfg.appCheckDebug && name !== "dev") {
    throw configError("App Check debug is allowed in DEV only");
  }
  // Hindi puwedeng gamitin ng DEV ang PROD project, PROD Worker o PROD reCAPTCHA key
  if (name === "dev") {
    const p = PROD_CONFIG;
    if (fb.projectId === p.firebase.projectId || fb.appId === p.firebase.appId ||
        cfg.apiBase === p.apiBase || cfg.recaptchaSiteKey === p.recaptchaSiteKey) {
      throw configError("DEV config must not use PROD Firebase, reCAPTCHA or Worker");
    }
  }
}

const HOST = String(location.hostname || "").toLowerCase();
const ENV_NAME = detectEnv(HOST);
if (!ENV_NAME) {
  throw configError(`Unrecognized host "${HOST.slice(0, 60)}". MagnetraPH will not start here.`);
}
const CFG = CONFIGS[ENV_NAME];
checkConfig(ENV_NAME, CFG);

// "dev" o "prod" lang. Walang ibang posibleng halaga dahil tumatanggi ang hindi kilalang host.
export const ENV = ENV_NAME;
export const IS_DEV = ENV_NAME === "dev";
// Worker/API ng environment na ito (https, walang "/" sa dulo)
export const API_BASE = CFG.apiBase;

const authDomain = CFG.ownAuthDomains.includes(HOST) && CFG.ownAuthDomain
  ? CFG.ownAuthDomain
  : CFG.firebase.authDomain;

export const app = initializeApp({ ...CFG.firebase, authDomain });

// Sa DEV lang (loopback host + DEV project + appCheckDebug). Dapat itakda BAGO ang initializeAppCheck.
// Imposible ito sa PROD: ang PROD host ay laging "prod", at tinatanggihan ng checkConfig ang
// appCheckDebug sa labas ng DEV.
if (IS_DEV && CFG.appCheckDebug) {
  self.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
}

// Dapat mauna ang App Check bago gamitin ang auth.
// Kung pumalya ang init, hindi masisira ang buong app: magiging null lang ang appCheck,
// at ang Worker ang tatanggi (401) sa mga /api call.
// Auto-refresh: false. Kukuha lang ng token kapag kailangan (login, sign up, /api call).
// Libre ang reCAPTCHA hanggang 10,000 na check kada buwan; kapag naka-true, kumukuha ng
// bagong token bawat ~30 minuto habang bukas ang tab at bawat bisita sa login page.
let appCheckInstance = null;
try {
  appCheckInstance = initializeAppCheck(app, {
    provider: new ReCaptchaEnterpriseProvider(CFG.recaptchaSiteKey),
    isTokenAutoRefreshEnabled: false,
  });
} catch (e) {
  console.warn("AppCheck init fail:", e && e.code);
}
export const appCheck = appCheckInstance;

export const auth = getAuth(app);
