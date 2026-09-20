// dashboard-bills.js - V1 - SEALED - OWNER ONLY - 20 YEARS - CONNECTED SA DASHBOARD.HTML
// Bills and Services - Load Bills Cash Bank - navigation lang - papuntang bills.html - by order - walang emoji
(function(){
  const $ = (id) => document.getElementById(id);
  function goBills(type){
    try{ localStorage.setItem('magnetra_bills_type', type); }catch(e){}
    window.location.href = 'bills.html?type=' + encodeURIComponent(type);
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
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', bindBills);
  } else {
    bindBills();
  }
  window.MagnetraBillsNav = { goBills };
})();
