// appcheck.js - MagnetraPH - BPI Enterprise Shield - By Order Malinis
const ENTERPRISE_KEY = "6Lfm7rUAAAAACJCTJTnBHcRoLrTUZDwnjTsDle";

let appCheckInstance = null;

function initAppCheckCompat(){
 try{
  if(typeof firebase !== 'undefined' && firebase.appCheck){
   const appCheck = firebase.appCheck();
   appCheck.activate(ENTERPRISE_KEY, true);
   appCheckInstance = appCheck;
  }
 }catch(e){}
}

function initAppCheckEnterprise(app){
 try{
  if(typeof initializeAppCheck !== 'undefined' && typeof ReCaptchaEnterpriseProvider !== 'undefined'){
   appCheckInstance = initializeAppCheck(app, {
    provider: new ReCaptchaEnterpriseProvider(ENTERPRISE_KEY),
    isTokenAutoRefreshEnabled: true
   });
   return appCheckInstance;
  }
 }catch(e){}
 return null;
}

try{ initAppCheckCompat(); }catch(e){}

if(typeof window !== 'undefined'){
 window.MagnetraAppCheck = { initCompat: initAppCheckCompat, initEnterprise: initAppCheckEnterprise, key: ENTERPRISE_KEY, getInstance: ()=> appCheckInstance };
}
