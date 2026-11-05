const base='http://127.0.0.1:8876';
const sdk=`export function onAuthStateChanged(auth,cb){window.__authObservers.push(cb);queueMicrotask(()=>cb(auth.currentUser));return()=>{window.__authObservers=window.__authObservers.filter(x=>x!==cb)}}export async function updateProfile(user,changes){if(window.__nameFail)throw Error('private fixture SDK error');if(window.__holdName)await new Promise(r=>window.__releaseName=r);Object.assign(user,changes);if(user.uid===window.__mockUser?.uid)sessionStorage.setItem('__fixtureUser',JSON.stringify(user));sessionStorage.setItem('__nameDB',JSON.stringify(user));}`;
const init=`export const auth={get currentUser(){return window.__mockUser},authStateReady:async()=>{}};`;
const core=`import {auth} from './firebase-init.js';import {onAuthStateChanged} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
export const PASSWORD_MIN=8;export const passwordProblem=()=>null;export const isInAppBrowser=()=>false;export const changePassword=async()=>{};export const deleteAccount=async()=>{};
export const logout=async()=>{if(window.__logoutMode==='throw')throw Error('mock sign-out failure');if(window.__logoutMode==='noop')return;window.__setUser(null)};
export function guardDashboard(cb){let ready=false;document.documentElement.style.visibility='hidden';return onAuthStateChanged(auth,u=>{if(!u){location.replace('/login.html');return}if(!u.emailVerified){location.replace('/login.html?verify=1');return}document.documentElement.style.visibility='';if(!ready){ready=true;cb(u)}})}`;
async function install(context,{lang='en',theme='light',profile=false,user=null}={}){
 await context.addInitScript(({lang,theme,profile,initialUser})=>{
  const fallbackUser={uid:'account-A',displayName:'Alex',email:'test@example.invalid',emailVerified:true,providerData:[{providerId:'password'}],metadata:{creationTime:'2025-01-01'}};
  window.__mockUser=JSON.parse(sessionStorage.getItem('__fixtureUser')||JSON.stringify(initialUser||fallbackUser));window.__authObservers=[];
  window.__setUser=u=>{window.__mockUser=u;sessionStorage.setItem('__fixtureUser',JSON.stringify(u));for(const cb of [...window.__authObservers])cb(u)};
  if(!localStorage.getItem('mgpref_lang'))localStorage.setItem('mgpref_lang',lang);if(!localStorage.getItem('mgpref_theme'))localStorage.setItem('mgpref_theme',theme);
  if(profile&&!localStorage.getItem('mag_bizprofile'))localStorage.setItem('mag_bizprofile',JSON.stringify({v:1,name:'Profile business',contact:'Profile contact'}));
 },{lang,theme,profile,initialUser:user});
 const blocked=[];
 await context.route('**/*',r=>{
  const u=new URL(r.request().url());
  if(u.hostname==='www.gstatic.com'&&u.pathname.endsWith('/firebase-auth.js'))return r.fulfill({contentType:'text/javascript',body:sdk});
  if(u.origin!==base){blocked.push(u.origin);return r.abort()}
  if(u.pathname==='/firebase-init.js')return r.fulfill({contentType:'text/javascript',body:init});
  if(u.pathname==='/auth-core-shared.js')return r.fulfill({contentType:'text/javascript',body:core});
  if(u.pathname==='/login.html')return r.fulfill({contentType:'text/html',body:'<!doctype html><title>Local login fixture</title><p>Signed out test</p>'});
  return r.continue();
 });return blocked;
}
module.exports={base,install};
