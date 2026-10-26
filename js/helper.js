/* Rule-based, role-aware Smart Helper. Answers only from local app data. */
(function(global){
  'use strict'; const H=global.HCM;
  function answer(question,user) {
    const q=String(question||'').toLowerCase(), today=H.today(), records=H.attendance(), leaves=H.leaves(), users=H.users(), company=H.company();
    const ownAttendance=records.filter(a=>a.employeeId===user.id), ownLeaves=leaves.filter(l=>l.employeeId===user.id);
    if(user.role==='admin') {
      if(q.includes('employee')||q.includes('staff')||q.includes('headcount')) return `There are ${users.filter(u=>u.role==='employee').length} employee account(s) in ${company.name||'your company'}.`;
      if(q.includes('leave')&&q.includes('today')) {const on=leaves.filter(l=>l.status==='Approved'&&l.from<=today&&l.to>=today);return on.length?`On leave today (${on.length}): ${on.map(l=>(users.find(u=>u.id===l.employeeId)||{}).name||'Unknown').join(', ')}.`:'No approved leave requests cover today.';}
      if(q.includes('late')&&q.includes('today')) {const late=records.filter(a=>a.date===today&&a.status==='Late');return late.length?`Late today (${late.length}): ${late.map(a=>(users.find(u=>u.id===a.employeeId)||{}).name||'Unknown').join(', ')}.`:'No late attendance records today.';}
      if(q.includes('pending')||q.includes('request')) return `${leaves.filter(l=>l.status==='Pending').length} leave request(s) are pending review.`;
      if(q.includes('present')&&q.includes('today')) return `${records.filter(a=>a.date===today&&['Present','Late'].includes(a.status)).length} employee(s) have checked in today.`;
      if(q.includes('attendance')) return `${records.filter(a=>a.date===today).length} attendance record(s) exist for today.`;
      if(q.includes('salary')||q.includes('payroll')) return `There are ${users.filter(u=>u.role==='employee').length} employee account(s). Open Payslip to calculate a monthly net salary using attendance records.`;
      return 'Try asking: “How many employees do we have?”, “Who is on leave today?”, “Who was late today?”, or “How many leave requests are pending?”';
    }
    if(q.includes('leave')||q.includes('balance')||q.includes('quota')) return `You have ${HCMLeave.remaining(user.id)} approved leave day(s) remaining out of ${Number(company.leaveQuota||20)} yearly day(s).`;
    if(q.includes('late')) {const r=ownAttendance.find(a=>a.date===today);return r?`Today your status is ${r.status}${r.checkIn?`, check-in ${r.checkIn}`:''}.`:'You have no check-in record for today.';}
    if(q.includes('hour')||q.includes('worked')||q.includes('week')) {const since=new Date();since.setDate(since.getDate()-6);const start=`${since.getFullYear()}-${String(since.getMonth()+1).padStart(2,'0')}-${String(since.getDate()).padStart(2,'0')}`;const hours=ownAttendance.filter(a=>a.date>=start&&a.date<=today).reduce((s,a)=>s+Number(a.hours||0),0);return `You have ${hours.toFixed(2)} recorded work hour(s) in the last 7 calendar days. Hours count after check-out.`;}
    if(q.includes('attendance')||q.includes('check')) {const r=ownAttendance.find(a=>a.date===today);return r?`Today: ${r.status}, check-in ${r.checkIn||'—'}, check-out ${r.checkOut||'not checked out'}.`:'No attendance record found for today.';}
    if(q.includes('pending')) return `You have ${ownLeaves.filter(l=>l.status==='Pending').length} pending leave request(s).`;
    return 'Try asking: “How many leaves do I have left?”, “Was I late today?”, or “How many hours did I work this week?”';
  }
  function mount(user) {
    if(document.querySelector('.chat-launch'))return;
    const launch=document.createElement('button');launch.className='chat-launch';launch.textContent='✦';launch.title='Open Smart Helper';launch.setAttribute('aria-label','Open Smart Helper');
    const box=document.createElement('section');box.className='chat-box';box.innerHTML=`<div class="chat-head"><div><strong>Smart Helper</strong><div class="muted" style="font-size:.75rem">Answers from your app data</div></div><button class="icon-btn" data-close aria-label="Close chat">×</button></div><div class="chat-log" aria-live="polite"><div class="chat-msg">Hi ${H.esc(user.name.split(' ')[0])}! Ask me about ${user.role==='admin'?'employees, attendance or leave requests':'your attendance or leave balance'}.</div></div><form class="chat-form"><input name="q" placeholder="Ask a question…" required aria-label="Ask Smart Helper"><button class="btn primary">Send</button></form>`;
    document.body.append(launch,box);launch.addEventListener('click',()=>box.classList.toggle('open'));box.querySelector('[data-close]').addEventListener('click',()=>box.classList.remove('open'));
    box.querySelector('form').addEventListener('submit',e=>{e.preventDefault();const input=box.querySelector('input'),q=input.value.trim();if(!q)return;const log=box.querySelector('.chat-log'),mine=document.createElement('div');mine.className='chat-msg me';mine.textContent=q;log.append(mine);const reply=document.createElement('div');reply.className='chat-msg';reply.textContent=answer(q,user);log.append(reply);input.value='';log.scrollTop=log.scrollHeight;});
  }
  global.HCMHelper={answer,mount};
})(window);
