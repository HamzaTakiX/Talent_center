"""
Calendar WebSocket consumer.

Mirrors ``apps.notifications.websocket.consumers``: same Channels stack, same
``JWTAuthMiddlewareStack``, one group per user.

The pushed message carries only an action and an event id. Clients refetch
through the authorized REST API, so the socket cannot become a path around the
visibility rules — a listener who is no longer allowed to read an event gets
nothing back when they refetch.
"""

from __future__ import annotations

from channels.generic.websocket import AsyncJsonWebsocketConsumer
from django.contrib.auth.models import AnonymousUser


class AgendaConsumer(AsyncJsonWebsocketConsumer):
    user_group: str

    async def connect(self):
        user = self.scope.get('user')
        if not user or isinstance(user, AnonymousUser) or not user.is_authenticated:
            await self.close(code=4401)
            return

        self.user_group = f'agenda_user_{user.pk}'
        await self.channel_layer.group_add(self.user_group, self.channel_name)
        await self.accept()
        await self.send_json({'event_type': 'connected'})

    async def disconnect(self, code):
        if hasattr(self, 'user_group'):
            await self.channel_layer.group_discard(self.user_group, self.channel_name)

    async def receive_json(self, content, **kwargs):
        if (content.get('type') or content.get('event_type')) == 'ping':
            await self.send_json({'event_type': 'pong'})

    async def agenda_event(self, event):
        await self.send_json({'event_type': 'agenda.event', **event.get('payload', {})})
