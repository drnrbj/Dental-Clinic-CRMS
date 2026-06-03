# 🦷 BobbyDent CRM

A web-based clinic management system built for dental practices — designed to streamline day-to-day operations across staff roles.

![Laravel](https://img.shields.io/badge/Laravel-11-FF2D20?style=flat-square&logo=laravel&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)
![Inertia.js](https://img.shields.io/badge/Inertia.js-violet?style=flat-square)
![TailwindCSS](https://img.shields.io/badge/Tailwind-CSS-38BDF8?style=flat-square&logo=tailwindcss&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-003B57?style=flat-square&logo=sqlite&logoColor=white)

---

Built on Laravel 11 with an Inertia.js + React frontend and SQLite for local storage. Covers the full patient lifecycle — registration, appointment scheduling, treatment recording, and billing — with role-based access control scoped to three user types: **admin**, **receptionist**, and **dentist**.

Uses the Inertia.js monolith pattern: no separate API, no full page reloads. Laravel controllers pass typed props directly to React page components via `Inertia::render()`, and form validation errors flow back automatically through Inertia's `useForm` hook.

---

## Project Structure

```
app/
├── Http/
│   ├── Controllers/
│   │   ├── AuthController.php
│   │   ├── DashboardController.php
│   │   ├── PatientController.php
│   │   ├── AppointmentController.php
│   │   ├── TreatmentController.php
│   │   ├── MyTreatmentsController.php
│   │   └── BillingController.php
│   └── Middleware/
│       ├── HandleInertiaRequests.php
│       └── RoleMiddleware.php
├── Models/
│   ├── User.php
│   ├── Patient.php
│   ├── Appointment.php
│   ├── AppointmentStatusLog.php
│   ├── Treatment.php
│   ├── Invoice.php
│   └── Payment.php
├── Observers/
│   └── TreatmentObserver.php
├── Policies/
│   └── TreatmentPolicy.php
└── Services/
    └── AppointmentAvailabilityService.php

resources/js/
├── Layouts/
│   └── AppLayout.jsx
├── Pages/
│   ├── Auth/Login.jsx
│   ├── Dashboard.jsx
│   ├── Patients/
│   │   ├── Index.jsx
│   │   ├── Show.jsx
│   │   └── Edit.jsx
│   ├── Appointments/Index.jsx
│   ├── Treatments/
│   │   ├── Index.jsx
│   │   └── MyTreatments.jsx
│   ├── Billing/
│   │   ├── Index.jsx
│   │   └── Receipt.jsx
│   └── Errors/403.jsx
├── Components/
│   ├── StatusBadge.jsx
│   ├── StatCard.jsx
│   ├── EmptyState.jsx
│   ├── Spinner.jsx
│   ├── Patients/
│   │   ├── PatientModal.jsx
│   │   ├── PersonalInfoTab.jsx
│   │   ├── AppointmentHistoryTab.jsx
│   │   ├── TreatmentHistoryTab.jsx
│   │   └── PaymentHistoryTab.jsx
│   ├── Appointments/
│   │   ├── AppointmentModal.jsx
│   │   └── AppointmentDetailPanel.jsx
│   ├── Treatments/
│   │   └── TreatmentModal.jsx
│   └── Billing/
│       ├── InvoiceModal.jsx
│       └── PaymentModal.jsx
└── Utils/
    └── can.js

resources/views/
├── app.blade.php
└── pdf/
    └── receipt.blade.php
```

---

## Local Setup

**Prerequisites:** PHP 8.2+, Composer, Node.js 20+

```bash
# 1. Clone and install
git clone https://github.com/your-username/bobbydent-crm.git
cd bobbydent-crm
composer install
npm install

# 2. Environment
cp .env.example .env
php artisan key:generate
# In .env, set:
# DB_CONNECTION=sqlite
# DB_DATABASE=/absolute/path/to/database/database.sqlite

# 3. Database
touch database/database.sqlite
php artisan migrate --seed

# 4. Run
php artisan serve   # http://localhost:8000
npm run dev
```

**Demo credentials:**

| Role | Email | Password |
|---|---|---|
| Admin | admin@bobbydent.com | password |
| Receptionist | reception@bobbydent.com | password |
| Dentist | dentist@bobbydent.com | password |