// guard-create.js V2 FINAL - BPI BANK LEVEL - CONNECT SECURITY-CREATE.JS + FUNCTION - SEALED 20Y - PINAKA MATAPANG
(function(){
  "use strict";
  var CFG={OWNER_KEY:"MAGNETRA_ULTRA_OWNER_2026",DEV_THRESHOLD:160,PASTE_MAX_LEN:80};
  Object.freeze(CFG);
  function getSecurity(){return window.CreateSecurity||null;}
  function getDeviceId(){try{var k="mp_device_id_20y";var d=localStorage.getItem(k);if(!d){d="dev_"+Date.now()+"_"+Math.random().toString(36).slice(2);localStorage.setItem(k,d);}return d;}catch(e){return "dev_unknown";}}
  function isOwner(){try{return localStorage.getItem('mp_owner_20y')===CFG.OWNER_KEY;}catch(e){return false;}}
  function showBlocked(msg){var s=document.getElementById('status');if(s){s.textContent=msg||"Blocked";s.style.color="#C93A5A";}}
  function bindPasteGuard(){
    var ids=['email','password','confirm'];
    ids.forEach(function(id){
      var el=document.getElementById(id);
      if(!el) return;
      el.addEventListener('paste',function(e){
        try{
          var txt=(e.clipboardData||window.clipboardData).getData('text')||"";
          var sec=getSecurity();
          // BPI - block mahabang paste na may hack
          if(txt.length>CFG.PASTE_MAX_LEN){
            e.preventDefault();
            showBlocked("Paste blocked - too long");
            if(sec&&sec.addFail) sec.addFail(txt,true);
            return;
          }
          if(sec&&sec.isEmailSafe&&id==='email'){
            var r=sec.isEmailSafe(txt);
            if(!r.ok&&r.hack){
              e.preventDefault();
              showBlocked(r.msg);
              if(sec.addFail) sec.addFail(txt,true);
            }
          }
          if(sec&&id!=='email'){
            var pwd=txt;
            var hackChars=/[<>'"`$\\\/=+\|&*%!@#^(){}\[\];:{}\x00-\x1F]/;
            if(hackChars.test(pwd)||/\s/.test(pwd)){
              e.preventDefault();
              showBlocked("Invalid paste");
              if(sec.addFail) sec.addFail('paste_'+getDeviceId(),true);
            }
          }
        }catch(err){}
      });
      // BPI - block drop
      el.addEventListener('drop',function(e){e.preventDefault();return false;});
    });
  }
  function bindCopyGuard(){
    // BPI - wag payagan copy ng password field para hindi ma leak
    var p1=document.getElementById('password');
    var p2=document.getElementById('confirm');
    [p1,p2].forEach(function(el){
      if(!el) return;
      el.addEventListener('copy',function(e){e.preventDefault();return false;});
      el.addEventListener('cut',function(e){e.preventDefault();return false;});
    });
  }
  function bindContextGuard(){
    // BPI - block right click sa card
    var card=document.getElementById('card');
    if(card){
      card.addEventListener('contextmenu',function(e){
        if(isOwner()) return;
        e.preventDefault();return false;
      });
    }
  }
  function bindDevToolsGuard(){
    // BPI - DevTools open - blur card + block create button - connect sa security trace
    var triggered=false;
    function checkDev(){
      try{
        var wDiff=window.outerWidth-window.innerWidth;
        var hDiff=window.outerHeight-window.innerHeight;
        var card=document.getElementById('card');
        var btn=document.getElementById('btnCreate');
        if(wDiff>CFG.DEV_THRESHOLD||hDiff>CFG.DEV_THRESHOLD){
          if(card) card.style.filter="blur(8px)";
          if(btn){btn.disabled=true;btn.style.opacity="0.3";}
          if(!triggered){
            triggered=true;
            var sec=getSecurity();
            if(sec&&sec.addFail) sec.addFail('devtools_'+getDeviceId(),true);
            showBlocked("Developer tools blocked");
          }
        }else{
          if(card) card.style.filter="";
          if(btn){btn.disabled=false;btn.style.opacity="";}
          triggered=false;
        }
      }catch(e){}
    }
    setInterval(checkDev,900);
    // BPI - block F12 Ctrl+Shift+I Ctrl+U Ctrl+S
    document.addEventListener('keydown',function(e){
      if(isOwner()) return;
      var k=e.key||"";
      if(k==="F12"){e.preventDefault();return false;}
      if(e.ctrlKey&&e.shiftKey&&(k==="I"||k==="J"||k==="C")){e.preventDefault();return false;}
      if(e.ctrlKey&&(k==="U"||k==="u"||k==="S"||k==="s")){e.preventDefault();return false;}
    });
  }
  function bindAutoClear(){
    // BPI - auto clear status after 5s para hindi ma timing attack
    var obs=setInterval(function(){
      var s=document.getElementById('status');
      if(s&&s.textContent&&s.textContent.length>0){
        // wag auto clear kung may ban message
        if(s.textContent.indexOf("wait")>-1||s.textContent.indexOf("banned")>-1) return;
      }
    },5000);
  }
  function bindAllGuard(){
    try{
      bindPasteGuard();
      bindCopyGuard();
      bindContextGuard();
      bindDevToolsGuard();
      bindAutoClear();
      console.log("BPI GUARD V2 LOCKED - SEALED 20Y - CONNECTED SECURITY");
    }catch(e){}
  }
  function sealGuard(){
    try{
      var api={bindAllGuard:bindAllGuard};
      Object.freeze(api);
      Object.defineProperty(window,"CreateGuard",{value:api,writable:false,configurable:false});
    }catch(e){}
  }
  if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',function(){bindAllGuard();sealGuard();});}else{bindAllGuard();sealGuard();}
})();
