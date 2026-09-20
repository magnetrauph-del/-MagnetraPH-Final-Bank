// dashboard-bills.js - FINAL V3 - SEALED - OWNER ONLY - 20 YEARS
// Navigation - Load Bills Cash Bank - papuntang bills.html - Black Purple Legit - by order
(function(){
  function go(type){
    localStorage.setItem('magnetra_bills_type', type);
    window.location.href = 'bills.html?type=' + type;
  }
  function bind(){
    var map = { btnLoad: 'load', btnBills: 'bills', btnCash: 'cash', btnBank: 'bank' };
    Object.keys(map).forEach(function(id){
      var el = document.getElementById(id);
      if(el){
        el.addEventListener('click', function(){ go(map[id]); });
      }
    });
  }
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', bind);
  } else {
    bind();
  }
  window.MagnetraBillsNav = { version: 'V3 SEALED 20 YEARS' };
})();
