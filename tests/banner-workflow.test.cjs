const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
async function api(){const m=new vm.SourceTextModule(fs.readFileSync('public/banner-workflow.js','utf8'));await m.link(()=>{throw Error('Workflow must not import services or validators')});await m.evaluate();return m.namespace;}
const initial=['asset:1','name|headline','food|layout|category','order|square'];
const valid=[true,true,true,true];
test('system defaults, delayed changes, restored drafts and display changes never fabricate user edits',async()=>{
 const{createWorkflow}=await api();const w=createWorkflow();w.reset(initial);
 for(const source of ['system','restored','display']){w.sync(['asset:1','name|headline',source,'order|square'],source);assert.equal(w.status(3,true),'pending');}
 assert.equal(w.view(3).origin,'restored');
});
test('user material changes alone create orange; unchanged events leave revision unchanged',async()=>{
 const{createWorkflow}=await api();const w=createWorkflow();w.reset(initial);const before=w.token();
 w.sync(initial,'user',[2]);assert(w.current(before));assert.equal(w.status(2,true),'pending');
 const next=[...initial];next[1]='changed';w.sync(next,'user',[2]);assert.equal(w.status(2,false),'incomplete');assert.equal(w.view(2).origin,'user');
 w.sync(initial,'user',[2]);assert.equal(w.status(2,true),'incomplete');
});
test('Continue confirms only valid current revisions and exact confirmed restoration requires validity and ready assets',async()=>{
 const{createWorkflow}=await api();const w=createWorkflow();w.reset(initial);
 assert.equal(w.confirm([1],valid,w.token()),true);assert.equal(w.status(1,true),'complete');
 const next=[...initial];next[0]='asset:2';w.sync(next,'user',[1]);assert.equal(w.status(1,true),'incomplete');
 w.sync(initial,'user',[1]);assert.equal(w.status(1,true),'complete');assert.notEqual(w.status(1,false),'complete');assert.notEqual(w.status(1,true,false),'complete');
 assert.equal(w.confirm([2],[true,false,true,true],w.token()),false);
});
test('automatic changes revoke confirmation without orange; identical defaults remain confirmed',async()=>{
 const{createWorkflow}=await api();const w=createWorkflow();w.reset(initial);w.confirm([3,4],valid,w.token());
 w.sync(initial,'system');assert.equal(w.status(3,true),'complete');
 const next=[...initial];next[3]='book';w.sync(next,'system',[4]);assert.equal(w.status(4,true),'pending');
});
test('final validation owns red; correction clears obsolete red without confirming',async()=>{
 const{createWorkflow}=await api();const w=createWorkflow();w.reset(initial);assert.equal(w.status(2,false),'pending');
 w.attempt();assert.equal(w.status(2,false),'invalid');assert.equal(w.status(3,true),'pending');
 const next=[...initial];next[1]='corrected';w.sync(next,'user',[2]);assert.equal(w.status(2,true),'incomplete');
 assert.equal(w.confirm([1,2,3,4],valid,w.token()),true);for(const at of [1,2,3,4])assert.equal(w.status(at,true),'complete');
});
test('stale asynchronous mutation/confirmation is rejected after revision changes and account/reset epochs',async()=>{
 const{createWorkflow}=await api();const w=createWorkflow();w.reset(initial);const old=w.token();
 const next=[...initial];next[1]='new';w.sync(next,'user',[2]);assert.equal(w.confirm([2],valid,old),false);
 assert.equal(w.sync(initial,'restored',[2],old),false);const account=w.token();w.reset(initial);
 assert.equal(w.confirm([1,2,3,4],valid,account),false);assert.equal(w.sync(next,'user',[2],account),false);
 for(const at of [1,2,3,4])assert.equal(w.status(at,true),'pending');
});
test('unknown mutation sources are rejected and snapshots are read-only copies',async()=>{
 const{createWorkflow}=await api();const w=createWorkflow();w.reset(initial);assert.throws(()=>w.sync(initial,'click'));
 const view=w.view(1);assert(Object.isFrozen(view));assert.equal(w.view(1).signature,initial[0]);
});
test('attention waits for visibility, normal motion and ready state; no focus/visibility replay',async()=>{
 const{createAttentionBudget}=await api();const a=createAttentionBudget();const base={step:3,epoch:1,revision:0,ready:true,visible:true,documentVisible:true,reducedMotion:false};
 for(const state of [{visible:false},{documentVisible:false},{reducedMotion:true},{ready:false}])assert.equal(a.claim({...base,...state}),false);
 assert.equal(a.claim(base),true);assert.equal(a.claim(base),false);assert.equal(a.claim({...base,visible:false}),false);assert.equal(a.claim(base),false);
 assert.equal(a.claim({...base,revision:1}),true);
});
test('attention history is bounded to four steps and cannot replay old unchanged steps after other revisions',async()=>{
 const{createAttentionBudget}=await api();const a=createAttentionBudget();const base={epoch:1,revision:0,ready:true,visible:true,documentVisible:true,reducedMotion:false};
 assert(a.claim({...base,step:1}));for(let revision=0;revision<100;revision++)assert(a.claim({...base,step:2,revision}));
 assert.equal(a.claim({...base,step:1}),false);a.reset();assert(a.claim({...base,step:1}));assert.equal(a.claim({...base,step:5}),false);
});
