// dashboard-bills.js - V1 BLACK PURPLE - SEALED - OWNER ONLY
// Bills and Services - Load Bills Cash Bank - nasa dashboard.html lang - hindi separate page
// No emoji - code lang - Black Purple legit

(function(){
  const $ = (id) => document.getElementById(id);

  function goBills(type){
    // Lahat ng bills - via secure handler - hindi direct pera - commission lang
    // Tulad ng Maya - Bills payment partner lang - hindi hold ng funds
    if(!type) return;
    // Save type para sa bills.html kung may separate page
    try{ localStorage.setItem('magnetra_bills_type', type); }catch(e){}
    // For now - alert na secure - palitan mo ng window.location = 'bills.html?type='+type pag may bills.html ka na
    console.log('Bills click:', type);
    // Dito mo ilagay navigation - example:
    // window.location.href = 'bills.html?type=' + encodeURIComponent(type);
    // Temporary - para feel legit - hindi pa hold ng pera
    const msg = {
      load: 'Load - Commission per transaction - Secure via PayMongo',
      bills: 'Bills Payment - Commission per transaction - Secure',
      cash: 'Cash In Out - Commission per transaction - Secure',
      bank: 'Bank Transfer - Commission per transaction - Secure via PayMongo'
    };
    // Pwede mo palitan ng modal - wag alert sa final - for test lang
    if(typeof window.MagnetraToast!== 'undefined'){
      window.MagnetraToast(msg[type] || type);
    } else {
      console.log(msg[type]);
    }
  }

  function bindBills(){
    const load = $('btnLoad');
    const bills = $('btnBills');
    const cash = $('btnCash');
    const more = $('btnMore');

    if(load) load.addEventListener('click', () => goBills('load'));
    if(bills) bills.addEventListener('click', () => goBills('bills'));
    if(cash) cash.addEventListener('click', () => goBills('cash'));
    if(more) more.addEventListener('click', () => goBills('bank'));
  }

  // Wait for DOM - kasi dashboard.html may card pa
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', bindBills);
  } else {
    bindBills();
  }

  // Expose para sa auth-core kung kailangan
  window.MagnetraBills = { goBills };
})();
