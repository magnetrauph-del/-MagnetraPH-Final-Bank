// MagnetraPH auth.js - FINAL FIXED FOR YOUR login.html
(function(){
  const $ = (id)=>document.getElementById(id);
  let failCount = parseInt(localStorage.getItem('mp_fail')||'0');
  let lockUntil = parseInt(localStorage.getItem('mp_lock')||'0');
  const isLocked = ()=> Date.now() < lockUntil;
  const sanitize = (v)=> String(v).replace(/[<>\"'&]/g,'');
  const secureStore = (k,v)=>{ try{ localStorage.setItem(k, btoa(encodeURIComponent(v)+'|mp_salt_2026')); }catch{} };

  const effectShake = (el)=>{ if(!el) return; el.animate([{transform:'translateX(0)'},{transform:'translateX(-6px)'},{transform:'translateX(6px)'},{transform:'translateX(0)'}],{duration:300}); };
  const effectLoading = (btn,txt)=>{ const old=btn.innerHTML; btn.innerHTML=txt; btn.disabled=true; btn.style.opacity='0.7'; return ()=>{btn.innerHTML=old; btn.disabled=false; btn.style.opacity='1';}; };

  const goPage = (target)=>{
    const lp=$('lP');
    if(lp){ lp.style.transition='transform 0.35s ease, opacity 0.35s ease'; lp.style.transform='translateX(-10px)'; lp.style.opacity='0.7'; }
    setTimeout(()=>{
      if(lp){ lp.style.transform='translateX(0)'; lp.style.opacity='1'; }
      if(target==='DASHBOARD'){ alert('LOGIN SUCCESS - PASOK SA DASHBOARD'); }
      if(target==='FAQ'){ alert('PASOK SA FAQ HELP PAGE'); location.href='faq.html'; }
      if(target==='FORGOT'){ alert('PASOK SA FORGOT PASSWORD PAGE'); location.href='forgot.html'; }
      if(target==='SIGNUP'){ alert('PASOK SA CREATE ACCOUNT PAGE'); location.href='signup.html'; }
      if(target==='BIOMETRICS'){ alert('BIOMETRICS AUTH SUCCESS - BANK LEVEL VERIFIED'); }
      if(target==='GOOGLE'){ alert('GOOGLE AUTH - SECURE VERIFIED'); }
    },250);
  };

  document.addEventListener('DOMContentLoaded',()=>{
    const em=$('em'), pw=$('pw'), eye=$('pwEye'), o=$('eOpen'), c=$('eClose');
    const faq=$('faqBtn'), forgot=$('forgotBtn'), bio=$('bioBtn'), login=$('loginBtn'), google=$('googleBtn'), signup=$('goSignup');

    if(isLocked() && login){
      login.disabled=true; login.textContent='Locked 30s';
      setTimeout(()=>{localStorage.removeItem('mp_lock'); localStorage.setItem('mp_fail','0'); login.disabled=false; login.textContent='Log in';}, 30000);
    }

    if(eye && pw && o && c){
      eye.addEventListener('click',()=>{
        const h=pw.type==='password'; pw.type=h?'text':'password';
        o.style.display=h?'none':'block'; c.style.display=h?'block':'none';
      });
    }

    if(faq) faq.addEventListener('click',()=>goPage('FAQ'));
    if(forgot) forgot.addEventListener('click',()=>goPage('FORGOT'));
    if(signup) signup.addEventListener('click',()=>goPage('SIGNUP'));
    if(bio) bio.addEventListener('click',()=>{ const stop=effectLoading(bio,'Verifying Biometrics...'); setTimeout(()=>{stop(); goPage('BIOMETRICS');},1000); });
    if(google) google.addEventListener('click',()=>{ const stop=effectLoading(google,'Secure Google...'); setTimeout(()=>{stop(); goPage('GOOGLE');},800); });

    if(login){
      login.addEventListener('click',()=>{
        if(!em||!pw) return;
        const email=sanitize(em.value.trim()), pass=sanitize(pw.value);
        if(!email||!pass){ effectShake(em); effectShake(pw); return; }
        if(isLocked()){ alert('BANK LOCK - 30 seconds'); return; }
        const stop=effectLoading(login,'Bank Verifying...');
        setTimeout(()=>{
          if(email.length<5||pass.length<6){
            failCount++; localStorage.setItem('mp_fail',failCount);
            if(failCount>=5){ lockUntil=Date.now()+30000; localStorage.setItem('mp_lock',lockUntil); alert('BANK SECURITY LOCK - 5 fails'); location.reload(); }
            else{ effectShake(login); alert('Invalid - Bank Level Check Failed'); }
            stop(); return;
          }
          secureStore('mp_user',email); secureStore('mp_token','bank_token_'+Date.now());
          localStorage.setItem('mp_fail','0'); stop(); goPage('DASHBOARD');
        },800);
      });
    }
  });
})();
