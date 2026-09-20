// security-dashboard.js V2 Final Sealed 20 Years - No Emoji - MagnetraPH - Dashboard Only
(function(){
"use strict";
var CFG={DEVICE:"mp_device_id_dashboard",MAX_POST:3};
Object.freeze(CFG);
function getDeviceId(){
try{
var id=localStorage.getItem(CFG.DEVICE);
if(id) return id;
var raw=(navigator.userAgent||"")+"|"+(screen.width||0)+"x"+(screen.height||0)+"|"+(navigator.language||"")+"|"+(Intl.DateTimeFormat().resolvedOptions().timeZone||"");
var h=0;for(var i=0;i<raw.length;i++){h=((h<<5)-h)+raw.charCodeAt(i);h=h&h;}
id="dev_dash_"+Math.abs(h).toString(36)+"_"+Date.now().toString(36);
localStorage.setItem(CFG.DEVICE,id);
return id;
}catch(e){return "dev_dash_unknown";}
}
function sanitize(v){
try{
var t=v||"";
t=t.replace(/</g,"&lt;").replace(/>/g,"&gt;");
t=t.slice(0,200);
return t;
}catch(e){return "";}
}
function canPost(total){
return (total||0) < CFG.MAX_POST;
}
function sealAPI(){
try{
var api={getDeviceId:getDeviceId,sanitize:sanitize,canPost:canPost,CFG:CFG};
Object.freeze(api);
Object.defineProperty(window,"Security",{value:api,writable:false,configurable:false});
}catch(e){}
}
sealAPI();
})();
