// Admin: company rules
const admin = requireRole("admin");
if (admin) {
  const c = getCompany(), $ = id => document.getElementById(id), boxes = [...document.querySelectorAll(".wd")];
  $("setName").value = c.name;
  $("setStart").value = c.start;
  $("setGrace").value = c.grace;
  $("setQuota").value = c.quota;
  boxes.forEach(b => { b.checked = c.workDays.includes(+b.value); });

  $("settingsForm").addEventListener("submit", e => {
    e.preventDefault();
    const days = boxes.filter(b => b.checked).map(b => +b.value);
    let ok = setErr("setName", $("setName").value.trim() ? "" : "Company name is required");
    ok = setErr("setStart", $("setStart").value ? "" : "Required") && ok;
    ok = setErr("setGrace", $("setGrace").value !== "" && +$("setGrace").value >= 0 ? "" : "Enter 0 or more") && ok;
    ok = setErr("setQuota", +$("setQuota").value > 0 ? "" : "Enter a number above 0") && ok;
    ok = setErr("wdBox", days.length ? "" : "Choose at least one working day") && ok;
    if (!ok) return;
    save(KEYS.company, { name: $("setName").value.trim(), start: $("setStart").value, grace: +$("setGrace").value, quota: +$("setQuota").value, workDays: days });
    $("settingsMessage").textContent = "Settings saved. New rules apply from now on.";
    renderSidebar(admin);
  });
}
