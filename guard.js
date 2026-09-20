// guard.js V2 - Domain Lock + Integrity - Fixed - By Order Malinis - No Emoji
(function(){
var ALLOWED=["magnetraph.web.app","magnetra-ultra.firebaseapp.com","magnetra-ultra.web.app","localhost","127.0.0.1"];
function checkDomain(){
var host=location.hostname;
if(!host) return true;
for(var i=0;i<ALLOWED.length;i++){ if(host===ALLOWED[i] || host.indexOf(ALLOWED[i])>-1 || host.endsWith("."+ALLOWED[i])){ return true; } }
return false;
}
function checkLock(){
var must=document.querySelectorAll('[data-lock="OWNER"][data-modulock="SEALED"]');
if(must.length<2){ document.documentElement.innerHTML=""; }
}
if(!checkDomain()){
try{ document.documentElement.innerHTML=""; }catch(_){}
return;
}
if(document.readyState==="loading"){
document.addEventListener('DOMContentLoaded', checkLock);
} else {
setTimeout(checkLock,100);
}
document.addEventListener('contextmenu', function(e){ e.preventDefault(); });
document.addEventListener('keydown', function(e){
if(e.key==="F12" || (e.ctrlKey && (e.key==="u"||e.key==="U"||e.key==="s"||e.key==="S"||e.key==="j"||e.key==="J"))){ e.preventDefault(); return false; }
if(e.ctrlKey && e.shiftKey && (e.key==="I"||e.key==="i"||e.key==="C"||e.key==="c")){ e.preventDefault(); return false; }
});
})();
