"""JWT authentication middleware for Django Channels WebSockets."""

from __future__ import annotations

from urllib.parse import parse_qs

from channels.db import database_sync_to_async
from channels.middleware import BaseMiddleware
from django.contrib.auth import get_user_model
from django.contrib.auth.models import AnonymousUser
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from rest_framework_simplejwt.tokens import AccessToken

User = get_user_model()


@database_sync_to_async
def _resolve_user(token_key: str):
    try:
        token = AccessToken(token_key)
        user_id = token.get('user_id')
        if not user_id:
            return AnonymousUser()
        return User.objects.filter(pk=user_id, is_active=True).first() or AnonymousUser()
    except (InvalidToken, TokenError, User.DoesNotExist):
        return AnonymousUser()


class JWTAuthMiddleware(BaseMiddleware):
    async def __call__(self, scope, receive, send):
        query = scope.get('query_string', b'').decode()
        params = parse_qs(query)
        token = params.get('token', [None])[0]
        scope['user'] = await _resolve_user(token) if token else AnonymousUser()
        return await super().__call__(scope, receive, send)


def JWTAuthMiddlewareStack(inner):
    return JWTAuthMiddleware(inner)
