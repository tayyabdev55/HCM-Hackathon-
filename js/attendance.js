/* Attendance calculations and CSV export. */
(function (global) {
  'use strict'; const H = global.HCM;
  function getTodayRecord(employeeId, date=H.today()) { return H.attendance().find(a => a.employeeId === employeeId && a.date === date) || null; }
  function checkIn(employeeId, now=new Date()) {
    const date = H.today(), records = H.attendance();
    if (records.some(a => a.employeeId === employeeId && a.date === date)) throw new Error('You already checked in today.');
    const company = H.company(), time = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
    const [sh,sm] = String(company.startTime || '09:00').split(':').map(Number), deadline = sh*60+sm+Number(company.graceMinutes||0), current = now.getHours()*60+now.getMinutes();
    const status = current > deadline ? 'Late' : 'Present';
    const record = { id:H.id(), employeeId, date, checkIn:time, checkOut:'', hours:0, status };
    records.push(record); H.saveAttendance(records); return record;
  }
  function checkOut(employeeId, now=new Date()) {
    const date=H.today(), records=H.attendance(), i=records.findIndex(a=>a.employeeId===employeeId && a.date===date);
    if (i<0) throw new Error('Check in first before checking out.');
    if (records[i].checkOut) throw new Error('You have already checked out today.');
    const out=`${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
    const hours=H.hoursBetween(records[i].checkIn,out);
    records[i].checkOut=out; records[i].hours=Number(hours.toFixed(2));
    if (hours < 5) records[i].status='Half Day';
    H.saveAttendance(records); return records[i];
  }
  function effectiveStatus(record) { return record.status || 'Present'; }
  function employeeRecords(id) { return H.attendance().filter(a=>a.employeeId===id).sort((a,b)=>b.date.localeCompare(a.date)); }
  function exportCSV(records, filename='attendance.csv') {
    const rows=[['Date','Employee','Department','Check In','Check Out','Hours','Status'],...records.map(a=>{const u=H.users().find(x=>x.id===a.employeeId)||{};return [a.date,u.name||'Deleted employee',u.department||'',a.checkIn||'',a.checkOut||'',a.hours||0,a.status||''];})];
    const csv=rows.map(r=>r.map(v=>`"${String(v??'').replace(/"/g,'""')}"`).join(',')).join('\r\n');
    const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8;'})), a=document.createElement('a'); a.href=url;a.download=filename;a.click();URL.revokeObjectURL(url);
  }
  global.HCMAttendance={getTodayRecord,checkIn,checkOut,effectiveStatus,employeeRecords,exportCSV};
})(window);
