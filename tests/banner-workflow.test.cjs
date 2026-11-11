const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
async function api(){const m=new vm.SourceTextModule(fs.readFileSync('public/banner-workflow.js','utf8'));await m.link(()=>{throw Error('Workflow must not import services or validators')});await m.evaluate();return m.namespace;}
async function fixture(){
 const {createWorkflow}=await api(),w=createWorkflow();
 const facts=[{photo:1},{product:'',headline:''},{design:'suggested'},{choice:'order'}],extra=[0,0,0,0];
 const signatures=()=>facts.map((f,i)=>JSON.stringify([f,extra[i]]));
 w.reset(signatures(),facts);w.assess(['valid','invalid','valid','valid']);
 const change=(at,next,{source='user',keys=Object.keys(next),optional=false,ticket}={})=>{
  const outcomes=[1,2,3,4].map(n=>w.view(n).outcome);
  facts[at-1]={...next};if(optional)extra[at-1]++;
  const result=w.sync(signatures(),source,[at],ticket,{requirements:facts,evidence:{[at]:keys}});
  // Mock the synchronous adapter's validator outcomes; the engine owns no rules.
  if(result)w.assess(outcomes);return result;
 };
 return {w,facts,change,signatures};
}
test('N1–N3: initial access is Step 1; controller rejects locked and malformed navigation',async()=>{
 const{w}=await fixture();assert.deepEqual({...w.position()},{activeStep:1,highestReached:1});
 for(const at of [2,3,4,0,5,NaN,'2']){assert.equal(w.accessible(at),false);assert.equal(w.navigate(at),false);}
 assert(w.view(1).visited);assert.equal(w.view(2).visited,false);
});
test('N4/N5: invalid or pending Continue cannot confirm/unlock; valid Continue does both',async()=>{
 const{w}=await fixture();w.assess(['invalid','invalid','valid','valid']);assert.equal(w.proceed(w.token()),false);assert.equal(w.status(1),'incomplete');assert.equal(w.accessible(2),false);
 w.assess(['pending','invalid','valid','valid']);assert.equal(w.proceed(w.token()),false);assert.equal(w.status(1),'pending');
 w.assess(['valid','invalid','valid','valid']);assert(w.proceed(w.token()));assert(w.confirmed(1));assert(w.accessible(2));assert(w.navigate(2));
});
test('N6–N9: navigation never confirms; reached access survives invalid earlier content; no Step 4 Continue',async()=>{
 const{w}=await fixture();w.assess(Array(4).fill('valid'));
 for(const at of [1,2,3]){assert(w.proceed(w.token()));assert(w.navigate(at+1));}
 assert.equal(w.proceed(w.token()),false);assert.equal(w.confirmed(4),false);
 w.assess(['invalid','valid','valid','valid']);assert(w.navigate(1));assert(w.navigate(4));assert.equal(w.position().highestReached,4);
});
test('S1/S2: display changes and unchanged events create neither revision nor evidence',async()=>{
 const{w,facts,change}=await fixture(),ticket=w.token();change(3,facts[2]);change(3,{design:'display'},{source:'display'});
 assert(w.current(ticket));assert.equal(w.status(3),'pending');assert.deepEqual({...w.view(3).evidence},{});
});
test('S3/S4: user-required work becomes green without confirmation or access progression',async()=>{
 const{w,change}=await fixture();change(2,{product:'Beans',headline:''},{keys:['product']});assert.equal(w.status(2),'pending');
 change(2,{product:'Beans',headline:'Fresh roast'},{keys:['headline']});w.assess(Array(4).fill('valid'));
 assert.equal(w.status(2),'complete');assert.equal(w.confirmed(2),false);assert.equal(w.accessible(2),false);
});
test('S5–S8: departure exposes orange; ongoing invalid correction keeps it; valid correction clears it',async()=>{
 const{w,change}=await fixture();w.proceed(w.token());w.navigate(2);w.navigate(1);assert.equal(w.status(2),'incomplete');
 change(2,{product:'Beans',headline:''});assert.equal(w.status(2),'incomplete');
 change(2,{product:'Beans',headline:'Fresh'});w.assess(Array(4).fill('valid'));assert.equal(w.status(2),'complete');
 change(2,{product:'Beans',headline:''});w.assess(['valid','invalid','valid','valid']);assert.equal(w.status(2),'pending');
});
test('S9: valid edits revoke confirmation while retaining automatic green',async()=>{
 const{w,change}=await fixture();w.proceed(w.token());change(1,{photo:2});assert.equal(w.status(1),'complete');assert.equal(w.confirmed(1),false);
});
test('E1/E2: defaults stay pending; meaningful design decisions qualify; Continue accepts defaults',async()=>{
 const{w,change}=await fixture();assert.equal(w.status(3),'pending');change(3,{design:'manual'});assert.equal(w.status(3),'complete');assert.equal(w.confirmed(3),false);
 const other=await fixture();other.w.proceed(other.w.token());other.w.navigate(2);other.w.assess(Array(4).fill('valid'));other.w.proceed(other.w.token());other.w.navigate(3);
 assert.equal(other.w.status(3),'pending');assert(other.w.proceed(other.w.token()));assert(other.w.confirmed(3));
});
test('E3/E4: optional edits and partial required evidence cannot accept untouched defaults',async()=>{
 const{w,change}=await fixture();change(1,{photo:1},{keys:[],optional:true});assert.equal(w.status(1),'pending');
 change(2,{product:'System name',headline:'System headline'},{source:'system'});w.assess(Array(4).fill('valid'));
 change(2,{product:'User name',headline:'System headline'},{keys:['product']});assert.equal(w.status(2),'pending');
});
test('E5/E6: system/restored defaults cannot create evidence; optional events cannot claim late defaults',async()=>{
 for(const source of ['system','restored']){const{w,change}=await fixture();change(3,{design:source},{source});assert.equal(w.status(3),'pending');}
 const{w,change}=await fixture();change(2,{product:'Late',headline:'Late'},{keys:[],optional:true});w.assess(Array(4).fill('valid'));assert.equal(w.status(2),'pending');
 change(3,{design:'user category + derived layout'});assert.equal(w.status(3),'complete');change(3,{design:'late default'},{source:'system'});assert.equal(w.status(3),'pending');
});
test('E7/E8: No CTA qualifies; Custom CTA needs evidence for choice and text',async()=>{
 const{w,change}=await fixture();change(4,{choice:'none'});assert.equal(w.status(4),'complete');assert.equal(w.confirmed(4),false);
 change(4,{choice:'custom',text:''},{keys:['choice']});w.assess(['valid','invalid','valid','invalid']);assert.equal(w.status(4),'pending');
 change(4,{choice:'custom',text:'System suggestion'},{source:'system'});w.assess(Array(4).fill('valid'));assert.equal(w.status(4),'pending');
 change(4,{choice:'custom',text:'Contact us'},{keys:['text']});assert.equal(w.status(4),'complete');
});
test('R1–R3: exact confirmed values/assets restore confirmation only when valid and ready',async()=>{
 const{w,change}=await fixture();w.proceed(w.token());change(1,{photo:2});assert.equal(w.confirmed(1),false);
 change(1,{photo:1});assert(w.confirmed(1));w.assess(['pending','invalid','valid','valid']);assert.equal(w.confirmed(1),false);assert.equal(w.status(1),'pending');
 w.assess(['invalid','invalid','valid','valid']);assert.equal(w.confirmed(1),false);w.assess(['valid','invalid','valid','valid']);assert(w.confirmed(1));
});
test('R4/A5: reset discards evidence, confirmations, access and old account tickets',async()=>{
 const{w,facts,signatures}=await fixture();w.proceed(w.token());const old=w.token();w.attempt();w.reset(signatures(),facts);w.assess(Array(4).fill('valid'));
 assert.equal(w.position().highestReached,1);assert.equal(w.confirmed(1),false);assert.equal(w.status(1),'pending');assert.equal(w.current(old),false);
});
test('A1: retained photo and visual preserve their deliberate selection evidence',async()=>{
 const{w,change}=await fixture();change(1,{visual:'food'});change(1,{photo:2});w.proceed(w.token());change(1,{visual:'food'},{keys:[]});assert.equal(w.status(1),'complete');assert.equal(w.confirmed(1),false);
});
test('A2/A3: pending departure resolves only after asset checks settle',async()=>{
 for(const result of ['valid','invalid']){const{w}=await fixture();w.proceed(w.token());w.navigate(2);w.assess(['pending','invalid','valid','valid']);w.navigate(1);w.navigate(2);
  assert.equal(w.status(1),'pending');w.assess([result,'invalid','valid','valid']);assert.equal(w.status(1),result==='invalid'?'incomplete':'complete');}
});
test('A4: stale mutation, confirmation and progression tickets are rejected',async()=>{
 const{w,change}=await fixture(),old=w.token();change(1,{photo:2});assert.equal(w.confirm([1],[true,true,true,true],old),false);assert.equal(w.proceed(old),false);
 assert.equal(change(1,{photo:3},{source:'restored',ticket:old}),false);w.reset();assert.equal(w.proceed(old),false);
});
test('A4/R3: material revisions require fresh validation; stale assessment cannot restore or confirm them',async()=>{
 const{w,facts,signatures}=await fixture();w.proceed(w.token());const old=w.token();facts[0]={photo:2};
 w.sync(signatures(),'user',[1],undefined,{requirements:facts,evidence:{1:['photo']}});
 assert.equal(w.status(1),'pending');assert.equal(w.confirm([1],[true,true,true,true],w.token()),false);
 assert.equal(w.assess(Array(4).fill('valid'),old),false);assert.equal(w.confirmed(1),false);
 assert(w.assess(Array(4).fill('valid'),w.token()));assert.equal(w.status(1),'complete');assert.equal(w.confirmed(1),false);
});
test('Continue content rejection clears on correction; later typing is gray and invalid Continue is orange',async()=>{
 const{w,change}=await fixture(),error=JSON.stringify(['blockedClaims','bHeadline']);
 w.proceed(w.token());w.navigate(2);change(2,{product:'Beans',headline:'guaranteed profit'});
 w.assess(['valid','invalid','valid','valid'],undefined,[null,error]);assert(w.rejectContent(2,error,w.token()));assert.equal(w.proceed(w.token()),false);
 assert.equal(w.status(2),'invalid');assert.equal(w.view(2).attempted,false);
 change(2,{product:'Beans',headline:'Fresh roast'});w.assess(Array(4).fill('valid'));
 assert.equal(w.status(2),'complete');assert.equal(w.view(2).continueError,null);assert.equal(w.confirmed(2),false);
 change(2,{product:'Beans',headline:''});w.assess(['valid','invalid','valid','valid']);assert.equal(w.status(2),'pending');
 assert.equal(w.proceed(w.token()),false);assert.equal(w.status(2),'incomplete');assert.equal(w.accessible(3),false);assert.equal(w.view(2).attempted,false);
});
test('Continue red belongs to its current field/reason; unrelated edits retain it and stale rejection tickets cannot restore it',async()=>{
 const{w,change,facts,signatures}=await fixture(),headline=JSON.stringify(['blockedClaims','bHeadline']),product=JSON.stringify(['blockedClaims','bProduct']);
 w.proceed(w.token());w.navigate(2);change(2,{product:'Beans',headline:'guaranteed profit'});
 w.assess(['valid','invalid','valid','valid'],undefined,[null,headline]);w.rejectContent(2,headline,w.token());w.proceed(w.token());
 const stale=w.token(),next=signatures();next[1]+='|optional price changed';w.sync(next,'user',[2],undefined,{requirements:facts});
 w.assess(['valid','invalid','valid','valid'],undefined,[null,headline]);assert.equal(w.status(2),'invalid');
 w.assess(['valid','invalid','valid','valid'],undefined,[null,product]);assert.equal(w.view(2).continueError,null);assert.equal(w.status(2),'incomplete');
 assert.equal(w.rejectContent(2,headline,stale),false);assert.equal(w.rejectContent(1,headline,w.token()),false);assert.equal(w.view(2).attempted,false);
 w.reset();assert.equal(w.view(2).continueError,null);
});
test('Generate history survives resolution of a separately owned Continue content error',async()=>{
 const{w,change}=await fixture(),error=JSON.stringify(['blockedClaims','bHeadline']);
 w.proceed(w.token());w.navigate(2);w.attempt();change(2,{product:'Beans',headline:'guaranteed profit'});
 w.assess(['valid','invalid','valid','valid'],undefined,[null,error]);w.rejectContent(2,error,w.token());assert.equal(w.status(2),'invalid');
 change(2,{product:'Beans',headline:'Fresh roast'});w.assess(Array(4).fill('valid'));
 assert.equal(w.status(2),'complete');assert.equal(w.view(2).continueError,null);assert.equal(w.view(2).attempted,true);
 change(2,{product:'Beans',headline:''});w.assess(['valid','invalid','valid','valid']);assert.equal(w.status(2),'invalid');
 assert.equal(w.proceed(w.token()),false);assert.equal(w.status(2),'invalid');
});
test('V3/V4: final validation retains red ownership; valid correction never fabricates confirmation',async()=>{
 const{w,change}=await fixture();w.attempt();assert.equal(w.status(2),'invalid');assert.equal(w.status(3),'pending');
 change(2,{product:'Beans',headline:'Fresh'});w.assess(Array(4).fill('valid'));assert.equal(w.status(2),'complete');assert.equal(w.confirmed(2),false);
 w.assess(['valid','invalid','valid','valid']);assert.equal(w.status(2),'invalid');
});
test('V6: final all-step acceptance does not itself unlock navigation',async()=>{
 const{w}=await fixture();w.assess(Array(4).fill('valid'));assert(w.confirm([1,2,3,4],[true,true,true,true],w.token()));
 for(const at of [1,2,3,4])assert(w.confirmed(at));assert.equal(w.position().highestReached,1);
});
test('views are immutable and unrecognized provenance is rejected',async()=>{
 const{w}=await fixture();assert.throws(()=>w.sync([],'focus'));assert(Object.isFrozen(w.view(1).evidence));assert(Object.isFrozen(w.position()));
});
test('C1–C4: attention requires visibility, normal motion and readiness; unchanged revisions cannot replay',async()=>{
 const{createAttentionBudget}=await api(),a=createAttentionBudget(),base={step:3,epoch:1,revision:0,ready:true,visible:true,documentVisible:true,reducedMotion:false};
 for(const state of [{visible:false},{documentVisible:false},{reducedMotion:true},{ready:false}])assert.equal(a.claim({...base,...state}),false);
 assert(a.claim(base));assert.equal(a.claim(base),false);assert(a.claim({...base,revision:1}));
});
test('C4: attention history stays bounded and reset permits a new run',async()=>{
 const{createAttentionBudget}=await api(),a=createAttentionBudget(),base={epoch:1,revision:0,ready:true,visible:true,documentVisible:true,reducedMotion:false};
 assert(a.claim({...base,step:1}));for(let revision=0;revision<100;revision++)assert(a.claim({...base,step:2,revision}));
 assert.equal(a.claim({...base,step:1}),false);a.reset();assert(a.claim({...base,step:1}));assert.equal(a.claim({...base,step:5}),false);
});
