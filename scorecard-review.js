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
 if(!document.getElementById('person-name').value.trim()){document.getElementById('welcome-error').textContent='Who should we address this to? Add your name, or a made-up name for this review.';first=document.getElementById('welcome');}
 for(const q of SCORECARD_DATA.questions){if(q.id==='q7b')continue;if(!(Array.isArray(a[q.id])?a[q.id].length:a[q.id])){document.getElementById(q.id+'-error').textContent='Please choose an answer before continuing.';first=first||document.getElementById(q.id);}}
 if(first){document.getElementById('form-error').textContent='Please complete the highlighted questions.';first.querySelector('input,select').focus();return;}
 const r=routeResult(a),copy=SCORECARD_DATA.results[r.primary];
 const node=(tag,text)=>{const e=document.createElement(tag);e.textContent=text;return e;};
 result.replaceChildren();const practice=document.getElementById('practice-name').value.trim();if(practice)result.append(node('p','For '+practice));const h=node('h2',copy.label);h.id='result-title';result.append(h,node('p','Based on what you chose, this may be a useful place to begin. This is a suggestion, not a grade or diagnosis.'));
 if(a.q3.length)result.append(node('p','One thing worth protecting: '+a.q3.join('; ')+'.'));
 const adapt=t=>r.variant==='employee'?t.replace(/your practice/g,'your work setting').replace(/this practice/g,'this work setting').replace(/the practice/g,'the work setting'):t;
 result.append(node('h3',adapt(copy.headline)),node('p',adapt(copy.text)),node('h3','One small action to try'),node('p',adapt(copy.action)));
 if(r.secondary)result.append(node('p','Also worth noticing: '+SCORECARD_DATA.results[r.secondary].label+'. Your answers point to more than one useful starting place.'));
 const name=document.getElementById('person-name').value.trim();
 result.append(node('h3',name?`${name}, what would you like to change?`:'What would you like to change?'),node('p','If something here is worth working on, let’s talk through one practical next move for your practice or work setting.'));
 if(r.no_support_now)result.append(node('p','You said you are not looking for support right now. If you change your mind, the invitation below is here for you.'));
 const help=node('button','Help me take the next step');help.type='button';help.id='help-next-step';
 const contact=node('div','');contact.id='contact-preview';contact.hidden=true;
 contact.innerHTML='<h3>How can we reach you?</h3><p>Ask Provider Solutions to contact you about the next step you identified. This is not a signup for general marketing.</p><p class="small"><strong>Review only:</strong> use a made-up email. Nothing is sent, saved, or booked here.</p><label for="contact-email">Your email</label><input class="text-input" type="email" id="contact-email" placeholder="Your email" autocomplete="off"><label class="choice"><input type="checkbox" id="contact-permission"><span>I would like Provider Solutions to contact me about my check-in and possible next steps.</span></label><button type="button" id="preview-request">Preview my request</button><p class="error" id="contact-error" role="alert"></p><p id="contact-confirmation" aria-live="polite"></p>';
 help.addEventListener('click',()=>{contact.hidden=false;document.getElementById('contact-email').focus();});
 result.append(help,contact,node('p','The worksheets are still being prepared. You can review the result without requesting contact.'));
 contact.querySelector('#preview-request').addEventListener('click',()=>{const email=contact.querySelector('#contact-email'),permission=contact.querySelector('#contact-permission');contact.querySelector('#contact-error').textContent='';contact.querySelector('#contact-confirmation').textContent='';if(!email.value.trim()||!email.checkValidity()){contact.querySelector('#contact-error').textContent='Please enter a valid example email.';email.focus();return;}if(!permission.checked){contact.querySelector('#contact-error').textContent='Please confirm that you want to be contacted.';permission.focus();return;}contact.querySelector('#contact-confirmation').textContent='This is how your request would finish. In the live version, your details would go to the agreed response owner. This preview has not sent anything or arranged a conversation.';});
 result.hidden=false;result.focus();result.scrollIntoView({behavior:'smooth',block:'start'});
});
document.getElementById('clear').addEventListener('click',()=>{form.reset();clearErrors();updateBranches();result.hidden=true;result.replaceChildren();document.getElementById('other').value='';});
document.getElementById('load-example').addEventListener('click',()=>{
 const a=SCORECARD_DATA.examples[Number(document.getElementById('example').value)].answers;form.reset();clearErrors();result.hidden=true;result.replaceChildren();document.getElementById('person-name').value='Alex (example)';document.getElementById('practice-name').value='Example practice';
 for(const q of SCORECARD_DATA.questions){if(q.id==='q6')form.querySelector('select[name=q6]').value=a.q6;else form.querySelectorAll(`input[name=${q.id}]`).forEach(i=>i.checked=Array.isArray(a[q.id])?a[q.id].includes(i.value):a[q.id]===i.value);}
 updateBranches();document.getElementById('q1').scrollIntoView({behavior:'smooth'});
});
updateBranches();
