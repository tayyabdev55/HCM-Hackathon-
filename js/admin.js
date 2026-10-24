// Admin dashboard: totals, charts, announcements, helper
const admin = requireRole("admin");
if (admin) {
  const $ = id => document.getElementById(id);
  const employees = getUsers().filter(u => u.role === "employee"), td = today();
  const todays = getAtt().filter(a => a.date === td);
  $("totalEmployees").textContent = employees.length;
  $("presentEmployees").textContent = todays.length;
  $("onLeaveEmployees").textContent = employees.filter(e => onLeave(e.id, td)).length;
  $("lateEmployees").textContent = todays.filter(a => a.status === "late").length;
  $("pendingLeaves").textContent = getLeaves().filter(l => l.status === "pending").length;

  if (window.Chart) {
    Chart.defaults.font.family = "Inter, system-ui, sans-serif";
    const depts = [...new Set(employees.map(e => e.department))];
    const options = { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true, ticks: { precision: 0 } } } };
    new Chart($("deptChart"), { type: "bar", options, data: { labels: depts, datasets: [
      { label: "Present today", data: depts.map(d => employees.filter(e => e.department === d && todays.some(a => a.userId === e.id)).length), backgroundColor: "#4f46e5", borderRadius: 6 },
      { label: "Employees", data: depts.map(d => employees.filter(e => e.department === d).length), backgroundColor: "#c7d2fe", borderRadius: 6 }] } });
    const days = [...Array(7)].map((_, i) => { const d = new Date(); d.setDate(d.getDate() - 6 + i); return fmtDate(d); });
    new Chart($("trendChart"), { type: "line", options, data: { labels: days.map(d => d.slice(5)), datasets: [
      { label: "Check-ins", data: days.map(d => getAtt().filter(a => a.date === d).length), borderColor: "#4f46e5", backgroundColor: "rgba(79,70,229,.12)", fill: true, tension: 0.35 }] } });
  } else {
    document.querySelectorAll(".chart-box").forEach(b => b.innerHTML = "<p class=\"empty\">Charts need an internet connection.</p>");
  }

  initAnnouncements(true);
  initChat(adminAnswer);
}
