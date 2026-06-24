"""WebSocket consumer for real-time in-app notifications."""

from __future__ import annotations

from channels.generic.websocket import AsyncJsonWebsocketConsumer
from django.contrib.auth.models import AnonymousUser


class NotificationConsumer(AsyncJsonWebsocketConsumer):
    user_group: str

    async def connect(self):
        user = self.scope.get('user')
        if not user or isinstance(user, AnonymousUser) or not user.is_authenticated:
            await self.close(code=4401)
            return

        self.user_group = f'notifications_user_{user.pk}'
        await self.channel_layer.group_add(self.user_group, self.channel_name)
        await self.accept()
        await self.send_json({'event_type': 'connected'})

    async def disconnect(self, code):
        if hasattr(self, 'user_group'):
            await self.channel_layer.group_discard(self.user_group, self.channel_name)

    async def receive_json(self, content, **kwargs):
        event_type = content.get('type') or content.get('event_type')
        if event_type == 'ping':
            await self.send_json({'event_type': 'pong'})

    async def notification_new(self, event):
        await self.send_json({'event_type': 'notification.created', **event.get('payload', {})})

    async def notification_read(self, event):
        await self.send_json({'event_type': 'notification.read', **event.get('payload', {})})

    async def notification_unread_count(self, event):
        await self.send_json({'event_type': 'notification.unread_count', **event.get('payload', {})})
