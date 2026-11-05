const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..');
// Fingerprints of the approved public article, summaries and update-date markup.
const expected={
  "privacy": [
    "340dff797601827db424919f8d2287209a60956a4f86755ec8efe8507fc3ce66",
    "069fd3d60eace39c949d2515096ed714ef0184c2c36b9244d5405d2454dd1025",
    "6808c8280893093237022498f6a0b18ab948f793a2e5be3a45d24483e8186664",
    "451824a2070e367e76e300b3d71f3125f92c7e260176dd66a0d7b2d11afef5d5"
  ],
  "terms": [
    "85fe250711362e982dfd9e7afcf21afe4124742c8b5fd01fb44ddf1a55941158",
    "310fbd650b782624fbf73d82dd1c6a83e7088116d75bc6fc7ead145dbba5ac33",
    "d0bec3f72d24a0622e7aecfaf6db447fc33de44252cce462fe6051ca8e6b0b57",
    "46346140bda8fe04041a8a4edc6f49f8aae438bb0ab7ba49445b63c1be5a3100"
  ]
};
const hash=s=>crypto.createHash('sha256').update(s).digest('hex');
test('Approved public legal articles, summaries and update dates remain byte-for-byte unchanged',()=>{
 for(const kind of ['privacy','terms']){
  const s=fs.readFileSync(path.join(root,'public',kind+'.html'),'utf8');
  const parts=[s.match(/<article[^>]*class="card legalBody"[^>]*>([\s\S]*?)<\/article>/)[1],...[...s.matchAll(/<section[^>]*class="card legalSummary"[^>]*>([\s\S]*?)<\/section>/g)].map(x=>x[1]),s.match(/<p[^>]*id="pUpdated"[^>]*>[\s\S]*?<\/p>/)[0]];
  assert.deepEqual(parts.map(hash),expected[kind],kind);
 }
});
test('Public readers follow Preferences without a second language control or unpublished content activation path',()=>{
 for(const kind of ['privacy','terms']){
  const html=fs.readFileSync(path.join(root,'public',kind+'.html'),'utf8');
  assert.equal((html.match(/data-legal-language=/g)||[]).length,1);
  assert(html.includes('data-legal-language="en"'));
  assert(!/id="(?:legalLanguage|langBtn)"|<select\b|role="combobox"/.test(html));
  assert(!/Owner confirmation:|modernization-|docs\/legal|legal-review-banner/.test(html));
 }
 const js=fs.readFileSync(path.join(root,'public/ui-legal.js'),'utf8');
 assert(js.includes("'./account-preferences.js'"));
 assert(!/\bfetch\s*\(|docs\/legal|modernization-|setAccountLanguage|localStorage\.setItem|sessionStorage\.setItem/.test(js));
});
test('Hosting publishes only public assets and excludes private review documents',()=>{
 const cfg=JSON.parse(fs.readFileSync(path.join(root,'firebase.json'),'utf8')).hosting;
 assert.equal(cfg.public,'public');assert(cfg.ignore.includes('**/*.md'));
 const walk=dir=>fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>{const p=path.join(dir,e.name);assert(!e.isSymbolicLink(),'Unexpected public symlink');return e.isDirectory()?walk(p):[p]});
 const hosted=walk(path.join(root,'public'));
 for(const file of hosted)assert(!/\.md$|(?:account-cleanup|modernization)-(?:audit|owner|privacy|terms)-?review|legal-review\.cjs/.test(file),file);
 assert(!fs.existsSync(path.join(root,'public/docs/legal')));
});
