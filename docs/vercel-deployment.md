# Deploy the full app on Vercel

The repository contains a React frontend and a Django API. The root `vercel.json` deploys them as two Vercel Services under one domain, so browser requests to `/api`, `/admin`, and `/static` stay on the same origin.

## Vercel project settings

Use the existing Vercel project connected to this repository:

1. Set **Root Directory** to the repository root (`.`), not `frontend`.
2. Set **Framework Preset** to **Services**.
3. Keep the repository's root `vercel.json` as the routing configuration.
4. Add the environment variables below to Production and Preview as needed, then redeploy.

Services are currently a Vercel Beta feature. If the **Services** framework preset is unavailable for the account, don't change the project root yet; the fallback is to deploy the two folders as separate Vercel projects.

## Environment variables

Set these in **Project Settings → Environment Variables**:

| Key | Value |
| --- | --- |
| `DATABASE_URL` | The Supabase PostgreSQL connection URL already used by the Django backend |
| `DJANGO_SECRET_KEY` | A newly generated private Django secret key |
| `DJANGO_DEBUG` | `False` |
| `DJANGO_ALLOWED_HOSTS` | The Vercel production hostname, for example `nai-membership-system.vercel.app` |

Do not commit the real database URL or secret key. Generate a Django key locally with:

```sh
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

Vercel sets `VERCEL_URL` for deployment hosts, and Django adds that host automatically. The frontend calls `/api` on its own domain, so no frontend API URL or cross-origin CSRF setting is needed.

## Database

The existing Supabase database remains the source of truth, so existing student records and admin accounts stay there. If migrations are added later, run them against that same database before relying on the new schema.

## Verify after deployment

Open these on the Vercel domain:

- `/api/health/` should return JSON from Django
- `/api/students/` should return a Django authentication response when signed out, not the React HTML
- `/manage` should load the React admin dashboard
- Sign in and confirm that the student list loads and a payment can be confirmed
- `/admin/` should render Django admin with its styles
