// appcheck-login.js - 20Y SEALED BPI LEVEL - FINAL - ISAMA RECATCHA ENTERPRISE BAGO - APPROVED
(function(){
  "use strict";
  try{
    // BPI Level - gamit Registered mo na nasa console - reCAPTCHA Enterprise
    var provider = new firebase.appCheck.ReCaptchaEnterpriseProvider();
    firebase.appCheck().activate(provider, true);

    // pilitin kumuha token agad para mag Verified
    firebase.appCheck().getToken(true).then(function(r){
      console.log("BPI AppCheck Verified", r.token ? "ok" : "no token");
    });

    // refresh 25min - para laging Verified kahit matagal sa login page
    setInterval(function(){
      try{ firebase.appCheck().getToken(true); }catch(e){}
    }, 25*60*1000);
  }catch(e){
    console.log("AppCheck BPI err", e);
  }
})();
