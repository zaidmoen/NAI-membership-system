import os

from django.core.asgi import get_asgi_application


os.environ.setdefault("DJANGO_SETTINGS_MODULE", "nai_membership.settings")

app = get_asgi_application()
application = app
