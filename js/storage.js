// Shared localStorage helpers, date utilities and payroll calculation
const KEYS = { company: "hcm_company", users: "hcm_users", att: "hcm_attendance", leaves: "hcm_leaves", session: "hcm_session", notices: "hcm_announcements" };

function load(key, fallback) {
  try { const v = JSON.parse(localStorage.getItem(key)); return v === null ? fallback : v; }
  catch (e) { return fallback; }
}
function save(key, value) { localStorage.setItem(key, JSON.stringify(value)); }

const getCompany = () => load(KEYS.company, null);
const getUsers = () => load(KEYS.users, []);
const getAtt = () => load(KEYS.att, []);
const getLeaves = () => load(KEYS.leaves, []);
const getSession = () => load(KEYS.session, null);
const getNotices = () => load(KEYS.notices, []);

const pad = n => String(n).padStart(2, "0");
const fmtDate = d => d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
const today = () => fmtDate(new Date());
const monthKey = () => today().slice(0, 7);
const monthLabel = ym => new Date(ym + "-01T00:00").toLocaleString("en", { month: "long", year: "numeric" });
const nowTime = () => { const d = new Date(); return pad(d.getHours()) + ":" + pad(d.getMinutes()); };
const mins = t => { const p = t.split(":"); return +p[0] * 60 + +p[1]; };
const isEmail = e => /^\S+@\S+\.\S+$/.test(e);
const money = n => "Rs " + Math.round(n).toLocaleString();
const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const badge = s => "<span class=\"badge badge-" + s.replace(/\s/g, "-") + "\">" + s + "</span>";

const workDays = () => (getCompany() && getCompany().workDays) || [1, 2, 3, 4, 5];
const isWorkingDate = ds => workDays().includes(new Date(ds + "T00:00").getDay());

function monthDays(ym) {
  const [y, m] = ym.split("-").map(Number), out = [];
  for (let d = new Date(y, m - 1, 1); d.getMonth() === m - 1; d.setDate(d.getDate() + 1)) out.push(fmtDate(d));
  return out;
}

// Count only working days between two dates
function workingDays(from, to) {
  let count = 0;
  for (let d = new Date(from + "T00:00"), end = new Date(to + "T00:00"); d <= end; d.setDate(d.getDate() + 1)) {
    if (workDays().includes(d.getDay())) count++;
  }
  return count;
}

const onLeave = (userId, ds) => getLeaves().some(l => l.userId === userId && l.status === "approved" && l.from <= ds && l.to >= ds);

function leaveBalance(userId) {
  const used = getLeaves().filter(l => l.userId === userId && l.status === "approved").reduce((s, l) => s + l.days, 0);
  return getCompany().quota - used;
}

// present / late / half / leave / absent / off / not yet
function statusOn(userId, ds) {
  const rec = getAtt().find(a => a.userId === userId && a.date === ds);
  if (rec) return rec.status;
  if (onLeave(userId, ds)) return "leave";
  if (!isWorkingDate(ds)) return "off";
  if (ds < today()) return "absent";
  return ds === today() ? "not yet" : "-";
}

function monthSummary(userId, ym) {
  const days = monthDays(ym).filter(isWorkingDate);
  const s = { workingDays: days.length, present: 0, late: 0, half: 0, absent: 0, leave: 0 };
  getAtt().filter(a => a.userId === userId && a.date.startsWith(ym)).forEach(a => { if (s[a.status] !== undefined) s[a.status]++; });
  days.forEach(d => {
    const st = statusOn(userId, d);
    if (st === "absent") s.absent++;
    else if (st === "leave") s.leave++;
  });
  return s;
}

// Payslip: per day = salary / working days; deduction = per day x (absent + 0.5 x half days)
function payslip(user, ym) {
  const s = monthSummary(user.id, ym);
  const perDay = s.workingDays ? user.salary / s.workingDays : 0;
  const deduction = perDay * (s.absent + 0.5 * s.half);
  return Object.assign(s, { perDay, deduction, net: user.salary - deduction });
}

function downloadCsv(name, rows) {
  const csv = rows.map(r => r.map(c => "\"" + String(c).replace(/"/g, "\"\"") + "\"").join(",")).join("\n");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  a.download = name;
  a.click();
  URL.revokeObjectURL(a.href);
}

// Shows an error under an input. Returns true when there is no error.
function setErr(id, message) {
  const input = document.getElementById(id);
  let box = input.nextElementSibling;
  if (!box || !box.classList.contains("err")) {
    box = document.createElement("small");
    box.className = "err";
    input.after(box);
  }
  box.textContent = message || "";
  return !message;
}
