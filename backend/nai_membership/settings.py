import os
from pathlib import Path
from urllib.parse import parse_qs, unquote, urlsplit

from django.core.exceptions import ImproperlyConfigured
from dotenv import load_dotenv


BASE_DIR = Path(__file__).resolve().parent.parent
PROJECT_ROOT = BASE_DIR.parent
load_dotenv(PROJECT_ROOT / ".env")

LOCAL_SECRET_KEY = "dev-only-not-for-production"
IS_VERCEL = os.environ.get("VERCEL") == "1"

SECRET_KEY = os.environ.get("DJANGO_SECRET_KEY", LOCAL_SECRET_KEY)
DEBUG = os.environ.get("DJANGO_DEBUG", "False" if IS_VERCEL else "True").lower() == "true"

if not DEBUG and SECRET_KEY == LOCAL_SECRET_KEY:
    raise ImproperlyConfigured("Set DJANGO_SECRET_KEY before running with DEBUG disabled")

vercel_hosts = [
    os.environ[key].removeprefix("https://").removeprefix("http://").split("/", 1)[0]
    for key in ("VERCEL_URL", "VERCEL_BRANCH_URL")
    if os.environ.get(key)
]

ALLOWED_HOSTS = list(dict.fromkeys([
    *[
        host.strip()
        for host in os.environ.get(
            "DJANGO_ALLOWED_HOSTS",
            "localhost,127.0.0.1,nai-membership-system.vercel.app",
        ).split(",")
        if host.strip()
    ],
    *vercel_hosts,
]))

default_csrf_origins = "http://localhost:5173,http://127.0.0.1:5173" if DEBUG else ""
CSRF_TRUSTED_ORIGINS = [
    origin.strip()
    for origin in os.environ.get("DJANGO_CSRF_TRUSTED_ORIGINS", default_csrf_origins).split(",")
    if origin.strip()
]

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "rest_framework",
    "members",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "nai_membership.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "nai_membership.wsgi.application"
ASGI_APPLICATION = "nai_membership.asgi.application"


def get_database_settings(database_url):
    if not database_url:
        # Keep local setup simple for teammates who have not added a database URL yet
        return {
            "default": {
                "ENGINE": "django.db.backends.sqlite3",
                "NAME": BASE_DIR / "db.sqlite3",
            }
        }

    parsed_url = urlsplit(database_url)
    if parsed_url.scheme not in {"postgres", "postgresql"}:
        raise ImproperlyConfigured("DATABASE_URL must use postgres or postgresql")

    database_name = unquote(parsed_url.path.lstrip("/"))
    if not all((parsed_url.hostname, parsed_url.username, parsed_url.password, database_name)):
        raise ImproperlyConfigured("DATABASE_URL must include a host, database, username, and password")

    try:
        port = parsed_url.port or 5432
    except ValueError as error:
        raise ImproperlyConfigured("DATABASE_URL has an invalid port") from error

    query_options = parse_qs(parsed_url.query)
    # Keep the Supabase connection encrypted even if sslmode is missing from the URL
    sslmode = query_options.get("sslmode", ["require"])[0]

    return {
        "default": {
            "ENGINE": "django.db.backends.postgresql",
            "NAME": database_name,
            "USER": unquote(parsed_url.username),
            "PASSWORD": unquote(parsed_url.password),
            "HOST": parsed_url.hostname,
            "PORT": port,
            "CONN_MAX_AGE": int(os.environ.get("DB_CONN_MAX_AGE", "0" if IS_VERCEL else "60")),
            "CONN_HEALTH_CHECKS": True,
            "OPTIONS": {"sslmode": sslmode},
        }
    }


DATABASES = get_database_settings(os.environ.get("DATABASE_URL", "").strip())

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework.authentication.SessionAuthentication",
    ],
}

LANGUAGE_CODE = "en-us"
TIME_ZONE = os.environ.get("DJANGO_TIME_ZONE", "Asia/Hebron")
USE_I18N = True
USE_TZ = True

SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
SESSION_COOKIE_SECURE = not DEBUG
CSRF_COOKIE_SECURE = not DEBUG

STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"
