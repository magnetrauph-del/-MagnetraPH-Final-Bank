// appcheck-dashboard.js V2 Final Sealed 20 Years - No Emoji - MagnetraPH - Dashboard Only
(function(){
"use strict";
var RECAPTCHA_KEY="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI";
function seal(){
try{
if(window.firebase && firebase.appCheck){
var provider=new firebase.appCheck.ReCaptchaV3Provider(RECAPTCHA_KEY);
var instance=firebase.appCheck();
instance.initializeAppCheck({provider:provider,isTokenAutoRefreshEnabled:true});
}
}catch(e){}
}
if(typeof firebase==="undefined"){
document.addEventListener('DOMContentLoaded',function(){
setTimeout(function(){try{if(typeof firebase!=="undefined" && firebase.appCheck){var p=new firebase.appCheck.ReCaptchaV3Provider(RECAPTCHA_KEY);firebase.appCheck().initializeAppCheck({provider:p,isTokenAutoRefreshEnabled:true});}}catch(e){}},300);
});
}else{seal();}
})();
