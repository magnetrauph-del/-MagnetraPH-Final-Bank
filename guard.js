// guard.js V2 Final - No Emoji - MagnetraPH
(function(){
var ALLOWED=["magnetraph.web.app","magnetra-ultra.firebaseapp.com","magnetra-ultra.web.app","localhost","127.0.0.1"];
function checkDomain(){
var h=location.hostname;
if(!h) return true;
for(var i=0;i<ALLOWED.length;i++){
if(h===ALLOWED[i]||h.indexOf(ALLOWED[i])>-1||h.endsWith("."+ALLOWED[i])) return true;
}
return false;
}
function checkLock(){
try{
var must=document.querySelectorAll('[data-lock="OWNER"][data-modulock="SEALED"]');
if(must.length<2){ document.documentElement.innerHTML=""; }
}catch(e){}
}
if(!checkDomain()){
try{document.documentElement.innerHTML="";}catch(e){}
return;
}
if(document.readyState==="loading"){
document.addEventListener('DOMContentLoaded',function(){setTimeout(checkLock,150);});
}else{
setTimeout(checkLock,150);
}
document.addEventListener('contextmenu',function(e){e.preventDefault();});
document.addEventListener('keydown',function(e){
if(e.key==="F12"){e.preventDefault();return false;}
if(e.ctrlKey&&(e.key==="u"||e.key==="U"||e.key==="s"||e.key==="S")){e.preventDefault();return false;}
});
})();
