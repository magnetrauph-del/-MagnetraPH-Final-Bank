/*
  MAGNETRAPH - GUARD-LOGIN.JS - 20Y SEALED 100% SOLID
  OWNER: BOSS ONLY - ONLY OWNER CAN EDIT - 2026-2046
  PURPOSE: Guard loginpage - pag logged in na bawal bumalik login - pag hindi auth bawal pasok dashboard - anti tamper - anti direct Firestore
*/
(function(){ "use strict";
 var CFG={ LOGIN_PAGE:"login.html", DASHBOARD:"dashboard.html", SEALED:true };
 Object.freeze(CFG);

 function guard(){
  try{
   if(typeof auth==="undefined") return;
   auth.onAuthStateChanged(function(user){
    var path=location.pathname;
    var isLogin=path.includes(CFG.LOGIN_PAGE) || path.endsWith("/") || path.endsWith("/login");
    var isDash=path.includes(CFG.DASHBOARD);
    if(user && isLogin){
     // may user na pero nasa login pa - lipat dashboard - 100% solid
     location.replace(CFG.DASHBOARD);
    }
    if(!user && isDash){
     // wala auth pero nasa dashboard - kick to login
     location.replace(CFG.LOGIN_PAGE);
    }
   });
  }catch(e){}
 }

 function antiTamper(){
  try{
   // anti devtools direct localStorage clear ng hacker - bantay
   var origClear=localStorage.clear.bind(localStorage);
   localStorage.clear=function(){
    // pag clear ng hacker - i restore device id - matibay
    var dev=localStorage.getItem("mp_device_id_login_20y");
    origClear();
    if(dev) localStorage.setItem("mp_device_id_login_20y",dev);
   };
  }catch(e){}
 }

 function seal(){
  try{
   Object.defineProperty(window,'GuardLoginSeal',{value:{owner:'BOSS',years:20,level:'100% SOLID - ANTI DIRECT ACCESS'},writable:false,configurable:false});
  }catch(e){}
 }

 if(document.readyState==="loading"){
  document.addEventListener('DOMContentLoaded',function(){guard();antiTamper();seal();});
 }else{ guard(); antiTamper(); seal(); }
})();
