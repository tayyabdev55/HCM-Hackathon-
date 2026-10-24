// Admin: attendance of every employee for one day
const admin = requireRole("admin");
if (admin) {
  const $ = id => document.getElementById(id);
  let rows = [];
  $("dayPicker").value = today();

  function render() {
    const ds = $("dayPicker").value || today(), q = $("searchInput").value.toLowerCase();
    const att = getAtt().filter(a => a.date === ds);
    rows = getUsers().filter(u => u.role === "employee" && u.name.toLowerCase().includes(q)).map(u => {
      const rec = att.find(a => a.userId === u.id);
      return { user: u, rec, status: statusOn(u.id, ds) };
    });
    ["present", "late", "half", "leave", "absent"].forEach(s => { $("c-" + s).textContent = rows.filter(r => r.status === s).length; });
    $("recBody").innerHTML = rows.length ? rows.map(r =>
      "<tr><td>" + esc(r.user.name) + "</td><td>" + esc(r.user.department) + "</td><td>" + (r.rec ? r.rec.in : "-") + "</td><td>" +
      (r.rec && r.rec.out ? r.rec.out : "-") + "</td><td>" + (r.rec && r.rec.hours ? r.rec.hours.toFixed(1) : "-") + "</td><td>" + badge(r.status) + "</td></tr>"
    ).join("") : "<tr><td colspan=\"6\">No employees found.</td></tr>";
  }

  $("exportBtn").addEventListener("click", () => {
    const ds = $("dayPicker").value || today();
    downloadCsv("attendance-" + ds + ".csv", [["Name", "Department", "In", "Out", "Hours", "Status"]].concat(
      rows.map(r => [r.user.name, r.user.department, r.rec ? r.rec.in : "", r.rec ? r.rec.out : "", r.rec && r.rec.hours ? r.rec.hours.toFixed(1) : "", r.status])));
  });
  $("dayPicker").addEventListener("change", render);
  $("searchInput").addEventListener("input", render);
  render();
}
