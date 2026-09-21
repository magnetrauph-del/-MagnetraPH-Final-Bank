// auth-core-create.js V5.7 FINAL - BLINK SAME LOGIN - WALANG KULAY - BOUNCY BUHAY - SEALED 20Y
(function(){
  "use strict";
  var CFG={EXIT_MS:350,BLINK_MS:120,SHAKE_MS:900,OWNER_KEY:"MAGNETRA_ULTRA_OWNER_2026"};
  Object.freeze(CFG);
  function qs(id){ return document.getElementById(id); }
  function showStatus(m,isErr){ var s=qs('status'); if(s){ s.textContent=m; s.style.color=isErr?"#C93A5A":"#6D5DD3"; } }
  function shakeField(id){ var el=qs(id); if(!el) return; el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake'); el.classList.add('error'); setTimeout(function(){ el.classList.remove('error'); },CFG.SHAKE_MS); }
  function goPage(e,url){ if(e) e.preventDefault(); var c=qs('card'); if(c) c.classList.add('page-exit'); setTimeout(function(){ location.href=url; },CFG.EXIT_MS); return false; }
  function getDeviceId(){ try{ var k="mp_device_id_20y"; var d=localStorage.getItem(k); if(!d){ d="dev_"+Date.now()+"_"+Math.random().toString(36).slice(2); localStorage.setItem(k,d); } return d; }catch(e){ return "dev_unknown"; } }

  function toggleEye(pId,openId,slashId,btnId){
    try{
      var p=qs(pId), o=qs(openId), s=qs(slashId), btn=qs(btnId);
      if(!p||!o||!s||!btn) return;
      var isPass=p.type==='password';
      // close - bouncy buhay
      o.classList.remove('blink-open'); o.classList.add('blink-close');
      s.classList.remove('blink-open'); s.classList.add('blink-close');
      setTimeout(function(){
        if(isPass){
          p.type='text'; o.style.display='none'; s.style.display='block';
        } else {
          p.type='password'; o.style.display='block'; s.style.display='none';
        }
        // open - bouncy 1.15 then 0.95 then 1 - buhay na buhay - same login
        o.classList.remove('blink-close'); o.classList.add('blink-open');
        s.classList.remove('blink-close'); s.classList.add('blink-open');
        setTimeout(function(){ o.classList.remove('blink-open'); s.classList.remove('blink-open'); },240);
      },120);
    }catch(e){}
  }

  function isPasswordSafeSilent(pwd){
    if(!pwd) return {ok:false,hack:true};
    if(/\s/.test(pwd)) return {ok:false,hack:false};
    var hackChars=/[<>'"`$\\\/=+\|&*%!@#^(){}\[\];:{}\x00-\x1F]/;
    if(hackChars.test(pwd)) return {ok:false,hack:true};
    if(pwd.length<6) return {ok:false,hack:false};
    if(/-$/.test(pwd)) return {ok:false,hack:false};
    if(!/^[A-Za-z]/.test(pwd)) return {ok:false,hack:true};
    return {ok:true,hack:false};
  }
  function getStrength(pwd){
    var safe=isPasswordSafeSilent(pwd);
    if(pwd.length===0) return null;
    if(!safe.ok){ if(safe.hack) return {pct:15,color:'#C93A5A',label:'Weak',hack:true}; return {pct:20,color:'#FF3B30',label:'Weak',hack:false}; }
    var score=0; if(pwd.length>=6) score++; if(pwd.length>=10) score++; if(/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score++; if(/[0-9]/.test(pwd)) score++; if(/[-]/.test(pwd)) score++;
    var map=[{pct:20,color:'#FF3B30',label:'Weak'},{pct:40,color:'#FF9500',label:'Fair'},{pct:60,color:'#FFCC00',label:'Good'},{pct:80,color:'#4CD964',label:'Strong'},{pct:100,color:'#7B2FFF',label:'Very Strong'},{pct:100,color:'#3E18E0',label:'Approved'}];
    if(score>=5) return map[5]; return map[Math.max(0,score-1)]||map[0];
  }
  function checkPwdStrength(){
    var pwd=qs('password'), meter=qs('pwdMeter'), bar=qs('pwdBar'), txt=qs('pwdText');
    if(!pwd||!meter||!bar||!txt) return; var v=pwd.value; if(v.length===0){ meter.style.display='none'; txt.textContent=''; return; }
    meter.style.display='block'; var s=getStrength(v); if(!s) return;
    bar.style.width=s.pct+'%'; bar.style.background=s.color; txt.textContent=s.label; txt.style.color=s.color;
    if(s.hack && window.CreateSecurity) CreateSecurity.addFail('hack_'+getDeviceId(),true);
  }
  async function createAccount(){
    var emailEl=qs('email'), passEl=qs('password'), confEl=qs('confirm'), btn=qs('btnCreate'), hpEl=qs('hp_email_create');
    var email=emailEl?emailEl.value.trim().toLowerCase():''; var pwd=passEl?passEl.value:''; var conf=confEl?confEl.value:'';
    if(hpEl && hpEl.value!==""){ showStatus('Blocked',true); if(window.CreateSecurity) CreateSecurity.addFail('hp_'+getDeviceId(),true); return; }
    if(!email||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){ shakeField('emailField'); showStatus('Invalid email',true); return; }
    var safe=isPasswordSafeSilent(pwd); if(!safe.ok){ shakeField('passField'); showStatus(safe.hack?'Invalid password':'Weak password',true); if(window.CreateSecurity) CreateSecurity.addFail(email,true); return; }
    if(pwd!==conf){ shakeField('confirmField'); showStatus('Passwords do not match',true); return; }
    if(window.CreateSecurity && CreateSecurity.canAttempt){ var chk=CreateSecurity.canAttempt(email); if(!chk.ok){ showStatus(chk.msg,true); return; } }
    if(btn){ btn.disabled=true; btn.innerText='Creating...'; } showStatus('Creating account...',false);
    try{
      var appCheckToken=null; try{ var tk=await firebase.appCheck().getToken(false); appCheckToken=tk.token; }catch(e){}
      var deviceId=window.CreateSecurity?CreateSecurity.getDeviceId():getDeviceId();
      var fn=firebase.functions().httpsCallable('createUserAccount');
      var res=await fn({email:email,password:pwd,deviceId:deviceId,appCheckToken:appCheckToken,ts:Date.now()});
      if(res && res.data && res.data.ok){ if(window.CreateSecurity) CreateSecurity.clearFail(email); try{ Object.freeze(auth); }catch(e){} setTimeout(function(){ goPage(null,'dashboard.html'); },350); }
      else { throw new Error('Create failed'); }
    }catch(e){
      if(window.CreateSecurity) CreateSecurity.addFail(email,safe.hack);
      setTimeout(function(){ var msg='Unable to create account'; if(e && e.code==='auth/email-already-in-use') msg='Email already in use'; showStatus(msg,true); shakeField('emailField'); if(btn){ btn.disabled=false; btn.innerText='Create Account'; } },800);
    }
  }
  function bindAll(){
    var e1=qs('eyeBtn1'); if(e1) e1.onclick=function(){ toggleEye('password','eyeGroup1','eyeSlash1','eyeBtn1'); };
    var e2=qs('eyeBtn2'); if(e2) e2.onclick=function(){ toggleEye('confirm','eyeGroup2','eyeSlash2','eyeBtn2'); };
    var pwd=qs('password'); if(pwd) pwd.addEventListener('input',checkPwdStrength);
    var btn=qs('btnCreate'); if(btn) btn.onclick=createAccount;
    var back=qs('backBtn'); if(back) back.onclick=function(e){ goPage(e,'login.html'); };
    var link=qs('loginLink'); if(link) link.onclick=function(e){ goPage(e,'login.html'); };
    document.addEventListener('keydown',function(e){ if(e.key==='Enter') createAccount(); });
  }
  function seal(){
    try{
      var isOwner=(()=>{ try{ return localStorage.getItem('mp_owner_20y')===CFG.OWNER_KEY; }catch(e){ return false; } })();
      if(!isOwner){ Object.freeze(auth); try{ Object.seal(db); }catch(e){} Object.defineProperty(window,'auth',{writable:false,configurable:false}); console.log('BPI V5.7 LOCKED - Blink Same Login No Color Bouncy'); }
      var api={bindAll:bindAll}; Object.freeze(api); Object.defineProperty(window,'AuthCoreCreate',{value:api,writable:false,configurable:false});
    }catch(e){}
  }
  if(document.readyState==='loading'){ document.addEventListener('DOMContentLoaded',function(){ bindAll(); seal(); }); }else{ bindAll(); seal(); }
})();
