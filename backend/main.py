from nai_membership.wsgi import application

# Vercel looks for an app variable when it starts a Python service
app = application
