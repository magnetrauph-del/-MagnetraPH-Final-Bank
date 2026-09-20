// appcheck-login.js V1 Final 20 Years - No Emoji - MagnetraPH - Login Only - reCAPTCHA V3
(function(){
"use strict";
try{
if(typeof firebase==="undefined") return;
if(!firebase.appCheck) return;
var RECAPTCHA_V3_KEY="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI";
var provider=new firebase.appCheck.ReCaptchaV3Provider(RECAPTCHA_V3_KEY);
firebase.appCheck().initializeAppCheck({
provider: provider,
isTokenAutoRefreshEnabled: true
});
}catch(e){}
})();
