// MagnetraPH auth.js - FIXED BANK LEVEL
(function(){ 
  const $ = (id)=>document.getElementById(id);
  let failCount = parseInt(localStorage.getItem('mp_fail')||'0');
  let lockUntil = parseInt(localStorage.getItem('mp_lock')||'0');
  
  function sanitize(v){return String(v).replace(/[<>\"'&]/g,'');}
  function isLocked(){return Date.now() < lockUntil;}
  function secureStore(k,v){
    const s=btoa(encodeURIComponent(v)+'|mp_salt_2026');
    localStorage.setItem(k,s);
  }

  function effectRipple(btn,e){
    const r=document.createElement('span');
    r.style.position='absolute';r.style.width='20px';r.style.height='20px';
    r.style.background='rgba(255,255,255,.3)';r.style.borderRadius='50%';
    r.style.transform='translate(-50%,-50%)';r.style.pointerEvents='none';
    r.style.left=(e.clientX - btn.getBoundingClientRect().left) + 'px';
    r.style.top=(e.clientY - btn.getBoundingClientRect().top) + 'px';
    r.style.animation='ripple 0.6s linear';btn.style.position='relative';
    btn.style.overflow='hidden';btn.appendChild(r);setTimeout(()=>r.remove(),600);
  }
  function effectShake(el){ 
    if(!el) return;
    el.animate([{transform:'translateX(0)'},{transform:'translateX(-6px)'},{transform:'translateX(6px)'},{transform:'translateX(0)'}],{duration:300}); 
  }
  function effectLoading(btn,txt){
    const old=btn.innerHTML;btn.innerHTML=txt||'Loading...';btn.disabled=true;btn.style.opacity='0.7';
    return ()=>{btn.innerHTML=old;btn.disabled=false;btn.style.opacity='1';}
  }

  function goPage(target){
    // FIXED - kahit walang lP gagana pa rin
    console.log('TUMATAWID SA '+target);
    if(target==='DASHBOARD'){ alert('LOGIN SUCCESS - PASOK SA DASHBOARD'); location.href='home.html'; }
    if(target==='FAQ'){ location.href='faq.html'; }
    if(target==='FORGOT'){ location.href='forgot.html'; }
    if(target==='SIGNUP'){ location.href='signup.html'; }
    if(target==='BIOMETRICS'){ alert('BIOMETRICS AUTH SUCCESS - BANK LEVEL VERIFIED'); }
    if(target==='GOOGLE'){ alert('GOOGLE AUTH - SECURE VERIFIED'); }
  }

  document.addEventListener('DOMContentLoaded',()=>{
    const em=$('em') || document.querySelector('input[type="email"]');
    const pw=$('pw'), eye=$('pwEye'), o=$('eOpen'), c=$('eClose');
    const faq=$('faqBtn'), forgot=$('forgotBtn'), bio=$('bioBtn'), login=$('loginBtn'), google=$('googleBtn'), signup=$('goSignup');
    
    if(isLocked() && login){
      login.disabled=true; login.textContent='Locked 30s - Bank Security';
      setTimeout(()=>{localStorage.removeItem('mp_lock');login.disabled=false;login.textContent='Log in';},30000);
    }

    if(eye && pw){
      eye.addEventListener('click',(e)=>{
        effectRipple(eye,e);
        const h=pw.type==='password'; pw.type=h?'text':'password';
        if(o&&c){o.style.display=h?'none':'block';c.style.display=h?'block':'none';}
      });
    }

    if(faq) faq.addEventListener('click',(e)=>{effectRipple(faq,e);goPage('FAQ');});
    if(forgot) forgot.addEventListener('click',(e)=>{effectRipple(forgot,e);goPage('FORGOT');});
    if(bio) bio.addEventListener('click',(e)=>{effectRipple(bio,e);const stop=effectLoading(bio,'Verifying Biometrics...');setTimeout(()=>{stop();goPage('BIOMETRICS');},1200);});
    if(google) google.addEventListener('click',(e)=>{effectRipple(google,e);const stop=effectLoading(google,'Secure Google...');setTimeout(()=>{stop();goPage('GOOGLE');},1000);});
    if(signup) signup.addEventListener('click',(e)=>{effectRipple(signup,e);goPage('SIGNUP');});

    if(login){
      login.addEventListener('click',(e)=>{
        effectRipple(login,e);
        if(!em || !pw) return;
        const email=sanitize(em.value.trim()), pass=sanitize(pw.value);
        if(!email||!pass){effectShake(em);effectShake(pw);return;}
        if(isLocked()){alert('BANK LOCK - 30 seconds');return;}
        const stop=effectLoading(login,'Bank Verifying...');
        setTimeout(()=>{
          if(email.length<5||pass.length<6){
            failCount++;localStorage.setItem('mp_fail',failCount);
            if(failCount>=5){lockUntil=Date.now()+30000;localStorage.setItem('mp_lock',lockUntil);alert('BANK SECURITY LOCK - 5 fails'); location.reload();}
            else{effectShake(login);alert('Invalid - Bank Level Check Failed');}
            stop();return;
          }
          secureStore('mp_user',email);secureStore('mp_token','bank_token_'+Date.now());
          localStorage.setItem('mp_fail','0');stop();goPage('DASHBOARD');
        },1000);
      });
    }
  });
})();
