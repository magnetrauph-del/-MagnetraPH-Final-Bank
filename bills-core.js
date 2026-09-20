// bills-core.js - FINAL V3 - SUPER SAFE LIVE - SEALED - OWNER ONLY - 20 YEARS
// Bills and Services Core - Load Bills Cash Bank - PayMongo Google Play - MagnetraPH does not hold funds
// Super safe vs hacker - client PENDING only - server Cloud Function lang mag PAID - App Check live - no debug token

(function(){
  var $ = function(id){ return document.getElementById(id); };
  var qs = new URLSearchParams(window.location.search);
  var type = (qs.get('type') || localStorage.getItem('magnetra_bills_type') || 'load').toLowerCase();
  var valid = ['load','bills','cash','bank'];
  if(valid.indexOf(type) === -1) type = 'load';

  var cfg = {
    load: { letter: 'L', title: 'Load', sub: 'Commission', commissionText: '₱3.00 - ₱5.00', commissionMin: 3, form: 'formLoad' },
    bills: { letter: 'B', title: 'Bills', sub: 'Payment', commissionText: '₱5.00 - ₱10.00', commissionMin: 5, form: 'formBills' },
    cash: { letter: 'C', title: 'Cash', sub: 'In Out', commissionText: '₱5.00 - ₱15.00', commissionMin: 5, form: 'formCash' },
    bank: { letter: 'B', title: 'Bank', sub: 'Transfer', commissionText: '₱10.00 - ₱25.00', commissionMin: 10, form: 'formBank' }
  };

  function applyType(){
    var c = cfg[type];
    $('badgeLetter').textContent = c.letter;
    $('badgeTitle').textContent = c.title;
    $('badgeSub').textContent = c.sub;
    $('commissionValue').textContent = c.commissionText;
    valid.forEach(function(t){
      var el = $(cfg[t].form);
      if(el){
        if(t === type) el.classList.remove('hidden');
        else el.classList.add('hidden');
      }
    });
    $('topTitle').textContent = c.title + ' - Bills and Services';
  }

  function getPayload(){
    if(type === 'load'){
      return { type: type, number: $('loadNumber').value.trim(), amount: $('loadAmount').value };
    }
    if(type === 'bills'){
      return { type: type, biller: $('billsBiller').value, account: $('billsAccount').value.trim(), amount: $('billsAmount').value };
    }
    if(type === 'cash'){
      return { type: type, cashType: $('cashType').value, wallet: $('cashWallet').value, number: $('cashNumber').value.trim(), amount: $('cashAmount').value };
    }
    if(type === 'bank'){
      return { type: type, bank: $('bankName').value, account: $('bankAccount').value.trim(), amount: $('bankAmount').value };
    }
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
    var base = { type: p.type };
    if(p.type === 'load'){ base.number = p.number; base.amount = Number(p.amount); }
    if(p.type === 'bills'){ base.biller = p.biller; base.account = p.account; base.amount = Number(p.amount); }
    if(p.type === 'cash'){ base.cashType = p.cashType; base.wallet = p.wallet; base.number = p.number; base.amount = Number(p.amount); }
    if(p.type === 'bank'){ base.bank = p.bank; base.account = p.account; base.amount = Number(p.amount); }
    return base;
  }

  async function proceedPayment(){
    var raw = getPayload();
    if(!validatePayload(raw)){
      $('payBtn').textContent = 'Complete all fields';
      setTimeout(function(){ $('payBtn').textContent = 'Proceed Secure Payment'; }, 1400);
      return;
    }
    var payload = sanitizePayload(raw);
    try{
      var user = auth.currentUser;
      if(!user){
        $('payBtn').textContent = 'Login required';
        setTimeout(function(){ $('payBtn').textContent = 'Proceed Secure Payment'; }, 1400);
        return;
      }
      $('payBtn').disabled = true;
      $('payBtn').textContent = 'Processing Secure...';

      // Call Cloud Function - server authoritative - super safe - App Check live token auto included - no secret in client
      var createFn = firebase.functions().httpsCallable('createBillsTransaction');
      var res = await createFn({ type: payload.type, payload: payload });

      $('payBtn').textContent = 'Payment Request Created - Secure PENDING';
      setTimeout(function(){ window.location.href = 'dashboard.html'; }, 1100);

    }catch(e){
      console.error(e);
      $('payBtn').disabled = false;
      $('payBtn').textContent = 'Failed - Try again';
      setTimeout(function(){ $('payBtn').textContent = 'Proceed Secure Payment'; }, 1600);
    }
  }

  function bind(){
    $('backBtn').addEventListener('click', function(){ window.location.href = 'dashboard.html'; });
    $('payBtn').addEventListener('click', proceedPayment);
    ['loadNumber','cashNumber'].forEach(function(id){
      var el = $(id);
      if(el){
        el.addEventListener('input', function(ev){
          ev.target.value = ev.target.value.replace(/[^0-9]/g,'').slice(0,11);
        });
      }
    });
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', function(){ applyType(); bind(); });
  } else {
    applyType(); bind();
  }

  window.MagnetraBillsCore = { type: type, cfg: cfg, version: 'V3 SEALED LIVE 20 YEARS' };
})();
