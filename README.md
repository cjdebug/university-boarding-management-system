# University Boarding Management System

A web-based application for managing university boarding operations through separate **Owner** and **Student** interfaces. The system brings together resident records, room allocation, fee collection, attendance, requests, communication, and analytical reporting in one application.

## Overview

The University Boarding Management System aims to reduce manual recordkeeping and make boarding-house administration more organized, accessible, and transparent. Owners can manage boarding operations and review reports, while students can view their information and interact with the boarding service through their own interface.

## Features

### Owner interface

- **Dashboard:** View key boarding-management information.
- **Student management:** Add, view, and update student records.
- **Room management:** Manage rooms and student room allocations.
- **Fees and payments:** Create and manage fee records, record payments, and review payment history and overdue fees.
- **Attendance:** Mark, update, and review attendance, including bulk attendance operations.
- **Leave requests:** Review and manage student leave requests.
- **Maintenance:** Manage maintenance requests and view room maintenance history.
- **Complaints and feedback:** Review and manage submitted complaints and student feedback.
- **Announcements:** Publish and manage information intended for students or residents.
- **Reports:** Generate filtered analytical reports with statistics, charts, descriptive findings, and browser-based PDF printing.

### Student interface

- **Dashboard:** View student-facing boarding information.
- **Profile:** View and update supported profile details.
- **Room allocation:** View assigned-room information.
- **Attendance:** Review personal attendance records.
- **Fees and payments:** View personal payment history.
- **Leave requests:** Submit, view, and update supported leave requests.
- **Maintenance requests:** Submit, view, and update supported requests.
- **Complaints and feedback:** Submit, view, and update supported entries.
- **Announcements:** Access boarding-related communications where available in the student interface.

> The availability of edit or cancellation actions depends on the applicable record status and permissions.

## Analytical reports

The owner interface includes four analytical reports:

| Report | Main areas covered |
| --- | --- |
| **Fee & Payment Analytical Report** | Fee status, collection performance, outstanding balances, and payment trends |
| **Attendance Analytical Report** | Attendance status, attendance rates, student comparisons, and leave information |
| **Maintenance Analytical Report** | Request status, issue categories, room comparisons, and request trends |
| **Communication & Turnover Analytical Report** | Announcement status/audience and student feedback categories/status |

Report functionality includes date and applicable status filters, summary indicators, charts, descriptive analysis, and **Print / Save as PDF** through the browser.

**Reporting scope note:** Despite its existing name, the Communication & Turnover report currently measures announcements and student feedback. It does **not** calculate student move-in/move-out turnover.

## Technology stack

| Layer | Technology |
| --- | --- |
| Frontend | React, Vite, JavaScript, CSS |
| Charts | Recharts |
| Backend API | Python, FastAPI |
| Database access | SQLAlchemy |
| Database | MySQL |
| API documentation/testing | FastAPI Swagger UI |
| Version control | Git and GitHub |

## Project structure

```text
university-boarding-management-system/
├── backend/
│   └── app/
│       ├── core/
│       ├── database/
│       ├── models/
│       ├── routers/
│       ├── schemas/
│       └── services/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   │   ├── owner/
│   │   │   └── student/
│   │   ├── routes/
│   │   ├── services/
│   │   └── styles/
│   ├── package.json
│   └── package-lock.json
└── README.md
```

*This is a simplified directory overview, not an exhaustive file listing.*

## Getting started

### Prerequisites

- Git
- Python and pip (use the Python version supported by the project's dependencies)
- Node.js and npm (use a version supported by the frontend dependencies)
- MySQL Server
- A code editor such as Visual Studio Code

### 1. Clone the repository

```bash
git clone https://github.com/cjdebug/university-boarding-management-system.git
cd university-boarding-management-system
```

For the latest stable code, use the `main` branch:

```bash
git switch main
git pull --ff-only origin main
```

### 2. Configure the MySQL database

1. Start MySQL Server.
2. Create or restore the database required by the application.
3. Configure the backend's database connection using the settings expected by `backend/app/database/`.
4. If your project includes SQL scripts, seed data, or migration instructions, apply those before starting the API.

**Note:** Exact database name, credentials, environment-variable names, and database initialization commands depend on your repository's configuration. Do not commit real database passwords or secret keys.

### 3. Start the backend

From the repository root:

**Windows PowerShell:**

```powershell
cd backend
py -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python -m uvicorn app.main:app --reload
```

The dependency installation command assumes `backend/requirements.txt` exists. If dependencies are managed differently, use the dependency instructions included in your backend. The Uvicorn command assumes the FastAPI application is exposed as `app` in `backend/app/main.py`; confirm that entry point in your checkout.

When running with default Uvicorn settings, the API is usually available at:

- API: http://127.0.0.1:8000
- Swagger API documentation: http://127.0.0.1:8000/docs

### 4. Start the frontend

Open a **second terminal**, from the repository root:

```bash
cd frontend
npm install
npm run dev
```

Open the local URL displayed by Vite in your terminal (commonly `http://localhost:5173`). Ensure the frontend API configuration points to your running backend.

### 5. Access the application

Use valid application credentials for the appropriate role. The Owner and Student interfaces expose different functions according to their roles.

**Security:** Never include actual credentials, `.env` files, API keys, or database passwords in this README or in Git commits.

## Testing and verification

The following checks are recommended after installing or updating the project:

**Backend syntax check** (inside `backend/`):

```powershell
py -m compileall app
```

**Frontend production build** (inside `frontend/`):

```bash
npm run build
```

**Manual verification:**

1. Confirm the API starts and relevant endpoints respond in Swagger UI.
2. Verify Owner and Student login and navigation.
3. Test core create, view, update, and permitted status-change workflows.
4. Check that data is correctly saved to and retrieved from MySQL.
5. Generate each analytical report with and without filters.
6. Use the report's **Download PDF** action and select **Save as PDF** in the browser print dialog; check chart visibility and layout.
7. Check responsive layout and confirm changes do not break unrelated pages.

The owner-side workflows and reporting changes were tested during development. This statement does not imply that a complete automated test suite or production security assessment has been completed.

## Git workflow

- **`main`** — Stable integrated version of the project.
- **`develop`** — Development and integration branch.
- Implement and test changes on development/feature branches, then submit a pull request for review before merging into `main`.

To update an existing local copy after a release:

```bash
git status
git fetch origin
git switch main
git pull --ff-only origin main
```

Before switching branches or pulling, make sure local changes are committed or safely saved.

## Limitations and future improvements

- Add genuine resident turnover metrics based on move-in, checkout, and room allocation history.
- Extend automated testing and authorization/security checks.
- Add deployment-specific configuration and database migration documentation.
- Improve report export options and operational monitoring where needed.

## Project status

The current `main` branch contains the integrated boarding-management application and owner-side analytical reporting updates. The final release should still be verified in the intended deployment environment before production use.

## Repository

https://github.com/cjdebug/university-boarding-management-system
