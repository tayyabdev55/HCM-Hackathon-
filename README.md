# HCM Lite

A small HR web app for Admin and Employees, built with plain HTML, CSS and JavaScript.
No framework and no backend: all data is saved in the browser with localStorage. The app starts empty.

## Run
Open the folder in VS Code and start **Live Server** on `index.html` (or use any static server).
Charts load Chart.js from a CDN, so the Admin dashboard needs internet for the graphs.

## Quick demo
1. Open `index.html`. First time only: create the company and the Admin account.
2. Admin > **Employees**: add an employee (this also creates their login).
3. Logout, then login as the employee: **Check in**, apply for leave, ask the smart helper.
4. Login as Admin: approve the leave, open **Attendance**, **Payslips** and **Settings**.

## Pages
| File | Who | What |
|------|-----|------|
| `index.html` | all | First-run setup and login |
| `pages/admin.html` | Admin | Totals, charts, announcements, smart helper |
| `pages/employees.html` | Admin | Add (creates login), edit, delete, search, filter |
| `pages/attendance.html` | Admin | Daily records, absent detection, export CSV |
| `pages/leaves.html` | Admin | Approve or reject with a comment |
| `pages/settings.html` | Admin | Start time, grace minutes, leave quota, working days |
| `pages/employee.html` | Employee | Check in/out, month summary, announcements, helper |
| `pages/my-attendance.html` | Employee | Monthly attendance history |
| `pages/my-leaves.html` | Employee | Apply for leave, see status and balance |
| `pages/payslip.html` | Both | Monthly payslip, print or save as PDF |
| `pages/profile.html` | Both | Details and change password |

## Business rules
- **Late**: check-in after office start + grace minutes. One check-in per day; check-out only after check-in.
- **Half day**: worked under 5 hours. **Absent**: no record on a working day (before today) and no approved leave.
- **Leave**: From <= To, working days only, no overlap, cannot exceed the yearly quota.
- **Payslip**: per day = salary / working days in the month; deduction = per day x (absent + 0.5 x half days); net = salary - deduction.

## Smart helper examples
Admin: "How many employees do we have?", "Who is on leave today?", "Who was late today?", "What is the total payroll?"
Employee: "How many leaves do I have left?", "Was I late today?", "How many hours did I work this week?", "What is my salary?"

## localStorage keys
`hcm_company`, `hcm_users`, `hcm_attendance`, `hcm_leaves`, `hcm_announcements`, `hcm_session`

## Folders
```
index.html
pages/   admin, employees, attendance, leaves, settings, payslip, profile, employee, my-attendance, my-leaves
css/     login.css, dashboard.css
js/      storage, auth, helper, announcements, admin, employees, records, attendance, leave, settings, payslip, profile
```
