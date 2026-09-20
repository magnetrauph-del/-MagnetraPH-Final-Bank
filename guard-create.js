// guard-create.js V5 Final Sealed 20 Years - No Emoji - MagnetraPH - Create Only
(function(){
"use strict";
var ALLOWED_DOMAINS=["magnetraph.web.app","magnetra-ultra.firebaseapp.com","magnetra-ultra.web.app","localhost","127.0.0.1"];
var SEALED_SELECTOR='[data-lock="OWNER"][data-modulock="SEALED"]';
var MIN_SEALED=2;
function isAllowedHost(){
try{
var h=location.hostname;
if(!h) return true;
h=h.toLowerCase();
for(var i=0;i<ALLOWED_DOMAINS.length;i++){
var a=ALLOWED_DOMAINS[i].toLowerCase();
if(h===a) return true;
if(h.endsWith("."+a)) return true;
if(h.indexOf(a)>-1 && (a.indexOf("firebaseapp.com")>-1 || a.indexOf("web.app")>-1)){
if(h.length<=a.length+20) return true;
}
}
return false;
}catch(e){return false;}
}
function checkSealed(){
try{
var nodes=document.querySelectorAll(SEALED_SELECTOR);
if(nodes.length<MIN_SEALED){document.documentElement.innerHTML="";return false;}
var hasCard=false;var hasCfg=false;
for(var i=0;i<nodes.length;i++){var id=nodes[i].id;if(id==="card") hasCard=true;if(id==="CFG-CREATE") hasCfg=true;}
if(!hasCard||!hasCfg){document.documentElement.innerHTML="";return false;}
return true;
}catch(e){try{document.documentElement.innerHTML="";}catch(_){}return false;}
}
function hardLock(){try{document.documentElement.innerHTML="";document.body.innerHTML="";localStorage.clear();sessionStorage.clear();}catch(e){}}
if(!isAllowedHost()){hardLock();return;}
function initGuard(){setTimeout(checkSealed,200);}
if(document.readyState==="loading"){document.addEventListener('DOMContentLoaded',initGuard);}else{initGuard();}
document.addEventListener('contextmenu',function(e){e.preventDefault();return false;});
document.addEventListener('dragstart',function(e){e.preventDefault();return false;});
document.addEventListener('keydown',function(e){
var k=e.key;
if(k==="F12"){e.preventDefault();return false;}
if(e.ctrlKey&&e.shiftKey){if(k==="I"||k==="i"||k==="C"||k==="c"||k==="J"||k==="j"){e.preventDefault();return false;}}
if(e.ctrlKey){if(k==="u"||k==="U"||k==="s"||k==="S"||k==="p"||k==="P"){e.preventDefault();return false;}}
});
})();
