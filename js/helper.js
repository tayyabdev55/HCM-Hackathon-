// Smart helper: keyword matching on the app's own data
function initChat(answerFn) {
  const log = document.getElementById("chatLog"), form = document.getElementById("chatForm"), input = document.getElementById("chatInput");
  const add = (text, who) => {
    const div = document.createElement("div");
    div.className = "msg " + who;
    div.textContent = text;
    log.appendChild(div);
    log.scrollTop = log.scrollHeight;
  };
  add("Hi! Ask me a question about your HCM data.", "bot");
  form.addEventListener("submit", e => {
    e.preventDefault();
    const q = input.value.trim();
    if (!q) return;
    add(q, "me");
    add(answerFn(q.toLowerCase()), "bot");
    input.value = "";
  });
}

function adminAnswer(t) {
  const employees = getUsers().filter(u => u.role === "employee"), td = today();
  const attToday = getAtt().filter(a => a.date === td), leaves = getLeaves();
  const nameOf = id => (employees.find(u => u.id === id) || {}).name || "Unknown";
  if (t.includes("salary") || t.includes("payroll")) return "Total monthly payroll is " + money(employees.reduce((s, u) => s + u.salary, 0)) + " for " + employees.length + " employee(s).";
  if (t.includes("absent")) return employees.filter(u => statusOn(u.id, td) === "absent").length + " employee(s) are marked absent today.";
  if (t.includes("late")) {
    const late = attToday.filter(a => a.status === "late");
    return late.length ? late.length + " late today: " + late.map(a => nameOf(a.userId)).join(", ") : "Nobody was late today.";
  }
  if (t.includes("pending")) return leaves.filter(l => l.status === "pending").length + " leave request(s) are pending.";
  if (t.includes("leave")) {
    const away = leaves.filter(l => l.status === "approved" && l.from <= td && l.to >= td);
    return away.length ? away.length + " on leave today: " + away.map(l => nameOf(l.userId) + " (" + l.type + ")").join(", ") : "Nobody is on leave today.";
  }
  if (t.includes("present") || t.includes("attend")) return attToday.length + " employee(s) have checked in today.";
  if (t.includes("employee") || t.includes("how many")) return "You have " + employees.length + " employee(s).";
  return "Try: How many employees do we have? Who is on leave today? Who was late today?";
}

// Employees only ever see their own records
function employeeAnswer(user) {
  return t => {
    const mine = getAtt().filter(a => a.userId === user.id);
    if (t.includes("salary") || t.includes("payslip") || t.includes("pay")) return "Your net salary for " + monthLabel(monthKey()) + " is " + money(payslip(user, monthKey()).net) + " so far.";
    if (t.includes("late")) {
      const rec = mine.find(a => a.date === today());
      if (!rec) return "You have not checked in today.";
      return rec.status === "late" ? "Yes, you checked in late at " + rec.in + "." : "No, you were on time (" + rec.in + ").";
    }
    if (t.includes("hour") || t.includes("work")) {
      const start = new Date(); start.setDate(start.getDate() - 6);
      const hours = mine.filter(a => a.date >= fmtDate(start) && a.hours).reduce((s, a) => s + a.hours, 0);
      return "You worked " + hours.toFixed(1) + " hours in the last 7 days.";
    }
    if (t.includes("leave") || t.includes("left") || t.includes("balance")) {
      return "You have " + leaveBalance(user.id) + " of " + getCompany().quota + " leave days left.";
    }
    return "Try: How many leaves do I have left? Was I late today? How many hours did I work this week?";
  };
}
