'use strict';
const form=document.getElementById('checkin'),result=document.getElementById('result');
const concerned=()=>[SCORECARD_DATA.questions.find(q=>q.id==='q7').options[2],SCORECARD_DATA.questions.find(q=>q.id==='q7').options[3]].includes(form.querySelector('input[name=q7]:checked')?.value);
function updateBranches(){
 document.getElementById('q7b').hidden=!concerned();
 if(!concerned())form.querySelectorAll('input[name=q7b]').forEach(i=>i.checked=false);
 const other=[...form.querySelectorAll('input[name=q2]:checked')].some(i=>i.value==='Something else');
 document.getElementById('other-wrap').hidden=!other;if(!other)document.getElementById('other').value='';
}
function answers(){const a={};for(const q of SCORECARD_DATA.questions){a[q.id]=q.id==='q6'?Number(form.querySelector('select[name=q6]').value):q.max>1?[...form.querySelectorAll(`input[name=${q.id}]:checked`)].map(i=>i.value):form.querySelector(`input[name=${q.id}]:checked`)?.value||'';}if(!concerned())a.q7b=[];return a;}
function clearErrors(){document.querySelectorAll('.error').forEach(e=>e.textContent='');}
form.addEventListener('change',e=>{
 result.hidden=true;clearErrors();const q=SCORECARD_DATA.questions.find(q=>q.id===e.target.name);
 if(q?.max>1&&form.querySelectorAll(`input[name=${q.id}]:checked`).length>q.max){e.target.checked=false;document.getElementById(q.id+'-error').textContent=`Please choose no more than ${q.max}.`;}
 updateBranches();
});
form.addEventListener('input',()=>result.hidden=true);
form.addEventListener('submit',e=>{
 e.preventDefault();clearErrors();const a=answers();let first;
 for(const q of SCORECARD_DATA.questions){if(q.id==='q7b')continue;if(!(Array.isArray(a[q.id])?a[q.id].length:a[q.id])){document.getElementById(q.id+'-error').textContent='Please choose an answer before continuing.';first=first||document.getElementById(q.id);}}
 if(first){document.getElementById('form-error').textContent='Please complete the highlighted questions.';first.querySelector('input,select').focus();return;}
 const r=routeResult(a),copy=SCORECARD_DATA.results[r.primary];
 const node=(tag,text)=>{const e=document.createElement(tag);e.textContent=text;return e;};
 result.replaceChildren();const h=node('h2',copy.label);h.id='result-title';result.append(h,node('p','Based on what you chose, this may be a useful place to begin. This is a suggestion, not a grade or diagnosis.'));
 if(a.q3.length)result.append(node('p','One thing worth protecting: '+a.q3.join('; ')+'.'));
 const adapt=t=>r.variant==='employee'?t.replace(/your practice/g,'your work setting').replace(/this practice/g,'this work setting').replace(/the practice/g,'the work setting'):t;
 result.append(node('h3',adapt(copy.headline)),node('p',adapt(copy.text)),node('h3','One small action to try'),node('p',adapt(copy.action)));
 if(r.secondary)result.append(node('p','Also worth noticing: '+SCORECARD_DATA.results[r.secondary].label+'. Your answers point to more than one useful starting place.'));
 if(r.no_support_now)result.append(node('p','You said you are not looking for support right now. You can use this suggestion on your own; no follow-up is requested.'));
 result.append(node('p','For this review: does this fit the situation you had in mind? The downloadable worksheets are still being prepared. No contact details are requested or saved.'));
 const finish=node('button','Finish without follow-up');finish.type='button';finish.addEventListener('click',()=>{form.reset();updateBranches();result.replaceChildren(node('h2','Finished — no follow-up'),node('p','Your answers have been cleared. Nothing was sent or saved.'));});
 result.append(finish);result.hidden=false;result.focus();result.scrollIntoView({behavior:'smooth',block:'start'});
});
document.getElementById('clear').addEventListener('click',()=>{form.reset();clearErrors();updateBranches();result.hidden=true;document.getElementById('other').value='';});
document.getElementById('load-example').addEventListener('click',()=>{
 const a=SCORECARD_DATA.examples[Number(document.getElementById('example').value)].answers;form.reset();clearErrors();result.hidden=true;
 for(const q of SCORECARD_DATA.questions){if(q.id==='q6')form.querySelector('select[name=q6]').value=a.q6;else form.querySelectorAll(`input[name=${q.id}]`).forEach(i=>i.checked=Array.isArray(a[q.id])?a[q.id].includes(i.value):a[q.id]===i.value);}
 updateBranches();document.getElementById('q1').scrollIntoView({behavior:'smooth'});
});
updateBranches();
