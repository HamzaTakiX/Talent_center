import os

from channels.routing import ProtocolTypeRouter, URLRouter
from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')

django_asgi_app = get_asgi_application()

from apps.chat.middleware import JWTAuthMiddlewareStack  # noqa: E402
from apps.career_coach.routing import websocket_urlpatterns as career_coach_websocket_urlpatterns  # noqa: E402
from apps.chat.routing import websocket_urlpatterns as chat_websocket_urlpatterns  # noqa: E402
from apps.notifications.websocket.routing import websocket_urlpatterns as notification_websocket_urlpatterns  # noqa: E402

application = ProtocolTypeRouter(
    {
        'http': django_asgi_app,
        'websocket': JWTAuthMiddlewareStack(
            URLRouter(
                chat_websocket_urlpatterns
                + notification_websocket_urlpatterns
                + career_coach_websocket_urlpatterns
            ),
        ),
    }
)
