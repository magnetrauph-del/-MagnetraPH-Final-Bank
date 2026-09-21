// appcheck-create.js - 20Y SEALED OWNER ONLY - PINAKA MATAPANG NA LOCK - BPI LEVEL - CREATE
(function(){
  "use strict";
  const OWNER_KEY="MAGNETRA_ULTRA_OWNER_2026";
  const isOwner=(()=>{ try{ return localStorage.getItem('mp_owner_20y')===OWNER_KEY; }catch(e){ return false; } })();
  if(!isOwner){
    try{
      var provider=new firebase.appCheck.ReCaptchaEnterpriseProvider();
      var appCheck=firebase.appCheck();
      appCheck.activate(provider,true,true);
      appCheck.getToken(true).then(function(r){ console.log("BPI CREATE LOCKED Verified:", r.token?"OK":"NO TOKEN"); }).catch(function(){});
      setInterval(function(){ try{ firebase.appCheck().getToken(true); }catch(e){} },25*60*1000);
      Object.freeze(provider); Object.seal(appCheck);
      Object.freeze(appCheck.activate); Object.freeze(appCheck.getToken);
      try{ Object.preventExtensions(window.firebase.appCheck); }catch(e){}
      try{
        Object.defineProperty(window.firebase.appCheck,'activate',{writable:false,configurable:false});
        Object.defineProperty(window.firebase.appCheck,'getToken',{writable:false,configurable:false});
      }catch(e){}
      console.log("BPI LEVEL CREATE LOCKED - Owner Only");
    }catch(e){ console.log("BPI Create Lock err",e); }
  } else {
    console.log("OWNER MODE CREATE UNLOCKED");
    var provider=new firebase.appCheck.ReCaptchaEnterpriseProvider();
    firebase.appCheck().activate(provider,true,true);
    firebase.appCheck().getToken(true);
  }
})();
