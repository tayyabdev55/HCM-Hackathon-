// Employee: dashboard (check in / out) and the "My attendance" page
const me = requireRole("employee");
if (me) {
  const company = getCompany(), $ = id => document.getElementById(id);

  function renderRows(days, limit) {
    const mine = getAtt().filter(a => a.userId === me.id);
    let rows = days.map(d => ({ d, rec: mine.find(a => a.date === d), status: statusOn(me.id, d) })).filter(r => r.rec || r.status !== "off");
    if (limit) rows = rows.slice(0, limit);
    $("attBody").innerHTML = rows.length ? rows.map(r =>
      "<tr><td>" + r.d + "</td><td>" + (r.rec ? r.rec.in : "-") + "</td><td>" + (r.rec && r.rec.out ? r.rec.out : "-") + "</td><td>" +
      (r.rec && r.rec.hours ? r.rec.hours.toFixed(1) : "-") + "</td><td>" + badge(r.status) + "</td></tr>").join("")
      : "<tr><td colspan=\"5\">No records yet.</td></tr>";
  }

  function fillSummary(ym, prefix) {
    const s = monthSummary(me.id, ym);
    ["present", "late", "half", "absent", "leave"].forEach(k => { if ($(prefix + k)) $(prefix + k).textContent = s[k]; });
  }

  function renderDashboard() {
    const rec = getAtt().find(a => a.userId === me.id && a.date === today());
    $("todayStatus").textContent = rec ? rec.status : "Not checked in";
    $("inTime").textContent = rec ? rec.in : "--:--";
    $("hoursToday").textContent = rec && rec.hours ? rec.hours.toFixed(1) : "0";
    $("balance").textContent = leaveBalance(me.id);
    $("checkInBtn").disabled = !!rec;
    $("checkOutBtn").disabled = !rec || !!rec.out;
    fillSummary(monthKey(), "m-");
    renderRows(monthDays(monthKey()).filter(d => d <= today()).reverse(), 7);
  }

  function renderMonth() {
    const ym = $("monthPicker").value || monthKey();
    fillSummary(ym, "s-");
    renderRows(monthDays(ym).filter(d => d <= today()).reverse());
  }

  if ($("checkInBtn")) {
    $("checkInBtn").addEventListener("click", () => {
      const time = nowTime(), all = getAtt();
      if (all.some(a => a.userId === me.id && a.date === today())) return; // one check-in per day
      const late = mins(time) > mins(company.start) + company.grace;
      all.push({ userId: me.id, date: today(), in: time, out: "", hours: 0, status: late ? "late" : "present" });
      save(KEYS.att, all);
      renderDashboard();
    });
    $("checkOutBtn").addEventListener("click", () => {
      const all = getAtt(), rec = all.find(a => a.userId === me.id && a.date === today());
      if (!rec || rec.out) return; // check-out only after check-in
      rec.out = nowTime();
      rec.hours = (mins(rec.out) - mins(rec.in)) / 60;
      if (rec.hours < 5) rec.status = "half";
      save(KEYS.att, all);
      renderDashboard();
    });
    initAnnouncements(false);
    initChat(employeeAnswer(me));
    renderDashboard();
  }

  if ($("monthPicker")) {
    $("monthPicker").value = monthKey();
    $("monthPicker").addEventListener("change", renderMonth);
    renderMonth();
  }
}
