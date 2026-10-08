# NAI Membership System

A membership registration and payment tracking system for the Najah AI Society

## Project stack

- Backend: Django and Django REST Framework
- Frontend: React, planned for a later task

## Current status

The Django backend starter is in place with a health-check endpoint. Student registration and administrator features will be added in later tasks

The local development setup uses SQLite until the team confirms the database for the full system

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

Move into the backend folder, prepare the local database, run the tests, and start Django

```powershell
cd backend
python manage.py migrate
python manage.py test
python manage.py runserver
```

The health endpoint is available at `http://127.0.0.1:8000/api/health/`

## Environment settings

The project has a local-only development secret key so it can start during development. Set `DJANGO_SECRET_KEY` and `DJANGO_DEBUG=False` before using a deployed environment

Optional settings:
- `DJANGO_ALLOWED_HOSTS`: comma-separated host names
- `DJANGO_TIME_ZONE`: Django time zone, defaults to `Asia/Hebron`

See [the requirements specification](docs/requirements.md) for product behavior and MVP scope
