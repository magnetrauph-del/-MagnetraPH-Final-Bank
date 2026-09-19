// appcheck.js - BY ORDER - BPI ENTERPRISE SHIELD - BLACK + VIOLET READY
// App Check reCAPTCHA Enterprise - only magnetra-ultra.web.app lang pwede - block external hacker script

// modular version - para sa new Firebase - yung nasa pic mo
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app-check.js";

const enterpriseKey = "6Lfm7rUAAAAACJCTJTnBHcRoLrTUZDwnjTsDle";

let appCheckInstance = null;

function initAppCheckEnterprise(app){
  try{
    appCheckInstance = initializeAppCheck(app, {
      provider: new ReCaptchaEnterpriseProvider(enterpriseKey),
      isTokenAutoRefreshEnabled: true
    });
    return appCheckInstance;
  }catch(e){
    return null;
  }
}

// compat version - para sa dashboard.html natin na compat - backup
function initAppCheckCompat(){
  try{
    if(typeof firebase !== 'undefined' && firebase.appCheck){
      const appCheck = firebase.appCheck();
      appCheck.activate(enterpriseKey, true);
    }
  }catch(e){}
}
