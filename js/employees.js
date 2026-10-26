/* Employee CRUD. Included by pages that manage people. */
(function (global) {
  'use strict'; const H = global.HCM;
  function addEmployee(data) {
    const users = H.users(), email = String(data.email||'').trim().toLowerCase();
    if (!data.name?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Enter a name and valid email.');
    if (users.some(u => u.email.toLowerCase() === email)) throw new Error('This email is already in use.');
    if (!data.password || data.password.length < 8) throw new Error('Password must be at least 8 characters.');
    const salary = Number(data.salary); if (!(salary > 0)) throw new Error('Monthly salary must be greater than 0.');
    const user = { id: H.id(), name: data.name.trim(), email, password: data.password, role: 'employee', department: data.department.trim(), salary, leaveUsed: 0, active: true, joined: H.today() };
    users.push(user); H.saveUsers(users); return user;
  }
  function updateEmployee(id, data) {
    const users = H.users(), i = users.findIndex(u => u.id === id && u.role === 'employee');
    if (i < 0) throw new Error('Employee not found.');
    const email = String(data.email||'').trim().toLowerCase();
    if (!data.name?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Enter a name and valid email.');
    if (users.some(u => u.id !== id && u.email.toLowerCase() === email)) throw new Error('This email is already in use.');
    if (!(Number(data.salary) > 0)) throw new Error('Monthly salary must be greater than 0.');
    Object.assign(users[i], { name:data.name.trim(), email, department:data.department.trim(), salary:Number(data.salary), active:data.active !== false });
    if (data.password) { if (data.password.length < 8) throw new Error('New password must be at least 8 characters.'); users[i].password=data.password; }
    H.saveUsers(users); return users[i];
  }
  function deleteEmployee(id) {
    const user = H.users().find(u => u.id === id && u.role === 'employee');
    if (!user) throw new Error('Employee not found.');
    H.saveUsers(H.users().filter(u => u.id !== id));
    H.saveAttendance(H.attendance().filter(a => a.employeeId !== id));
    H.saveLeaves(H.leaves().filter(l => l.employeeId !== id));
  }
  global.HCMEmployees = { addEmployee, updateEmployee, deleteEmployee };
})(window);
