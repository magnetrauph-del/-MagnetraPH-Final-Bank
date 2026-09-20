// appcheck-login.js V2 Final Sealed 20 Years - No Emoji - MagnetraPH - Login Only - Anti Tamper
(function(){
"use strict";
var LOCK_KEY="mp_appcheck_login_sealed_v2";
var RECAPTCHA_KEY="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI";
function seal(){
try{
Object.freeze(RECAPTCHA_KEY);
if(window.firebase && firebase.appCheck){
var provider=new firebase.appCheck.ReCaptchaV3Provider(RECAPTCHA_KEY);
var instance=firebase.appCheck();
instance.initializeAppCheck({
provider: provider,
isTokenAutoRefreshEnabled: true
});
Object.defineProperty(window,LOCK_KEY,{value:true,writable:false,configurable:false});
Object.freeze(window[LOCK_KEY]);
}
}catch(e){}
}
function antiTamper(){
try{
var script=document.currentScript;
if(script){
Object.defineProperty(script,"innerHTML",{writable:false,configurable:false});
Object.defineProperty(script,"textContent",{writable:false,configurable:false});
}
}catch(e){}
}
if(typeof firebase==="undefined"){
document.addEventListener('DOMContentLoaded',function(){
setTimeout(function(){
try{
if(typeof firebase!=="undefined" && firebase.appCheck){
var p=new firebase.appCheck.ReCaptchaV3Provider(RECAPTCHA_KEY);
firebase.appCheck().initializeAppCheck({provider:p,isTokenAutoRefreshEnabled:true});
}
}catch(e){}
},300);
});
}else{
seal();
}
antiTamper();
})();
