# 🦷 BobbyDent CRM

A web-based clinic management system built for dental practices — designed to streamline day-to-day operations across staff roles.

![Laravel](https://img.shields.io/badge/Laravel-11-FF2D20?style=flat-square&logo=laravel&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)
![Inertia.js](https://img.shields.io/badge/Inertia.js-violet?style=flat-square)
![TailwindCSS](https://img.shields.io/badge/Tailwind-CSS-38BDF8?style=flat-square&logo=tailwindcss&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-003B57?style=flat-square&logo=sqlite&logoColor=white)

---

## Overview

BobbyDent CRM covers the full patient lifecycle — from registration and appointment scheduling to treatment recording and billing. It's built as a single-page application feel using Inertia.js, meaning no API layer or separate frontend build: Laravel handles routing and data, React handles the UI, and Inertia bridges them seamlessly.

The system implements role-based access control scoped to three user types: **admin**, **receptionist**, and **dentist** — each limited to the workflows relevant to their function.

---

## Features

- **Dashboard** — At-a-glance stats (patients, revenue, appointments), a Recharts weekly bar chart, recent appointments table, and today's live schedule
- **Patient Management** — Searchable patient registry with full demographic, contact, emergency contact, and medical history forms
- **Appointment Scheduling** — FullCalendar-powered month/week/day views with click-to-schedule, slot availability checking, and status tracking
- **Treatment Recording** — Treatment entries tied directly to appointment status transitions
- **Billing & Invoicing** — Invoice generation with partial payment tracking and downloadable PDF receipts via DomPDF
- **Role-Based Access Control** — Admin, receptionist, and dentist roles with scoped permissions via Laravel Sanctum (session-based)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Laravel 11 |
| Frontend | React 18 (via Inertia.js) |
| Styling | Tailwind CSS + @tailwindcss/forms |
| Build tool | Vite |
| Database | SQLite |
| Auth | Laravel Sanctum (session-based) |
| Calendar | FullCalendar (daygrid, timegrid, interaction) |
| Charts | Recharts |
| PDF | barryvdh/laravel-dompdf |

---

## Architecture

This project uses the **Inertia.js monolith pattern** — there is no REST API. Laravel controllers return `Inertia::render()` responses, passing typed props directly to React page components. All navigation uses Inertia's `<Link>` and `router` — no full page reloads, no separate API endpoints to maintain.

```
routes/web.php
    └── Controller (auth + role middleware)
            └── Inertia::render('PageName', [...props])
                    └── React Page Component (receives props via usePage())
                            └── AppLayout (persistent sidebar + topbar shell)
```

Forms use Inertia's `useForm` hook — validation errors from Laravel flow back automatically to the component's `form.errors` object without any manual wiring.

---

## Project Structure

```
resources/js/
├── Layouts/
│   └── AppLayout.jsx         # Persistent sidebar + topbar + flash messages
├── Components/
│   ├── StatusBadge.jsx        # Reusable appointment status pill
│   ├── StatCard.jsx           # Dashboard metric card
│   ├── Patients/
│   │   └── PatientModal.jsx   # Add patient form (4 sections, 17 fields)
│   └── Appointments/
│       └── AppointmentModal.jsx
├── Pages/
│   ├── Dashboard.jsx
│   ├── Patients/Index.jsx
│   ├── Appointments/Index.jsx
│   ├── Treatments/Index.jsx
│   └── Billing/Index.jsx
app/Http/Controllers/
├── DashboardController.php
├── PatientController.php
├── AppointmentController.php
├── TreatmentController.php
└── BillingController.php
```

---

## Local Setup

**Prerequisites:** PHP 8.2+, Composer, Node.js 20+

```bash
# 1. Clone and install dependencies
git clone https://github.com/your-username/bobbydent-crm.git
cd bobbydent-crm
composer install
npm install

# 2. Environment
cp .env.example .env
php artisan key:generate

# 3. Database
touch database/database.sqlite
# Set DB_CONNECTION=sqlite and DB_DATABASE=/absolute/path/to/database/database.sqlite in .env
php artisan migrate --seed

# 4. Run
php artisan serve
npm run dev
```

Visit `http://localhost:8000`

---

## Status

This is a portfolio/demo project currently in active development. Core modules (dashboard, patients, appointments) are built. Treatments, billing, and full database persistence are in progress.