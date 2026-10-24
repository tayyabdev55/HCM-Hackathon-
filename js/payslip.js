// Monthly payslip: Admin picks any employee, Employee sees only their own
const user = requireRole("any");
if (user) {
  const $ = id => document.getElementById(id), isAdmin = user.role === "admin", company = getCompany();
  $("slipMonth").value = monthKey();

  if (isAdmin) {
    const staff = getUsers().filter(u => u.role === "employee");
    $("slipEmployee").innerHTML = staff.map(u => "<option value=\"" + u.id + "\">" + esc(u.name) + "</option>").join("");
  } else {
    $("employeeWrap").hidden = true;
  }

  const row = (label, value) => "<tr><td>" + label + "</td><td class=\"num\">" + value + "</td></tr>";

  function render() {
    const target = isAdmin ? getUsers().find(u => u.id === +$("slipEmployee").value) : user, ym = $("slipMonth").value || monthKey();
    if (!target) { $("slip").innerHTML = "<p class=\"empty\">Add an employee first to see payslips.</p>"; return; }
    const p = payslip(target, ym);
    $("slip").innerHTML =
      "<div class=\"slip-head\"><div><h2>" + esc(company.name) + "</h2><p>Payslip for " + monthLabel(ym) + "</p></div><span class=\"slip-tag\">PAYSLIP</span></div>" +
      "<div class=\"slip-meta\"><div><small>Employee</small><strong>" + esc(target.name) + "</strong></div><div><small>Department</small><strong>" +
      esc(target.department) + "</strong></div><div><small>Email</small><strong>" + esc(target.email) + "</strong></div></div>" +
      "<table class=\"data-table\"><tbody>" + row("Monthly salary", money(target.salary)) + row("Working days in month", p.workingDays) +
      row("On time / Late / Half day", p.present + " / " + p.late + " / " + p.half) + row("Approved leave days", p.leave) + row("Absent days", p.absent) +
      row("Salary per day", money(p.perDay)) + row("Deduction (" + p.absent + " absent + " + p.half + " half day x 0.5)", "- " + money(p.deduction)) + "</tbody></table>" +
      "<div class=\"slip-net\"><span>Net salary</span><strong>" + money(p.net) + "</strong></div>" +
      "<p class=\"slip-note\">Deduction = salary per day x (absent days + 0.5 x half days). Approved leave is not deducted.</p>";
  }

  $("slipEmployee").addEventListener("change", render);
  $("slipMonth").addEventListener("change", render);
  $("printBtn").addEventListener("click", () => window.print());
  render();
}
