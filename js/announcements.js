// Announcements: Admin posts, Employees read
function initAnnouncements(canManage) {
  const list = document.getElementById("noticeList");

  function render() {
    const items = getNotices().sort((a, b) => b.id - a.id);
    list.innerHTML = items.length ? items.map(n =>
      "<article class=\"notice\"><div><h3>" + esc(n.title) + "</h3><p>" + esc(n.body) + "</p><small>" + n.date + "</small></div>" +
      (canManage ? "<button class=\"btn-sm btn-danger\" data-id=\"" + n.id + "\">Delete</button>" : "") + "</article>"
    ).join("") : "<p class=\"empty\">No announcements yet.</p>";
  }

  if (canManage) {
    document.getElementById("noticeForm").addEventListener("submit", e => {
      e.preventDefault();
      const title = document.getElementById("noticeTitle").value.trim(), body = document.getElementById("noticeBody").value.trim();
      let ok = setErr("noticeTitle", title ? "" : "Title is required");
      ok = setErr("noticeBody", body ? "" : "Write the announcement") && ok;
      if (!ok) return;
      const all = getNotices();
      all.push({ id: Date.now(), title, body, date: today() });
      save(KEYS.notices, all);
      e.target.reset();
      render();
    });
    list.addEventListener("click", e => {
      const btn = e.target.closest("button[data-id]");
      if (!btn) return;
      save(KEYS.notices, getNotices().filter(n => n.id !== +btn.dataset.id));
      render();
    });
  }
  render();
}
