// Public Help Center. Local search, no Auth initialization, AI calls or telemetry.
import { getAccountLanguage, setAccountLanguage, syncAccountLanguage } from './account-preferences.js';
import { CENTER_TOPICS, topicText, searchTopics } from './help-content.js?v=2';
import { renderBlock } from './help-sheet.js?v=1';
import { createReport, SUPPORT_EMAIL } from './report.js?v=2';
const $ = id => document.getElementById(id);
const COPY = {
  en: { title:'Help Center', intro:'Guides for the features available today.', search:'Search help', clear:'Clear search', none:'No matching guide. Try another word.', details:'Read guide', feedback:'Help & Feedback', report:'Prepare a support email', contact:'Configured address:', support:'Mailbox operation and response times are not confirmed. The app prepares an email; you review and send it.', privacy:'Privacy Policy', terms:'Terms of Service', language:'Language', back:'Back', count:n=>`${n} guides` },
  fil: { title:'Help Center', intro:'Gabay sa mga feature na available ngayon.', search:'Maghanap ng tulong', clear:'I-clear ang search', none:'Walang matching guide. Subukan ang ibang salita.', details:'Basahin ang guide', feedback:'Help & Feedback', report:'Maghanda ng support email', contact:'Naka-configure na address:', support:'Hindi pa confirmed ang mailbox operation at response time. Ihahanda ng app ang email; ikaw ang magre-review at magse-send.', privacy:'Privacy Policy', terms:'Terms of Service', language:'Wika', back:'Bumalik', count:n=>`${n} guide` },
  tl: { title:'Help Center', intro:'Mga gabay sa kasalukuyang magagamit na bahagi ng app.', search:'Maghanap ng tulong', clear:'Alisin ang hinanap', none:'Walang katugmang gabay. Subukan ang ibang salita.', details:'Basahin ang gabay', feedback:'Tulong at Feedback', report:'Maghanda ng email para sa tulong', contact:'Nakatakdang address:', support:'Hindi pa nakumpirma ang pagpapatakbo ng mailbox o oras ng pagsagot. Ihahanda ng app ang email; ikaw ang susuri at magpapadala.', privacy:'Privacy Policy', terms:'Mga Tuntunin', language:'Wika', back:'Bumalik', count:n=>`${n} gabay` },
};
let lang=getAccountLanguage(), report=null;
const openIds=new Set();
function h(tag,attrs={},...children){const n=document.createElement(tag);for(const [k,v] of Object.entries(attrs))n.setAttribute(k,v);n.append(...children);return n;}
function chevron(){const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('class','hChev');svg.setAttribute('width','22');svg.setAttribute('height','22');svg.setAttribute('aria-hidden','true');const use=document.createElementNS(svg.namespaceURI,'use');use.setAttribute('href','#i-chev');svg.append(use);return svg;}
function render(){
  const t=COPY[lang]; document.documentElement.lang=lang; document.title='MagnetraPH — '+t.title;
  $('hTitle').textContent=t.title; $('hTagline').textContent=t.intro; $('hEyebrow').textContent='MagnetraPH';
  $('hLabel').textContent=t.search; $('hInput').placeholder=t.search; $('hClear').setAttribute('aria-label',t.clear);
  $('hNoneText').textContent=t.none; $('hNoneClear').textContent=t.clear; $('hStuckTitle').textContent=t.feedback;
  $('hReport').textContent=t.report; $('hContact').textContent=t.contact; $('hSupportNote').textContent=t.support;
  $('fPrivacy').textContent=t.privacy; $('fTerms').textContent=t.terms; $('hLanguageLabel').textContent=t.language;
  $('hPolicyReview').textContent=lang==='en'?'Revised Privacy and Terms drafts await owner review. The linked documents have not been replaced.':lang==='fil'?'For owner review pa ang revised Privacy at Terms drafts. Hindi pa napapalitan ang linked documents.':'Naghihintay pa ng pagsusuri ng owner ang bagong draft ng Privacy at Mga Tuntunin. Hindi pa napapalitan ang mga dokumento.';
  $('backText').textContent=t.back; $('backLink').setAttribute('aria-label',t.back); $('helpLanguage').value=lang;
  const matches=new Set(searchTopics($('hInput').value,lang).map(x=>x.id));
  $('hTopics').replaceChildren(...CENTER_TOPICS.filter(x=>matches.has(x.id)).map(topic=>{
    const data=topicText(topic,lang), d=h('details',{class:'hRow',id:topic.id},h('summary',{},h('span',{class:'hQ'},data.summary),chevron()),h('div',{class:'hBody'},...data.body.map(block=>renderBlock(block,lang)).filter(Boolean)));
    d.open=openIds.has(topic.id)||!!$('hInput').value.trim();
    d.addEventListener('toggle',()=>{if(d.open)openIds.add(topic.id);else openIds.delete(topic.id)});
    return h('section',{class:'hSec hCat','aria-labelledby':topic.id+'-heading'},h('h2',{class:'hSecTitle',id:topic.id+'-heading'},data.title),d);
  }));
  $('hCount').textContent=t.count(matches.size); $('hNone').hidden=matches.size>0; $('hClear').hidden=!$('hInput').value;
}
function clearSearch(){ $('hInput').value='';render();$('hInput').focus(); }
function fromHash(){let id=location.hash.slice(1);if(/^faq-\d+$/.test(id))id='faq';if(!CENTER_TOPICS.some(x=>x.id===id))return;if(!$(id)){ $('hInput').value='';render(); } const d=$(id);d.open=true;openIds.add(id);d.scrollIntoView({block:'start'});}
try{report=createReport({getLang:()=>lang})}catch{}
$('hReport').hidden=!report; $('hReport').addEventListener('click',()=>report?.open($('hReport')));
$('hSearch').hidden=false; $('hSearch').addEventListener('submit',e=>{e.preventDefault();render()});$('hInput').addEventListener('input',render);
$('hClear').addEventListener('click',clearSearch);$('hNoneClear').addEventListener('click',clearSearch);
$('helpLanguage').addEventListener('change',e=>{lang=setAccountLanguage(e.target.value);render();report?.refresh()});
$('backLink').addEventListener('click',e=>{if(e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;try{if(new URL(document.referrer).origin===location.origin&&history.length>1){e.preventDefault();history.back()}}catch{}});
const contact=$('hSupportAddress');contact.textContent=SUPPORT_EMAIL;contact.href='mailto:'+SUPPORT_EMAIL;
window.addEventListener('storage',event=>{if(event.key==='mgpref_lang'){lang=syncAccountLanguage(event.newValue);render();report?.refresh()}});
window.addEventListener('hashchange',fromHash);render();fromHash();
