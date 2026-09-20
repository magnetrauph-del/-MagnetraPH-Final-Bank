// bills-core.js - V2 SUPER SAFE - SEALED - OWNER ONLY - 20 YEARS - CONNECTED SA BILLS.HTML
// Bills and Services Core - Load Bills Cash Bank - Secure via PayMongo Google Play - does not hold funds - no emoji - by order
(function(){
  const $ = (id) => document.getElementById(id);
  const qs = new URLSearchParams(window.location.search);
  let type = (qs.get('type') || localStorage.getItem('magnetra_bills_type') || 'load').toLowerCase();
  const valid = ['load','bills','cash','bank'];
  if(!valid.includes(type)) type = 'load';
  const cfg = {
    load: { letter: 'L', title: 'Load', sub: 'Commission', commissionText: '₱3.00 - ₱5.00', commissionMin: 3, form: 'formLoad' },
    bills: { letter: 'B', title: 'Bills', sub: 'Payment', commissionText: '₱5.00 - ₱10.00', commissionMin: 5, form: 'formBills' },
    cash: { letter: 'C', title: 'Cash', sub: 'In Out', commissionText: '₱5.00 - ₱15.00', commissionMin: 5, form: 'formCash' },
    bank: { letter: 'B', title: 'Bank', sub: 'Transfer', commissionText: '₱10.00 - ₱25.00', commissionMin: 10, form: 'formBank' }
  };
  function applyType(){
    const c = cfg[type];
    $('badgeLetter').textContent = c.letter;
    $('badgeTitle').textContent = c.title;
    $('badgeSub').textContent = c.sub;
    $('commissionValue').textContent = c.commissionText;
    valid.forEach(t => {
      const el = $(cfg[t].form);
      if(el){ if(t === type) el.classList.remove('hidden'); else el.classList.add('hidden'); }
    });
    $('topTitle').textContent = c.title + ' - Bills and Services';
  }
  function getPayload(){
    if(type === 'load'){ return { type, number: $('loadNumber').value.trim(), amount: $('loadAmount').value }; }
    if(type === 'bills'){ return { type, biller: $('billsBiller').value, account: $('billsAccount').value.trim(), amount: $('billsAmount').value }; }
    if(type === 'cash'){ return { type, cashType: $('cashType').value, wallet: $('cashWallet').value, number: $('cashNumber').value.trim(), amount: $('cashAmount').value }; }
    if(type === 'bank'){ return { type, bank: $('bankName').value, account: $('bankAccount').value.trim(), amount: $('bankAmount').value }; }
    return null;
  }
  function validatePayload(p){
    if(!p) return false;
    if(p.type === 'load') return /^[0-9]{11}$/.test(p.number) && p.amount!== '' && Number(p.amount) >= 10;
    if(p.type === 'bills') return p.biller!== '' && p.account.length >= 6 && Number(p.amount) >= 50;
    if(p.type === 'cash') return /^[0-9]{11}$/.test(p.number) && Number(p.amount) >= 10;
    if(p.type === 'bank') return p.bank!== '' && p.account.length >= 6 && Number(p.amount) >= 50;
    return false;
  }
  function sanitizePayload(p){
    const base = { type: p.type };
    if(p.type === 'load'){ base.number = p.number; base.amount = Number(p.amount); }
    if(p.type === 'bills'){ base.biller = p.biller; base.account = p.account; base.amount = Number(p.amount); }
    if(p.type === 'cash'){ base.cashType = p.cashType; base.wallet = p.wallet; base.number = p.number; base.amount = Number(p.amount); }
    if(p.type === 'bank'){ base.bank = p.bank; base.account = p.account; base.amount = Number(p.amount); }
    return base;
  }
  async function proceedPayment(){
    const raw = getPayload();
    if(!validatePayload(raw)){ $('payBtn').textContent = 'Complete all fields'; setTimeout(()=>{ $('payBtn').textContent = 'Proceed Secure Payment'; }, 1400); return; }
    const payload = sanitizePayload(raw);
    try{
      const user = auth.currentUser;
      if(!user){ $('payBtn').textContent = 'Login required'; setTimeout(()=>{ $('payBtn').textContent = 'Proceed Secure Payment'; }, 1400); return; }
      $('payBtn').disabled = true;
      $('payBtn').textContent = 'Processing Secure...';
      await db.collection('transactions').add({
        uid: user.uid,
        type: payload.type,
        payload: payload,
        status: 'PENDING',
        commissionText: cfg[type].commissionText,
        commissionMin: cfg[type].commissionMin,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        source: 'bills-core.js V2 SUPER SAFE - PayMongo Google Play - does not hold funds'
      });
      $('payBtn').textContent = 'Payment Request Created - Secure';
      setTimeout(()=>{ window.location.href = 'dashboard.html'; }, 1100);
    }catch(e){
      console.error(e);
      $('payBtn').disabled = false;
      $('payBtn').textContent = 'Failed - Try again';
      setTimeout(()=>{ $('payBtn').textContent = 'Proceed Secure Payment'; }, 1600);
    }
  }
  function bind(){
    $('backBtn').addEventListener('click', ()=>{ window.location.href = 'dashboard.html'; });
    $('payBtn').addEventListener('click', proceedPayment);
    ['loadNumber','cashNumber'].forEach(id=>{
      const el = $(id);
      if(el){ el.addEventListener('input', (e)=>{ e.target.value = e.target.value.replace(/[^0-9]/g,'').slice(0,11); }); }
    });
  }
  if(document.readyState === 'loading'){ document.addEventListener('DOMContentLoaded', ()=>{ applyType(); bind(); }); } else { applyType(); bind(); }
  window.MagnetraBillsCore = { type, cfg, version: 'V2 SUPER SAFE 20 YEARS' };
})();
