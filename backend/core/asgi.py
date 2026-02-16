import os
from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings.development')
django_asgi_app = get_asgi_application()

from django.urls import path, re_path
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from apps.ai_tutor import routing as ai_tutor_routing
from apps.notifications import routing as notifications_routing
from core.middleware import JWTAuthMiddleware

# WebSocket URL patterns
ws_urlpatterns = [
    path('ws/chat/<uuid:session_id>/', ai_tutor_routing.consumers.ChatConsumer.as_asgi()),
    path('ws/notifications/', notifications_routing.consumers.NotificationConsumer.as_asgi()),
]

application = ProtocolTypeRouter({
    'http': django_asgi_app,
    'websocket': AuthMiddlewareStack(
        JWTAuthMiddleware(
            URLRouter(
                ws_urlpatterns
            )
        )
    ),
})