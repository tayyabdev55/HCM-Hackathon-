/* HCM Lite: safe, namespaced localStorage helpers. */
(function (global) {
  'use strict';
  const KEYS = ['hcm_company','hcm_users','hcm_attendance','hcm_leaves','hcm_session','hcm_announcements'];
  function get(key, fallback) {
    try { const raw = localStorage.getItem(key); return raw === null ? fallback : JSON.parse(raw); }
    catch (e) { console.warn('Invalid localStorage value for', key, e); return fallback; }
  }
  function set(key, value) { localStorage.setItem(key, JSON.stringify(value)); return value; }
  function id() { return global.crypto && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`; }
  function today() { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; }
  function dateTime(date, time) { return new Date(`${date}T${time}:00`); }
  function fmtDate(value) { if (!value) return '—'; return new Date(`${value}T00:00:00`).toLocaleDateString(undefined,{year:'numeric',month:'short',day:'numeric'}); }
  function esc(value) { return String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
  function clearAppData() { KEYS.forEach(k => localStorage.removeItem(k)); }
  function company() { return get('hcm_company', {}); }
  function users() { return get('hcm_users', []); }
  function attendance() { return get('hcm_attendance', []); }
  function leaves() { return get('hcm_leaves', []); }
  function session() { return get('hcm_session', null); }
  function saveUsers(v) { return set('hcm_users', v); }
  function saveAttendance(v) { return set('hcm_attendance', v); }
  function saveLeaves(v) { return set('hcm_leaves', v); }
  function workingDaysBetween(from, to, days) {
    if (!from || !to || from > to) return 0;
    const working = new Set(Array.isArray(days) && days.length ? days : [1,2,3,4,5]);
    let n = 0, d = new Date(`${from}T12:00:00`), end = new Date(`${to}T12:00:00`);
    while (d <= end) { if (working.has(d.getDay())) n++; d.setDate(d.getDate()+1); }
    return n;
  }
  function monthWorkingDays(year, month, days) {
    const last = new Date(year, month, 0).getDate(), working = new Set(Array.isArray(days) && days.length ? days : [1,2,3,4,5]);
    let n = 0; for (let i=1;i<=last;i++) if (working.has(new Date(year,month-1,i).getDay())) n++; return n;
  }
  function hoursBetween(inTime, outTime) { if (!inTime || !outTime) return 0; const a = new Date(`2000-01-01T${inTime}:00`), b = new Date(`2000-01-01T${outTime}:00`); return Math.max(0,(b-a)/3600000); }
  function statusClass(status) { return String(status || '').toLowerCase().replace(/\s+/g,'-'); }
  global.HCM = { KEYS, get, set, id, today, dateTime, fmtDate, esc, clearAppData, company, users, attendance, leaves, session, saveUsers, saveAttendance, saveLeaves, workingDaysBetween, monthWorkingDays, hoursBetween, statusClass };
})(window);
