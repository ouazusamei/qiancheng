import {writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
const source=resolve(process.argv[2]||new URL('../source',import.meta.url).pathname),output=resolve(process.argv[3]||new URL('../results',import.meta.url).pathname);
const load=p=>import(pathToFileURL(resolve(source,p)));
const {initial,apply,summary,day,month}=await load('lib/domain.mjs');
const {profilePlan}=await load('lib/coach-agent.mjs');
const {profileArgs}=await load('public/coach-flow-ui.mjs');
const {coachScenario,routeBasis}=await load('public/engines/coach-scenario.mjs');
const {executionPlan,probabilityBand}=await load('public/engines/plan.mjs');
const {analyzeBills,billPlanPreview,instructionFor}=await load('public/engines/bill-analysis.mjs');
const {subscriptionEvidence}=await load('public/engines/subscriptions.mjs');
const {plan}=await load('lib/agent.mjs');
const {readStatement}=await load('public/engines/import.mjs');
const change=(s,t,a)=>apply(structuredClone(s),t,a).state;
const view=s=>({state:s,summary:summary(s)});
function fixture(kind='student',target=6000,months=12){let s=change(initial(),'goal',{target:String(target),months,name:'核验样本目标'});s=change(s,'guided_demo',{});const r=profilePlan(s,kind==='student'?'试试武汉在校生':'试试深圳职场新人',{});if(!r.interview?.ready)throw Error('scenario profile not ready');s=change(s,'coach',profileArgs(r.interview.draft));s.goal.id='audit-goal';return s;}
function forecast(s){const f=coachScenario(view(s));return {inputs:f.params,incomeYuan:f.band.income,livingBudgetYuan:Math.max(f.band.rigid,f.band.mid+f.band.leisure-f.params.expenseReduction),fixedResponsibilitiesYuan:f.band.rigid,monthlySurplusYuan:f.result.free,natural:{monthlySaveYuan:f.result.natural.save,...f.result.natural.sim},routes:f.result.plans.map((p,index)=>({index,name:p.name,monthlySaveYuan:p.save,bufferYuan:p.freeCap,probability:p.prob,probabilityPercent:p.prob*100,displayPercent:Math.round(p.prob*100),hits:p.prob*2000,terminalProbability:p.terminalProb,medianTerminalYuan:p.p50,p10TerminalYuan:p.p10,short:p.short,band:probabilityBand(p.prob).label})),startingCovered:f.result.startingCovered,identicalRoutes:f.result.identicalRoutes,sensitivity:f.result.sens.map(x=>({label:x.label,deltaPercentagePoints:x.delta,note:x.note}))};}
const goals=[];
for(const [id,kind,target,months,opening]of [['G01','student',5000,6],['G02','student',6000,12],['G03','student',3000,12,0],['G04','worker',40000,12],['G05','student',1000,6],['G06','student',12000,24]]){
 let s=fixture(kind,target,months);if(opening!==undefined){s.openingCents=opening*100;}const f=forecast(s),again=forecast(s);const leverPreviews=['save','target','months'].map(kind=>{const trial=coachScenario(view(s),{kind});return {kind,targetYuan:trial.params.goal,months:trial.params.months,naturalMonthlySaveYuan:trial.result.natural.save,naturalProbability:trial.result.natural.sim.prob,routes:trial.result.plans.map(p=>({name:p.name,monthlySaveYuan:p.save,probability:p.prob})),actualDeltaPercentagePoints:Math.round((trial.result.natural.sim.prob-f.natural.prob)*100)};});goals.push({id,scenario:kind,targetYuan:target,months,openingYuan:s.openingCents/100,deterministicRepeat:JSON.stringify(f)===JSON.stringify(again),...f,leverPreviews});
}
const bills=[];
for(const kind of ['student','worker']){
 let s=fixture(kind);const loaded=apply(structuredClone(s),'sample_bill',{});s=loaded.state;const report=analyzeBills(s,month()),evidence=subscriptionEvidence(s,month());const before=summary(s),sub=apply(structuredClone(s),'subscription',{name:evidence[0].name,status:'cancelled',period:month()});
 const chosen=change(s,'coach_route',{index:1,basis:routeBasis(s,summary(s).availableCents)});
 const budget=report.opportunities.map(op=>{const preview=billPlanPreview(view(chosen),month(),op.id,op.suggestedCents);return {id:op.id,title:op.title,count:op.count,evidenceYuan:op.cents/100,suggestedReductionYuan:op.suggestedCents/100,instruction:instructionFor(op,op.suggestedCents),preview};});
 const duplicate=report.pairs.map(x=>({merchant:x.merchant,amountYuan:x.cents/100,first:s.transactions.find(t=>t.id===x.firstId)?.time,second:s.transactions.find(t=>t.id===x.secondId)?.time}));
 const sample={id:kind==='student'?'B01':'B02',scenario:kind,period:month(),loadMessage:loaded.result.message,transactionCount:s.transactions.length,summary:before,report,subscriptionEvidence:evidence,budget,possibleDuplicatePairs:duplicate,duplicateMarkedCount:s.transactions.filter(t=>t.duplicateOf).length,subscriptionCancellation:{service:evidence[0].name,beforeCashCents:before.cashCents,afterCashCents:summary(sub.state).cashCents,beforeExpenseCents:report.totalCents,afterExpenseCents:analyzeBills(sub.state,month()).totalCents,message:sub.result.message,actualPlatformCallMade:false}};
 bills.push(sample);
}
let s=change(fixture(),'sample_bill',{});const before=summary(s),t=s.transactions.find(t=>t.id==='sample-loan');s=change(s,'link_loan',{id:t.id,name:'小王',amount:'100',kind:'垫付',dueDate:day(),dueType:'desired'});const afterLink=summary(s),c=s.cases.at(-1);s=change(s,'remind',{id:c.id,message:'虚构核验提醒',style:'gentle'});const afterRemind=summary(s);s=change(s,'repay',{id:c.id,amount:'40'});const afterPartial=summary(s);s=change(s,'repay',{id:c.id,amount:'60'});const afterFull=summary(s);
const people={id:'P01',kind:'100元既有流水关联垫付',initialTransactionYuan:t.cents/100,before,afterLink,afterRemind,afterPartial,afterFull,mailCount:s.mails.length,mailSimulated:s.mails[0]?.simulated,paidYuan:s.cases.at(-1).paid};
let aa=fixture();const aaBefore=summary(aa);aa=change(aa,'transfer',{name:'小李',amount:'100',kind:'AA',receivableAmount:'40',dueType:'none'});const aaAfter=summary(aa);
const imports=await readStatement(new File(['交易时间,交易对方,商品,收/支,金额,交易单号,交易类型\n2026-11-01 12:00:00,校园食堂,午餐,支出,12.00,AUDIT-01,商户消费\n2026-11-01 18:00:00,便利店,生活用品,支出,30.00,AUDIT-02,商户消费\n'],'audit.csv'));const once=apply(initial(),'import',{rows:imports.rows,source:'wechat'}),twice=apply(structuredClone(once.state),'import',{rows:imports.rows,source:'wechat'});
const intents=[];
for(const q of ['5000元六个月','5000，6个月','帮我推荐并预览一种储蓄方案','帮我预览一种储蓄方案']){const state=q.includes('方案')?fixture():initial();const r=await plan(state,q,q.includes('方案')?{}:{intent:'goal_details'},null,[],{page:'goal',goalScreen:q.includes('方案')?'routes':'steps'});intents.push({input:q,mode:r.mode,reply:r.reply,next:r.next||null,proposal:r.proposal,task:r.task||null});}
const payload={generatedAt:new Date().toISOString(),timezone:'Asia/Shanghai',asOf:day(),billPeriod:month(),unit:'所有字段名带Cents的值为分；Yuan为元；probability为0—1；deltaPercentagePoints为百分点',realModelUsed:false,goals,bills,people,aa:{id:'P02',totalPaymentYuan:100,otherShareYuan:40,before:aaBefore,after:aaAfter,transactionCount:aa.transactions.length,case:aa.cases[0]},importFixture:{id:'I01',synthetic:true,rows:imports.rows,first:once.result,second:twice.result,summary:summary(twice.state)},intents};
writeFileSync(resolve(output,'scenarios.json'),JSON.stringify(payload,null,2));console.log(JSON.stringify({goals:goals.map(x=>({id:x.id,target:x.targetYuan,months:x.months,natural:x.natural.prob,routes:x.routes.map(r=>({name:r.name,save:r.monthlySaveYuan,p:r.probabilityPercent}))})),bills:bills.map(x=>({id:x.id,rows:x.transactionCount,expense:x.report.totalCents/100,income:x.summary.incomeCents/100,cash:x.summary.cashCents/100,pending:x.report.pendingCents/100,subs:x.report.subscriptionCents/100,duplicates:x.possibleDuplicatePairs,cancellationMessage:x.subscriptionCancellation.message})),people},null,2));
