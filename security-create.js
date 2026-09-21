// security-create.js V4 FINAL SEALED 20Y - 7 LAYER - BPI LEVEL
(function(){
  "use strict";
  var CFG={MAX_FAIL:3,MAX_FAIL_DEVICE:10,BLOCK_1HR:3600000,BLOCK_24HR:86400000,MAX_EMAIL_LEN:80,MIN_EMAIL_LEN:6,OWNER_KEY:"MAGNETRA_ULTRA_OWNER_2026",DISPOSABLE:["10minutemail","tempmail","guerrillamail","mailinator","yopmail","throwaway","fakeemail","temp-mail","disposable","trashmail"]};
  Object.freeze(CFG);
  function getDeviceId(){try{var k="mp_device_id_20y";var d=localStorage.getItem(k);if(!d){d="dev_"+Date.now()+"_"+Math.random().toString(36).slice(2);localStorage.setItem(k,d);}return d;}catch(e){return "dev_unknown";}}
  function getStore(){try{var s=localStorage.getItem('mp_sec_create_v4');return s?JSON.parse(s):{};}catch(e){return {};}}
  function saveStore(o){try{localStorage.setItem('mp_sec_create_v4',JSON.stringify(o));}catch(e){}}
  function isOwner(){try{return localStorage.getItem('mp_owner_20y')===CFG.OWNER_KEY;}catch(e){return false;}}
  function isBot(){try{var hp=document.getElementById('hp_email_create');if(hp&&hp.value!=="")return true;if(navigator.webdriver)return true;}catch(e){}return false;}
  function isEmailSafe(email){
    if(!email)return{ok:false,msg:"Invalid email",hack:false};
    var e=email.trim().toLowerCase();
    if(e.length<6)return{ok:false,msg:"Invalid email",hack:false};
    if(e.length>80)return{ok:false,msg:"Email too long",hack:false};
    if(/\s/.test(e))return{ok:false,msg:"Invalid email",hack:false};
    var hackChars=/[<>'"`$\\\/=+\|&%!{}\[\];:`]/;
    if(hackChars.test(e))return{ok:false,msg:"Invalid email",hack:true};
    var re=/^[a-z0-9]+([._-]?[a-z0-9]+)*@[a-z0-9]+([.-]?[a-z0-9]+)*\.[a-z]{2,}$/;
    if(!re.test(e))return{ok:false,msg:"Invalid email",hack:false};
    if(/^[._-@]/.test(e))return{ok:false,msg:"Invalid email",hack:false};
    if(/\.\./.test(e))return{ok:false,msg:"Invalid email",hack:false};
    if((e.match(/@/g)||[]).length!==1)return{ok:false,msg:"Invalid email",hack:true};
    var domain=e.split('@')[1]||"";for(var i=0;i<CFG.DISPOSABLE.length;i++){if(domain.indexOf(CFG.DISPOSABLE[i])>-1)return{ok:false,msg:"Disposable email not allowed",hack:true};}
    return{ok:true,email:e,hack:false};
  }
  function canAttempt(email){
    if(isOwner())return{ok:true};
    var store=getStore();var dev=getDeviceId();var now=Date.now();
    var keyEmail=(email||"").toLowerCase();var keyDev=dev;
    var recEmail=store[keyEmail];if(recEmail&&recEmail.banUntil&&now<recEmail.banUntil){var mins=Math.ceil((recEmail.banUntil-now)/60000);if(recEmail.isHacker)return{ok:false,msg:"Account banned - hacker detected - wait "+mins+"m"};return{ok:false,msg:"Too many attempts - wait "+mins+"m"};}
    var recDev=store[keyDev];if(recDev&&recDev.banUntil&&now<recDev.banUntil){var mins2=Math.ceil((recDev.banUntil-now)/60000);if(recDev.isHacker)return{ok:false,msg:"Device banned - hacker detected - wait "+mins2+"m"};return{ok:false,msg:"Too many attempts - wait "+mins2+"m"};}
    return{ok:true};
  }
  function addFail(email,isHacker){
    if(isOwner())return;var store=getStore();var now=Date.now();var keyEmail=(email||"").toLowerCase();var keyDev=getDeviceId();
    var recEmail=store[keyEmail]||{count:0,hackCount:0,banned:0};var recDev=store[keyDev]||{count:0,hackCount:0,banned:0};
    recEmail.count++;recDev.count++;if(isHacker){recEmail.hackCount=(recEmail.hackCount||0)+1;recEmail.isHacker=true;recDev.hackCount=(recDev.hackCount||0)+1;recDev.isHacker=true;}
    if(!isHacker){if(recEmail.count>=3){recEmail.banUntil=now+10*60*1000;}}else{if(recEmail.hackCount>=2){recEmail.banUntil=now+CFG.BLOCK_1HR;recDev.banUntil=now+CFG.BLOCK_1HR;}if(recEmail.hackCount>=3||recDev.hackCount>=3){recEmail.banUntil=now+CFG.BLOCK_24HR;recDev.banUntil=now+CFG.BLOCK_24HR;recEmail.banned=(recEmail.banned||0)+1;recDev.banned=(recDev.banned||0)+1;try{if(typeof db!=="undefined"&&db.collection){db.collection('security_traces').add({email:keyEmail,deviceId:keyDev,type:'hack_create',hackCount:recEmail.hackCount,deviceHack:recDev.hackCount,banned:recEmail.banned,ts:firebase.firestore.FieldValue.serverTimestamp(),ua:navigator.userAgent});}}catch(e){}}if(recEmail.count>=5){recEmail.banUntil=now+CFG.BLOCK_24HR;recDev.banUntil=now+CFG.BLOCK_24HR;}}
    store[keyEmail]=recEmail;store[keyDev]=recDev;saveStore(store);
  }
  function clearFail(email){var store=getStore();var keyEmail=(email||"").toLowerCase();var keyDev=getDeviceId();delete store[keyEmail];delete store[keyDev];saveStore(store);}
  var api={isBot:isBot,isEmailSafe:isEmailSafe,canAttempt:canAttempt,addFail:addFail,clearFail:clearFail,getDeviceId:getDeviceId};
  Object.freeze(api);try{Object.defineProperty(window,"CreateSecurity",{value:api,writable:false,configurable:false});}catch(e){window.CreateSecurity=api;}
})();
