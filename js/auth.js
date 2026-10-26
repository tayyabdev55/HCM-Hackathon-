/* Authentication and role guards. Demo passwords are stored locally; not suitable for real production use. */
(function (global) {
  'use strict';
  const H = global.HCM;
  function login(user) { H.set('hcm_session', { userId: user.id, role: user.role, at: Date.now() }); }
  function logout() { localStorage.removeItem('hcm_session'); location.href = location.pathname.includes('/pages/') ? '../index.html' : 'index.html'; }
  function currentUser() { const s = H.session(); return s ? H.users().find(u => u.id === s.userId && u.active !== false) || null : null; }
  function guard(role) {
    const user = currentUser();
    if (!user) { location.href = location.pathname.includes('/pages/') ? '../index.html' : 'index.html'; return null; }
    if (role === 'admin' && user.role !== 'admin') { location.href = 'employee.html'; return null; }
    if (role === 'employee' && user.role === 'admin') { location.href = 'admin.html'; return null; }
    return user;
  }
  function applyTheme() {
    const theme = H.get('hcm_theme', 'dark');
    document.documentElement.classList.toggle('theme-light', theme === 'light');
  }
  function toggleTheme() {
    const next = H.get('hcm_theme','dark') === 'dark' ? 'light' : 'dark';
    H.set('hcm_theme', next); applyTheme();
  }
  function wireTheme() { applyTheme(); document.querySelectorAll('[data-theme-toggle]').forEach(b => b.addEventListener('click', toggleTheme)); }
  global.HCM = Object.assign(H, { login, logout, currentUser, guard, applyTheme, toggleTheme, wireTheme });
})(window);
