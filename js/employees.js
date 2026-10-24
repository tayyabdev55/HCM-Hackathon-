// Admin: add (creates login), edit, delete, search, filter
const admin = requireRole("admin");
if (admin) {
  const form = document.getElementById("addEmployeeForm"), body = document.getElementById("employeeBody");
  const search = document.getElementById("searchInput"), deptFilter = document.getElementById("deptFilter");
  const val = id => document.getElementById(id).value.trim();

  function render() {
    const all = getUsers().filter(u => u.role === "employee");
    const current = deptFilter.value;
    deptFilter.innerHTML = "<option value=\"\">All departments</option>" +
      [...new Set(all.map(u => u.department))].map(d => "<option" + (d === current ? " selected" : "") + ">" + esc(d) + "</option>").join("");
    const q = search.value.toLowerCase();
    const list = all.filter(u => (!deptFilter.value || u.department === deptFilter.value) &&
      (u.name.toLowerCase().includes(q) || u.email.includes(q)));
    document.getElementById("employeeCount").textContent = all.length;
    body.innerHTML = list.length ? list.map(u =>
      "<tr><td>" + esc(u.name) + "</td><td>" + esc(u.email) + "</td><td>" + esc(u.department) + "</td><td>" + u.salary.toLocaleString() +
      "</td><td><button class=\"btn-sm btn-ghost\" data-act=\"edit\" data-id=\"" + u.id + "\">Edit</button> " +
      "<button class=\"btn-sm btn-danger\" data-act=\"delete\" data-id=\"" + u.id + "\">Delete</button></td></tr>"
    ).join("") : "<tr><td colspan=\"5\">No employees found.</td></tr>";
  }

  form.addEventListener("submit", e => {
    e.preventDefault();
    const email = val("empEmail").toLowerCase(), salary = +val("empSalary");
    let ok = true;
    ok = setErr("empName", val("empName") ? "" : "Full name is required") && ok;
    ok = setErr("empEmail", !isEmail(email) ? "Enter a valid email" : getUsers().some(u => u.email === email) ? "This email is already used" : "") && ok;
    ok = setErr("empPassword", val("empPassword").length >= 6 ? "" : "At least 6 characters") && ok;
    ok = setErr("empDepartment", val("empDepartment") ? "" : "Department is required") && ok;
    ok = setErr("empSalary", salary > 0 ? "" : "Salary must be greater than 0") && ok;
    if (!ok) return;
    const users = getUsers();
    users.push({ id: Date.now(), name: val("empName"), email, password: val("empPassword"), role: "employee", department: val("empDepartment"), salary });
    save(KEYS.users, users);
    form.reset();
    document.getElementById("formMessage").textContent = "Employee created. They can now log in with this email and password.";
    render();
  });

  body.addEventListener("click", e => {
    const btn = e.target.closest("button[data-act]");
    if (!btn) return;
    const users = getUsers(), user = users.find(u => u.id === +btn.dataset.id);
    if (btn.dataset.act === "delete") {
      if (!confirm("Delete " + user.name + "?")) return;
      save(KEYS.users, users.filter(u => u.id !== user.id));
    } else {
      const name = prompt("Full name", user.name); if (name === null) return;
      const dept = prompt("Department", user.department); if (dept === null) return;
      const salary = +prompt("Monthly salary", user.salary);
      if (!name.trim() || !dept.trim() || !(salary > 0)) { alert("Name, department and a salary above 0 are required."); return; }
      Object.assign(user, { name: name.trim(), department: dept.trim(), salary });
      save(KEYS.users, users);
    }
    render();
  });

  search.addEventListener("input", render);
  deptFilter.addEventListener("change", render);
  render();
}
