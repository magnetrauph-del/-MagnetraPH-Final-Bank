// firebase-init.js - v4
// Pagkakasunod: app -> App Check -> auth. Ito ang IISANG lugar na nag-i-initialize ng App Check.
// Huwag mag-initializeAppCheck sa ibang file (appcheck-shared.js ay kumukuha lang mula rito).
// Pare-pareho dapat ang version (10.12.2) sa lahat ng file na nag-i-import mula sa gstatic.
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  initializeAppCheck,
  ReCaptchaEnterpriseProvider,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app-check.js";

// Kapag bukas ang app sa magnetra.app, doon din dadaan ang Google login (iisang site).
// Dahil dito, gumagana ang login kahit humaharang ang Chrome, Safari at Firefox sa
// third-party storage, at "magnetra.app" ang makikita ng user sa Google screen.
// Kailangan: naka-connect ang magnetra.app sa Firebase Hosting, at nasa Google Cloud
// OAuth client ang redirect URI na https://magnetra.app/__/auth/handler
const OWN_DOMAINS = ["magnetra.app", "www.magnetra.app"];
const authDomain = OWN_DOMAINS.includes(location.hostname)
  ? "magnetra.app"
  : "magnetra-ultra.firebaseapp.com";

// Pampubliko ang mga ito (hindi secret). Ang proteksyon ay galing sa API key restrictions,
// App Check, authorized domains, at sa Worker.
const firebaseConfig = {
  apiKey: "AIzaSyAvrs7zsH0R0OuAPpTxUs9DzHxE9R3B494",
  authDomain,
  projectId: "magnetra-ultra",
  storageBucket: "magnetra-ultra.firebasestorage.app",
  messagingSenderId: "114134928326",
  appId: "1:114134928326:web:0ce9f84dc043128e7700c7",
};

// reCAPTCHA Enterprise SITE KEY (pampubliko, hindi secret).
const RECAPTCHA_SITE_KEY = "6LfM7rUtAAAAACjCTlJTnBHcROLrTUZDwnjTsDle";

export const app = initializeApp(firebaseConfig);

// Sa localhost lang: nagpi-print ng debug token sa console na ire-register mo sa
// Firebase Console > App Check. Dapat itakda BAGO ang initializeAppCheck.
// Walang epekto sa live site. Burahin sa Console ang debug token pagkatapos mag-test.
if (["localhost", "127.0.0.1"].includes(location.hostname)) {
  self.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
}

// Dapat mauna ang App Check bago gamitin ang auth.
// Kung pumalya ang init, huwag hayaang masira ang buong app: magiging null lang ang appCheck,
// at ang Worker ang tatanggi (401) sa mga /api call.
// Auto-refresh: false. Kukuha lang ng token kapag kailangan (login, sign up, /api call).
// Libre ang reCAPTCHA hanggang 10,000 na check kada buwan; kapag naka-true, kumukuha ng
// bagong token bawat ~30 minuto habang bukas ang tab at bawat bisita sa login page,
// kaya mabilis maubos ang libreng quota.
let appCheckInstance = null;
try {
  appCheckInstance = initializeAppCheck(app, {
    provider: new ReCaptchaEnterpriseProvider(RECAPTCHA_SITE_KEY),
    isTokenAutoRefreshEnabled: false,
  });
} catch (e) {
  console.warn("AppCheck init fail:", e && e.code);
}
export const appCheck = appCheckInstance;

export const auth = getAuth(app);