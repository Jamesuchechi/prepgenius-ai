import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings.development')

django_asgi_app = get_asgi_application()

# Placeholder for WebSocket routing
ws_urlpatterns = [
    # Will be populated with WebSocket routes
]

application = ProtocolTypeRouter({
    'http': django_asgi_app,
    'websocket': AuthMiddlewareStack(
        URLRouter(
            ws_urlpatterns
        )
    ),
})