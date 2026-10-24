// Leave: employees apply, admin approves or rejects

// ----- Employee side -----
if (document.getElementById("leaveForm") && requireRole("employee")) {
  const user = currentUser();
  const form = document.getElementById("leaveForm"), body = document.getElementById("myLeavesBody");

  function renderMyLeaves() {
    const mine = getLeaves().filter(l => l.userId === user.id).sort((a, b) => b.id - a.id);
    body.innerHTML = mine.length ? mine.map(l =>
      "<tr><td>" + esc(l.type) + "</td><td>" + l.from + " to " + l.to + "</td><td>" + l.days + "</td><td>" + badge(l.status) +
      "</td><td>" + esc(l.comment || "-") + "</td></tr>").join("") : "<tr><td colspan=\"5\">No leave requests yet.</td></tr>";
  }

  form.addEventListener("submit", e => {
    e.preventDefault();
    const type = document.getElementById("leaveType").value, from = document.getElementById("leaveFrom").value;
    const to = document.getElementById("leaveTo").value, reason = document.getElementById("leaveReason").value.trim();
    const mine = getLeaves().filter(l => l.userId === user.id && l.status !== "rejected");
    let ok = true, days = 0;
    ok = setErr("leaveFrom", from ? "" : "Choose a start date") && ok;
    ok = setErr("leaveReason", reason ? "" : "Add a short reason") && ok;
    let toError = to ? "" : "Choose an end date";
    if (from && to) {
      days = workingDays(from, to);
      const used = mine.reduce((s, l) => s + l.days, 0);
      if (from > to) toError = "From date must be on or before the To date";
      else if (days === 0) toError = "That range has no working days";
      else if (mine.some(l => l.from <= to && l.to >= from)) toError = "This overlaps another leave request";
      else if (days > getCompany().quota - used) toError = "Not enough leave left (" + (getCompany().quota - used) + " day(s) available)";
    }
    ok = setErr("leaveTo", toError) && ok;
    if (!ok) return;
    const all = getLeaves();
    all.push({ id: Date.now(), userId: user.id, type, from, to, days, reason, status: "pending", comment: "" });
    save(KEYS.leaves, all);
    form.reset();
    document.getElementById("leaveMessage").textContent = "Leave request sent (" + days + " working day(s)).";
    renderMyLeaves();
    document.dispatchEvent(new Event("hcm:update"));
  });

  renderMyLeaves();
}

// ----- Admin side -----
if (document.getElementById("leaveTable")) {
  const admin = requireRole("admin");
  if (admin) {
    const body = document.getElementById("leaveBody");

    function renderAll() {
      const users = getUsers();
      const rows = getLeaves().slice().sort((a, b) => (a.status === "pending" ? 0 : 1) - (b.status === "pending" ? 0 : 1) || b.id - a.id);
      body.innerHTML = rows.length ? rows.map(l => {
        const name = (users.find(u => u.id === l.userId) || { name: "Deleted user" }).name;
        const action = l.status === "pending"
          ? "<input class=\"comment\" placeholder=\"Comment\" data-id=\"" + l.id + "\">" +
            "<button class=\"btn-sm btn-ok\" data-act=\"approved\" data-id=\"" + l.id + "\">Approve</button> " +
            "<button class=\"btn-sm btn-danger\" data-act=\"rejected\" data-id=\"" + l.id + "\">Reject</button>"
          : esc(l.comment || "-");
        return "<tr><td>" + esc(name) + "</td><td>" + esc(l.type) + "</td><td>" + l.from + " to " + l.to + "</td><td>" + l.days +
          "</td><td>" + esc(l.reason) + "</td><td>" + badge(l.status) + "</td><td>" + action + "</td></tr>";
      }).join("") : "<tr><td colspan=\"7\">No leave requests yet.</td></tr>";
    }

    body.addEventListener("click", e => {
      const btn = e.target.closest("button[data-act]");
      if (!btn) return;
      const all = getLeaves(), leave = all.find(l => l.id === +btn.dataset.id);
      leave.status = btn.dataset.act;
      leave.comment = body.querySelector("input.comment[data-id=\"" + leave.id + "\"]").value.trim();
      save(KEYS.leaves, all);
      renderAll();
    });

    renderAll();
  }
}
