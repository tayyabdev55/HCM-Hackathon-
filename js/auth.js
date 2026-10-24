// Login session, role guard and sidebar
const ROOT = location.pathname.includes("/pages/") ? "../" : "";

function currentUser() {
  const session = getSession();
  return session ? getUsers().find(u => u.id === session.id) || null : null;
}

// role = "admin", "employee" or "any". Wrong role -> sent to own dashboard.
function requireRole(role) {
  const user = currentUser();
  if (!user) { location.href = ROOT + "index.html"; return null; }
  if (role !== "any" && user.role !== role) {
    location.href = ROOT + "pages/" + (user.role === "admin" ? "admin.html" : "employee.html");
    return null;
  }
  renderSidebar(user);
  return user;
}

function logout() {
  localStorage.removeItem(KEYS.session);
  location.href = ROOT + "index.html";
}

const NAV = {
  admin: [["admin.html", "🏠", "Dashboard"], ["employees.html", "👥", "Employees"], ["attendance.html", "📅", "Attendance"],
    ["leaves.html", "📝", "Leave requests"], ["payslip.html", "💰", "Payslips"], ["settings.html", "⚙️", "Settings"], ["profile.html", "🔐", "Profile"]],
  employee: [["employee.html", "🏠", "Dashboard"], ["my-attendance.html", "📅", "My attendance"], ["my-leaves.html", "📝", "My leaves"],
    ["payslip.html", "💰", "Payslip"], ["profile.html", "🔐", "Profile"]]
};

function renderSidebar(user) {
  const here = location.pathname.split("/").pop(), company = getCompany() || {};
  document.getElementById("sidebar").innerHTML =
    "<h2>HCM Lite</h2><p class=\"sidebar-label\">" + esc(company.name || "Menu") + "</p><nav>" +
    NAV[user.role].map(l => "<a href=\"" + l[0] + "\"" + (l[0] === here ? " class=\"active\"" : "") + "><span class=\"ico\">" + l[1] + "</span>" + l[2] + "</a>").join("") +
    "</nav><button id=\"logoutBtn\" class=\"logout-btn\">Logout</button>";
  document.getElementById("logoutBtn").addEventListener("click", logout);
  document.getElementById("adminName").textContent = user.name;
  document.getElementById("roleLabel").textContent = user.role === "admin" ? "Administrator" : user.department;
  document.getElementById("avatar").textContent = user.name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
}
