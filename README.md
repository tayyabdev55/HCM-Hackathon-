# HCM Lite

Vanilla HTML, CSS and JavaScript HR demo for the Saylani beginner hackathon.

## Run
Open `index.html` directly in a modern browser, or serve this folder with any static host (GitHub Pages / Netlify / Vercel). There is no backend and no build step. Chart.js is loaded from a CDN for the admin attendance chart; if offline, the rest of the app still works.

## First run
The first visit asks for company name, admin name, email and password. Admin adds employees from Employees. Employee passwords are set at account creation. All records are stored in this browser's `localStorage`.

## Main functions
- Role-based page redirects
- Employee add/edit/delete and department filtering
- Dedicated Attendance page for employee check-in/out and admin attendance reporting; live monthly net salary estimate updates after check-out. Grace-period late marking and under-5-hour half days
- Leave request overlap and quota checks; admin approval/rejection comments
- Monthly payslip with print / Save as PDF
- Role-aware keyword Smart Helper
- CSV export and light/dark theme

## Important limitations
This is a hackathon/demo app, not secure for real HR use. Passwords are stored in plain text in localStorage, users can modify data with browser developer tools, and data is not shared between browsers/devices. A static app cannot enforce server-side access control. Use test data only.
