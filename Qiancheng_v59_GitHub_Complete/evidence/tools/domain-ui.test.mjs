import {test,before,after} from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {readFileSync,mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {pathToFileURL,fileURLToPath} from 'node:url';
const sourceRoot=resolve(process.env.QC_SOURCE_ROOT||fileURLToPath(new URL('../qiancheng-v59/',import.meta.url)));
const appUrl=pathToFileURL(join(sourceRoot,'public/app.mjs'));
import vm from 'node:vm';
let server,url,cookie,context,ui,original,originalMessages;
const dir=mkdtempSync(join(tmpdir(),'qiancheng-ui-'));
const events=new Map(),requests=[],nodes=new Map();
let failAnalysis=false;
const csv='交易时间,交易对方,商品,收/支,金额,交易单号,交易类型\n2026-10-03 12:00:00,蜜雪冰城,饮品,支出,12.00,U1,商户消费\n2026-10-04 19:00:00,电影院,电影,支出,40.00,U2,商户消费\n';
function node(sel){if(!nodes.has(sel))nodes.set(sel,{value:'',textContent:'',style:{},innerHTML:'',open:false,disabled:false,classList:{toggle(){}},close(){this.open=false;},addEventListener(){},querySelector(){return null;},querySelectorAll(){return[];},scrollIntoView(){},focus(){}});return nodes.get(sel);}
const document={hidden:false,activeElement:null,querySelector:sel=>node(sel),querySelectorAll:()=>[],documentElement:{style:{setProperty(){},getPropertyValue(){return'';}},classList:{toggle(){}}},addEventListener(name,fn){if(!events.has(name))events.set(name,[]);events.get(name).push(fn);}};
async function frontFetch(path,opt={}){requests.push(path);if(path==='/api/bill-analysis'&&failAnalysis){failAnalysis=false;return{ok:false,json:async()=>({error:'测试分析暂时不可用'})};}return fetch(url+path,{...opt,headers:{...opt.headers,cookie}});}
async function raw(path,body,d){const r=await fetch(url+'/api/'+path,{method:'POST',headers:{cookie,'Content-Type':'application/json','X-CSRF-Token':d.csrf,'X-QC-Workspace':d.workspace.active},body:JSON.stringify(body)});const j=await r.json();assert.equal(r.status,200,JSON.stringify(j));return j;}
async function load(){return(await fetch(url+'/api/state',{headers:{cookie}})).json();}
async function save(type,args,d){const p=await raw('prepare',{type,args},d);await raw('commit',{id:p.id,confirm:true},d);return load();}
before(async()=>{
 server=spawn(process.execPath,['server.mjs','--port','0'],{cwd:sourceRoot,env:{...process.env,DATA_DIR:dir,BIGMODEL_API_KEY:'',BIGMODEL_MODEL:''},stdio:['ignore','pipe','pipe']});
 url=await new Promise((resolve,reject)=>{server.stdout.on('data',b=>{const m=String(b).match(/localhost:(\d+)/);if(m)resolve('http://127.0.0.1:'+m[1]);});server.once('error',reject);});
 const r=await fetch(url+'/api/guest',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'});cookie=r.headers.get('set-cookie').split(';')[0];let d=await load();
 d=await save('profile',{opening:'1000',income:'2000',expense:'1000',emergency:'0'},d);d=await save('import',{source:'wechat',rows:[{date:'2026-11-01',time:'12:00:00',merchant:'食堂',desc:'午餐',amount:'10',direction:'out',externalId:'real-ui'}]},d);original=structuredClone(d.state);
 let source=readFileSync(appUrl,'utf8');const imports={};
 for(const m of source.matchAll(/^import \{([^}]+)\} from '([^']+)';$/gm)){Object.assign(imports,await import(new URL(m[2],appUrl)));}
 source=source.replace(/^import .*;\n/gm,'').replace(/^api\('state'\)\.then.*;$/m,'');
 context=vm.createContext({...imports,document,window:{matchMedia:()=>({matches:false,addEventListener(){}}),innerHeight:900,addEventListener(){}},structuredClone,File,FormData,Date,console,fetch:frontFetch,setTimeout:()=>0,clearTimeout(){},setInterval(){},localStorage:{setItem(){}}});
 vm.runInContext(source+`\nrender=()=>{};dialogSnapshot=()=>null;showDialog=(html,remember=true)=>{const d=$('#dialog');d.innerHTML=html;d.open=true;};\nglobalThis.ui={prepare,setWeekly(d){weeklyDraft=d;},refresh,act,commitPending,followRecommendation,sendChatInput,switchBillWorkspace,seed(d){data=d;page='debts';billSourceChosen=true;messages=[{who:'user',text:'原聊天：请继续模拟计划'}];agentContext={intent:'goal_details',target:6000,months:6};goalEditDraft={name:'原草稿',target:'8888',months:8};},get(){return {data,peoplePanel,weeklyDraft,page,messages,agentContext,goalEditDraft,period,pending,importReturn,importBusy,workspaceDrafts,currentRecommendation:currentRecommendation()};}};`,context);
 ui=context.ui;ui.seed(d);node('#chatForm textarea').value='尚未发送的原草稿';node('#importSource').value='wechat';originalMessages=structuredClone(ui.get().messages);
});
after(()=>{server?.kill();rmSync(dir,{recursive:true,force:true});});
let realScope,simScope;
test('真实账单中发起模拟转账沿用原确认窗口，预览不换域',async()=>{realScope=ui.get().data.workspace.active;await ui.prepare('transfer',{name:'小王',amount:'100',kind:'垫付',dueType:'none'});assert.equal(ui.get().pending.isolated,true);assert.equal(ui.get().data.workspace.active,realScope);assert.equal(ui.get().data.summary.cashCents,99000);assert.match(ui.get().peoplePanel.html,/原真实账单会保留/);assert.equal((ui.get().peoplePanel.html.match(/data-form="commit"/g)||[]).length,1);assert.equal(node('#dialog').open,false);});
test('原确认成功后模拟页接续往来，不新增登录、注册或额外确认',async()=>{ui.setWeekly({note:'未提交的周草稿'});const n=requests.filter(x=>x==='/api/commit').length;await Promise.all([ui.commitPending(),ui.commitPending()]);simScope=ui.get().data.workspace.active;assert.notEqual(simScope,realScope);assert.equal(ui.get().data.summary.cashCents,89000);assert.equal(ui.get().page,'debts');assert.equal(requests.filter(x=>x==='/api/commit').length,n+1);assert.equal(ui.get().pending,null);});
test('复用返回真实账单入口，恢复原聊天、草稿和业务，不重新准备已完成模拟操作',async()=>{const n=requests.filter(x=>x==='/api/prepare').length;await ui.switchBillWorkspace(realScope);assert.equal(ui.get().data.summary.cashCents,99000);assert.deepEqual(ui.get().data.state,original);assert.deepEqual(ui.get().messages,originalMessages);assert.equal(ui.get().goalEditDraft.name,'原草稿');assert.equal(ui.get().weeklyDraft.note,'未提交的周草稿');assert.equal(node('#chatForm textarea').value,'尚未发送的原草稿');assert.equal(ui.get().pending,null);assert.equal(ui.get().peoplePanel,null);assert.equal(requests.filter(x=>x==='/api/prepare').length,n);});
test('模拟往来结果在返回后仍可找回，部分还款继续原任务',async()=>{await ui.switchBillWorkspace(simScope);assert.equal(ui.get().data.summary.receivableCents,10000);const c=ui.get().data.state.cases[0];await ui.prepare('repay',{id:c.id,amount:'40'});await ui.commitPending();assert.equal(ui.get().data.summary.cashCents,93000);assert.equal(ui.get().data.summary.receivableCents,6000);assert.equal(ui.get().agentContext.intent,'people_date');});
