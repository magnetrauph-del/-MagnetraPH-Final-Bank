// auth-core-dashboard.js V5 Final Sealed 20 Years - No Emoji - MagnetraPH - Dashboard Only - Professional Business Text
(function(){
"use strict";
var CFG={EXIT_MS:350,BANNER_MS:8000};
Object.freeze(CFG);
function qs(id){return document.getElementById(id);}
function goPage(e,url){
if(e) e.preventDefault();
var card=qs('card');if(card) card.classList.add('page-exit');
setTimeout(function(){location.href=url;},CFG.EXIT_MS);
return false;
}
function addBotMsg(who,txt){
try{
var box=qs('botBox');
if(!box) return;
var d=document.createElement('div');
d.className='botMsg';
d.innerHTML='<b>'+who+':</b> '+txt;
box.appendChild(d);
box.scrollTop=box.scrollHeight;
}catch(e){}
}
async function initDashboard(){
try{
if(typeof auth==="undefined" || typeof db==="undefined") return;
auth.onAuthStateChanged(async function(user){
if(!user){goPage(null,'login.html');return;}
try{
var ref=db.collection('users').doc(user.uid);
var doc=await ref.get();
var displayName=user.displayName || (doc.exists?doc.data().displayName:"") || user.email.split('@')[0];
var professionalName=displayName;
if(qs('welcomeName')){
qs('welcomeName').innerText='Welcome, '+professionalName;
}
if(doc.exists){
var data=doc.data();
var mp=data.mPoints||0;
if(qs('mp')) qs('mp').innerText=mp+' MPoints';
var mpd=data.marketplace;
if(mpd && qs('c1s')){
qs('c1s').innerText='Marketplace - '+(mpd.totalPost||0)+' / '+(mpd.maxPost||3)+' Free';
}
}
}catch(e){}
var firstKey='mag_first_'+user.uid;
var isFirst=!localStorage.getItem(firstKey);
if(isFirst && qs('firstBanner')){
qs('firstBanner').style.display='block';
localStorage.setItem(firstKey,'1');
setTimeout(function(){var b=qs('firstBanner');if(b) b.style.display='none';},CFG.BANNER_MS);
}
});
}catch(e){}
}
function bindAll(){
var logout=qs('logoutBtn');
if(logout){
logout.onclick=function(){
if(confirm('Logout? / Mag logout ka na?')){
auth.signOut().then(function(){location.href='login.html';});
}
};
}
var chips=document.querySelectorAll('.fchip');
chips.forEach(function(c){
c.onclick=function(){
document.querySelectorAll('.fchip').forEach(function(x){x.classList.remove('active');});
c.classList.add('active');
location.href='marketplace.html?filter='+c.dataset.k;
};
});
var botBtn=qs('botBtn');
if(botBtn){
botBtn.onclick=function(){
var input=qs('botIn');
if(!input) return;
var val=input.value.trim();
if(!val) return;
var safeVal=typeof Security!=='undefined'?Security.sanitize(val):val;
addBotMsg('You',safeVal);
addBotMsg('System','Your professional listing is secured. Free posting 3 max. After that Basic 100 MPoints Gold 500 MPoints via Google Play. MPoints for boosting. Payments via PayMongo. MagnetraPH does not hold your funds. Secure by order.');
input.value='';
};
}
var botIn=qs('botIn');
if(botIn){
botIn.onkeydown=function(e){if(e.key==='Enter'){var b=qs('botBtn');if(b) b.click();}};
}
var goM=qs('goMarket');
if(goM){goM.onclick=function(e){goPage(e,'marketplace.html');};}
}
if(document.readyState==="loading"){document.addEventListener('DOMContentLoaded',function(){initDashboard();bindAll();});}else{initDashboard();bindAll();}
})();
