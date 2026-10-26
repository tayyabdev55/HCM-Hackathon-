/* Leave workflow: weekday counting, quota and overlap validation. */
(function (global) {
  'use strict'; const H=global.HCM;
  function ownApprovedDays(employeeId, excludeId=null) { return H.leaves().filter(l=>l.employeeId===employeeId&&l.status==='Approved'&&l.id!==excludeId).reduce((s,l)=>s+Number(l.days||0),0); }
  function remaining(employeeId) { return Math.max(0,Number(H.company().leaveQuota||20)-ownApprovedDays(employeeId)); }
  function overlaps(employeeId, from, to, excludeId=null) { return H.leaves().some(l=>l.employeeId===employeeId&&l.status!=='Rejected'&&l.id!==excludeId&&from<=l.to&&to>=l.from); }
  function apply(employeeId, data) {
    if (!data.from||!data.to||data.from>data.to) throw new Error('Choose a valid date range (From must be on or before To).');
    const days=H.workingDaysBetween(data.from,data.to,H.company().workingDays);
    if (!days) throw new Error('The selected range contains no working days.');
    if (overlaps(employeeId,data.from,data.to)) throw new Error('This request overlaps an existing pending or approved leave.');
    if (days>remaining(employeeId)) throw new Error(`Only ${remaining(employeeId)} leave day(s) remain in your quota.`);
    const record={id:H.id(),employeeId,type:data.type||'Casual',from:data.from,to:data.to,days,reason:String(data.reason||'').trim(),status:'Pending',comment:'',createdAt:new Date().toISOString()};
    H.set('hcm_leaves',[...H.leaves(),record]);return record;
  }
  function decide(id,status,comment='') {
    if (!['Approved','Rejected'].includes(status)) throw new Error('Invalid decision.');
    const leaves=H.leaves(), i=leaves.findIndex(l=>l.id===id);
    if(i<0) throw new Error('Leave request not found.');
    if(leaves[i].status!=='Pending') throw new Error('This request has already been processed.');
    if(status==='Approved') {
      const l=leaves[i];
      if(overlaps(l.employeeId,l.from,l.to,l.id)) throw new Error('Cannot approve: dates overlap another pending or approved leave.');
      if(l.days>remaining(l.employeeId)) throw new Error('Cannot approve: employee leave quota is no longer sufficient.');
    }
    leaves[i].status=status; leaves[i].comment=String(comment).trim(); leaves[i].decidedAt=new Date().toISOString();H.saveLeaves(leaves);return leaves[i];
  }
  global.HCMLeave={apply,decide,remaining,ownApprovedDays};
})(window);
