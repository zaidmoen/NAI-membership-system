# NAI Membership System

A membership registration and payment tracking system for the Najah AI Society

## Project stack

- Backend: Django and Django REST Framework
- Frontend: React, Vite, and React Router

## Current status

The backend supports public student registration, protected student search and filtering, payment confirmation, and membership summary counts

The React frontend includes a public membership form and an administrator dashboard at `/manage`. Students submit their full name, major, university ID, and WhatsApp number. Administrators sign in with a Django staff account before they can view records or confirm payments

The local development setup uses SQLite. The team can choose another database before deployment

## Run the backend locally

From the repository root, create and activate a virtual environment

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

Install the backend requirements

```powershell
pip install -r backend/requirements.txt
```

Move into the backend folder and prepare the local database

```powershell
cd backend
python manage.py migrate
python manage.py createsuperuser
python manage.py test
python manage.py runserver
```

The Django admin sign-in page is available at `http://127.0.0.1:8000/admin/`. The React dashboard is available at `http://localhost:5173/manage` after starting the frontend. Use the same staff account for both

## Run the frontend locally

Open a second terminal from the repository root and run

```powershell
cd frontend
npm ci
npm run dev
```

Vite serves the frontend at `http://localhost:5173` and proxies `/api`, `/admin`, and `/static` requests to Django at `http://127.0.0.1:8000`. Set `VITE_API_TARGET` in `frontend/.env` if Django runs on a different address

## API endpoints

| Method | Endpoint | Access | Purpose |
| --- | --- | --- | --- |
| POST | `/api/students/register/` | Public | Submit a student's full name, major, university ID, and WhatsApp number |
| GET | `/api/students/` | Staff admin | List students, search, or filter by status |
| GET | `/api/students/summary/` | Staff admin | Get total, pending, and active member counts |
| POST | `/api/students/<id>/confirm-payment/` | Staff admin | Confirm an in-person payment |
| GET | `/api/health/` | Public | Check that the API is running |

Use `?search=` to search a student by name, university ID, or WhatsApp number. Use `?status=pending_payment` or `?status=active_member` to filter the list

Administrator API requests use a Django session from an authenticated staff account. Student registration does not require an account

## Environment settings

The project has a local-only development secret key so it can start during development. Set `DJANGO_SECRET_KEY` and `DJANGO_DEBUG=False` before using a deployed environment

Optional backend settings:
- `DJANGO_ALLOWED_HOSTS`: comma-separated host names
- `DJANGO_TIME_ZONE`: Django time zone, defaults to `Asia/Hebron`

See [the requirements specification](docs/requirements.md) for product behavior and MVP scope
