'use strict';
const DATA=typeof SCORECARD_DATA!=='undefined'?SCORECARD_DATA:require('./scorecard-data.js');
function routeResult(a){
 const T=DATA.tables,R=T.ROUTES,scores={},anchors={},support=new Set(),q45=new Set(),flags=[];
 for(const r of R){scores[r]=0;anchors[r]=new Set();}
 function add(r,p,anchor,is45=false){scores[r]+=p;anchors[r].add(anchor);if(is45)q45.add(r);}
 const has=(q,x)=>a[q].includes(x),any=(q,x)=>x.some(y=>has(q,y));
 const variant=['owner_or_independent','owner_or_independent','employee','mixed','paused','start_restart','other'][DATA.questions[0].options.indexOf(a.q1)]||'other';
 const workload=DATA.questions.find(q=>q.id==='q4').options,stance=DATA.questions.find(q=>q.id==='q7').options;
 if(variant==='paused')add('decide',4,'Q1 stage');else if(variant==='start_restart')add('decide',5,'Q1 stage');
 if(has('q2','I was focused on learning the work and did not have a clear business picture yet'))add('decide',2,'Q2 original picture');
 if(has('q2','A close, personal practice that stays intentionally small')&&a.q6>=7)add('protect',1,'Q2 aspiration');
 if(has('q2','A dependable livelihood')&&([workload[0],workload[4]].includes(a.q4)||any('q5',['Finding or retaining the right clients','Income consistency, pricing, or financial clarity'])))add('steady',1,'Q2 aspiration');
 if(any('q2',['More freedom or control over my time','A pace my body could sustain','Work I could balance with family or other responsibilities'])&&any('q5',['Scheduling, follow-up, paperwork, payment, or claims','Physical capacity, boundaries, or recovery']))add('lighten',1,'Q2 aspiration');
 if(has('q2','Meaningful work that helps people or serves my community')&&has('q5','Staying connected to why I began')&&a.q6<=6)add('decide',1,'Q2 aspiration');
 if(has('q3','I am still trying to identify that'))add('decide',2,'Q3 unclear strength');else if(a.q3.length)add('protect',1,'Q3 strength');
 for(const [r,p] of T.q4_rules[a.q4]||[])add(r,p,'Q4 workload',true);
 for(const x of a.q5)for(const [r,p] of T.q5_rules[x]||[])add(r,p,'Q5 pressure',true);
 if(a.q6>=1&&a.q6<=3)add('decide',3,'Q6 alignment');else if(a.q6<=6&&a.q6>=4)add('decide',2,'Q6 alignment');else if(a.q6>=8&&a.q6<=10)add('protect',3,'Q6 alignment');
 if(a.q7===stance[0])add('protect',5,'Q7 future stance');else if(a.q7===stance[1])add('protect',1,'Q7 future stance');
 else if([stance[2],stance[3]].includes(a.q7)){for(const r of [...q45].sort())add(r,a.q7===stance[2]?1:2,'Q7 consequence');if(a.q7===stance[3])add('decide',1,'Q7 change');}
 else if(a.q7===stance[4])add('decide',5,'Q7 stage');
 for(const x of a.q7b)for(const [r,p] of T.q7b_rules[x]||[])add(r,p,'Q7b protection');
 for(const x of a.q8)for(const [r,p] of T.q8_rules[x]||[]){add(r,p,'Q8 requested support');support.add(r);}
 const noSupport=has('q8','I am not looking for support right now');if(noSupport&&a.q8.length>1)flags.push('mixed support');
 const hardStage=['paused','start_restart'].includes(variant)&&(a.q4===workload[5]||a.q7===stance[4]);
 const protectEligible=!(a.q4===workload[3]||a.q7===stance[3])&&(a.q7===stance[0]||(a.q6>=8&&[workload[1],workload[2]].includes(a.q4))||(a.q6>=7&&a.q7===stance[1]&&![workload[3],workload[4],workload[5]].includes(a.q4)));
 const stable=![workload[0],workload[4],workload[3],workload[5]].includes(a.q4)&&((!hardStage&&[workload[1],workload[2]].includes(a.q4)&&[stance[0],stance[1]].includes(a.q7))||(!hardStage&&a.q6>=7&&![stance[2],stance[3],stance[4]].includes(a.q7)));
 const optionsEligible=stable&&(support.has('options')||(has('q5','Doing everything alone or not knowing which option fits')&&a.q6>=7));
 let candidates=[...R],primary;
 if(hardStage)primary='decide';else{
  candidates=candidates.filter(r=>(r!=='protect'||protectEligible)&&(r!=='options'||optionsEligible));
  const top=Math.max(...candidates.map(r=>scores[r]));let tied=candidates.filter(r=>scores[r]===top);
  if(tied.length>1){
   for(const evidence of [support,new Set(tied.filter(r=>anchors[r].has('Q5 pressure'))),new Set(tied.filter(r=>anchors[r].has('Q4 workload'))),new Set(tied.filter(r=>anchors[r].has('Q7 consequence')||anchors[r].has('Q7b protection'))) ]){
    const narrowed=tied.filter(r=>evidence.has(r));if(narrowed.length===1){tied=narrowed;break;}if(narrowed.length>1)tied=narrowed;
   }
   if(tied.length>1&&['paused','start_restart'].includes(variant)&&tied.includes('decide'))tied=['decide'];
   if(tied.length>1){primary=T.FALLBACK_ORDER.find(r=>tied.includes(r));flags.push('final tie');}else primary=tied[0];
  }else primary=tied[0];
 }
 const runner=candidates.filter(r=>r!==primary).sort((x,y)=>scores[y]-scores[x]||R.indexOf(x)-R.indexOf(y))[0];
 const margin=scores[primary]-(runner?scores[runner]:0);
 if((a.q6>=8&&a.q7===stance[3])||(a.q6<=3&&a.q7===stance[0]))flags.push('alignment conflict');
 if(runner&&margin<=2&&anchors[primary].size>=2&&anchors[runner].size>=2)flags.push('close signals');
 const confidence=hardStage?'stage-rule':margin>=4&&anchors[primary].size>=2&&!flags.length?'high':margin<=1||flags.length||anchors[primary].size===1?'low':'moderate';
 return {primary,secondary:confidence==='low'&&runner&&scores[runner]>0?runner:null,confidence,variant,no_support_now:noSupport,scores};
}
if(typeof module!=='undefined')module.exports=routeResult;
