// Both roles: see profile, change password
const user = requireRole("any");
if (user) {
  const $ = id => document.getElementById(id);
  $("pName").textContent = user.name;
  $("pEmail").textContent = user.email;
  $("pRole").textContent = user.role === "admin" ? "Administrator" : "Employee";
  $("pDept").textContent = user.department;

  $("passwordForm").addEventListener("submit", e => {
    e.preventDefault();
    const cur = $("curPw").value, next = $("newPw").value, again = $("confirmPw").value;
    let ok = setErr("curPw", cur === user.password ? "" : "Current password is wrong");
    ok = setErr("newPw", next.length >= 6 ? "" : "At least 6 characters") && ok;
    ok = setErr("confirmPw", again === next ? "" : "Passwords do not match") && ok;
    if (!ok) return;
    const users = getUsers();
    users.find(u => u.id === user.id).password = next;
    save(KEYS.users, users);
    e.target.reset();
    $("pwMessage").textContent = "Password changed.";
  });
}
