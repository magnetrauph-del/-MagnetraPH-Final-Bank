// appcheck.js - BY ORDER - BLOCK EXTERNAL SCRIPT - MATALINONG HACKER
// ReCAPTCHA v3 - free - only magnetra-ultra.web.app lang pwede mag Firestore

const appCheckKey = "6Lc-your-recaptcha-v3-site-key"; // palitan mo mamaya galing Firebase Console App Check

async function initAppCheck(){
  try{
    const appCheck = firebase.appCheck();
    appCheck.activate(appCheckKey, true);
    const token = await firebase.appCheck().getToken(false);
    return token.token;
  }catch(e){
    return null;
  }
}
