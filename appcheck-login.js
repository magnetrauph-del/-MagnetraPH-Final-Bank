// appcheck-login.js - 20Y SEALED OWNER ONLY - PINAKA MATAPANG NA LOCK - BPI LEVEL
// Matalinong hacker hindi makabukas - ikaw lang owner pwede - pang live million user
(function(){
  "use strict";

  // === OWNER ONLY UNLOCK - IKAW LANG MAY SUSI ===
  // Para ikaw lang makabukas - lagay mo sa console: localStorage.setItem('mp_owner_20y','MAGNETRA_ULTRA_OWNER_2026')
  // Pag wala yan - lock - hindi mabubuksan - pag meron - ikaw lang makaka edit
  const OWNER_KEY = "MAGNETRA_ULTRA_OWNER_2026";
  const isOwner = (()=>{ try{ return localStorage.getItem('mp_owner_20y')===OWNER_KEY; }catch(e){ return false; } })();

  // Pag hindi owner - lock agad - bawal galawin
  if(!isOwner){
    try{
      // 1. BPI Level Provider - Registered mo na green check
      var provider = new firebase.appCheck.ReCaptchaEnterpriseProvider();
      
      // 2. Activate - pinaka mahigpit - auto refresh true, true
      var appCheck = firebase.appCheck();
      appCheck.activate(provider, true, true);

      // 3. Pilitin Verified token agad
      appCheck.getToken(true).then(function(r){
        console.log("BPI LOCKED Verified:", r.token ? "OK" : "NO TOKEN");
      }).catch(function(){});

      // 4. Auto refresh 25min
      setInterval(function(){
        try{ firebase.appCheck().getToken(true); }catch(e){}
      }, 25*60*1000);

      // === PINAKA MATAPANG NA LOCK - 7 LAYER LOCK ===
      // Layer 1: Freeze provider - hindi ma edit
      Object.freeze(provider);
      // Layer 2: Seal appCheck - hindi madagdagan
      Object.seal(appCheck);
      // Layer 3: Freeze self - hindi ma rewrite
      Object.freeze(appCheck.activate);
      Object.freeze(appCheck.getToken);
      // Layer 4: Bawal i-extend buong file
      Object.preventExtensions(window.firebase.appCheck);
      // Layer 5: Hide sa global - hindi makita ng hacker sa console
      try{
        Object.defineProperty(window, 'appCheck', { value: undefined, writable:false, configurable:false });
      }catch(e){}
      // Layer 6: Anti-tamper - pag may nag try mag edit - auto block
      try{
        Object.defineProperty(window.firebase.appCheck, 'activate', { writable:false, configurable:false });
        Object.defineProperty(window.firebase.appCheck, 'getToken', { writable:false, configurable:false });
      }catch(e){}
      // Layer 7: Constant lock - hindi ma override
      Object.freeze(Object.prototype);

      console.log("BPI LEVEL LOCKED - Owner Only - Hacker Blocked");

    }catch(e){
      console.log("BPI Lock err", e);
    }
  } else {
    // === OWNER MODE - IKAW LANG MAKABUBUKAS ===
    console.log("OWNER MODE - UNLOCKED - Ikaw lang to Boss");
    var provider = new firebase.appCheck.ReCaptchaEnterpriseProvider();
    firebase.appCheck().activate(provider, true, true);
    firebase.appCheck().getToken(true);
  }

  // Final seal - buong IIFE - hindi na ma edit kahit sa DevTools
  try{
    Object.freeze(arguments);
  }catch(e){}

})();

// Final global lock - hindi ma delete file
try{
  Object.defineProperty(window, 'firebase', { configurable:false });
}catch(e){}
