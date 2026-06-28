"""WebSocket consumers for real-time chat."""

from __future__ import annotations

import json
from typing import Any

from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from django.contrib.auth.models import AnonymousUser

from apps.chat.permissions import user_can_access_conversation
from apps.chat.services.presence import mark_offline, mark_online, touch_presence
from apps.chat.services.realtime import publish_typing


class ChatConversationConsumer(AsyncJsonWebsocketConsumer):
    conversation_id: int
    conv_group: str

    async def connect(self):
        user = self.scope.get('user')
        if not user or isinstance(user, AnonymousUser) or not user.is_authenticated:
            await self.close(code=4401)
            return

        raw_id = self.scope['url_route']['kwargs'].get('conversation_id')
        try:
            self.conversation_id = int(raw_id)
        except (TypeError, ValueError):
            await self.close(code=4400)
            return

        allowed = await self._can_access(user.pk, self.conversation_id)
        if not allowed:
            await self.close(code=4403)
            return

        self.conv_group = f'chat_conv_{self.conversation_id}'

        await self.channel_layer.group_add(self.conv_group, self.channel_name)
        await self.accept()
        await self._set_online(user.pk)
        await self.send_json({'event_type': 'connected', 'conversation_id': self.conversation_id})

    async def disconnect(self, code):
        user = self.scope.get('user')
        if hasattr(self, 'conv_group'):
            await self.channel_layer.group_discard(self.conv_group, self.channel_name)
        if user and not isinstance(user, AnonymousUser) and user.is_authenticated:
            await self._set_offline(user.pk)

    async def receive_json(self, content: dict[str, Any], **kwargs):
        user = self.scope.get('user')
        if not user or isinstance(user, AnonymousUser):
            return

        event_type = content.get('type') or content.get('event_type')
        if event_type == 'typing':
            is_typing = bool(content.get('is_typing', True))
            await database_sync_to_async(publish_typing)(
                self.conversation_id,
                user.pk,
                is_typing,
            )
        elif event_type == 'ping':
            await self._touch_presence(user.pk)
            await self.send_json({'event_type': 'pong'})

    async def chat_message(self, event):
        await self.send_json(event.get('payload', event))

    async def chat_typing(self, event):
        payload = event.get('payload', {})
        if payload.get('user_id') == self.scope['user'].pk:
            return
        await self.send_json({'event_type': 'typing', **payload})

    async def chat_read_receipt(self, event):
        await self.send_json({'event_type': 'read_receipt', **event.get('payload', {})})

    async def chat_presence(self, event):
        await self.send_json({'event_type': 'presence', **event.get('payload', {})})

    async def chat_conversation_updated(self, event):
        await self.send_json({'event_type': 'conversation.updated', **event.get('payload', {})})

    @database_sync_to_async
    def _can_access(self, user_id: int, conversation_id: int) -> bool:
        from apps.chat.models import Conversation
        from django.contrib.auth import get_user_model

        user = get_user_model().objects.filter(pk=user_id).first()
        conv = Conversation.objects.filter(pk=conversation_id).select_related('context').first()
        if not user or not conv:
            return False
        return user_can_access_conversation(user, conv)

    @database_sync_to_async
    def _set_online(self, user_id: int):
        mark_online(user_id)

    @database_sync_to_async
    def _set_offline(self, user_id: int):
        mark_offline(user_id)

    @database_sync_to_async
    def _touch_presence(self, user_id: int):
        touch_presence(user_id)


class ChatPresenceConsumer(AsyncJsonWebsocketConsumer):
    """User-wide inbox channel for unread counters and cross-conversation events."""

    async def connect(self):
        user = self.scope.get('user')
        if not user or isinstance(user, AnonymousUser) or not user.is_authenticated:
            await self.close(code=4401)
            return

        self.user_group = f'chat_user_{user.pk}'
        await self.channel_layer.group_add(self.user_group, self.channel_name)
        await self.accept()
        await self._set_online(user.pk)
        await self.send_json({'event_type': 'connected', 'scope': 'presence'})

    async def disconnect(self, code):
        user = self.scope.get('user')
        if hasattr(self, 'user_group'):
            await self.channel_layer.group_discard(self.user_group, self.channel_name)
        if user and not isinstance(user, AnonymousUser) and user.is_authenticated:
            await self._set_offline(user.pk)

    async def receive_json(self, content: dict[str, Any], **kwargs):
        user = self.scope.get('user')
        if not user or isinstance(user, AnonymousUser):
            return
        if (content.get('type') or content.get('event_type')) == 'ping':
            await self._touch_presence(user.pk)
            await self.send_json({'event_type': 'pong'})

    async def chat_message(self, event):
        await self.send_json(event.get('payload', event))

    async def chat_typing(self, event):
        await self.send_json({'event_type': 'typing', **event.get('payload', {})})

    async def chat_read_receipt(self, event):
        await self.send_json({'event_type': 'read_receipt', **event.get('payload', {})})

    async def chat_presence(self, event):
        await self.send_json({'event_type': 'presence', **event.get('payload', {})})

    async def chat_conversation_updated(self, event):
        await self.send_json({'event_type': 'conversation.updated', **event.get('payload', {})})

    @database_sync_to_async
    def _set_online(self, user_id: int):
        mark_online(user_id)

    @database_sync_to_async
    def _set_offline(self, user_id: int):
        mark_offline(user_id)

    @database_sync_to_async
    def _touch_presence(self, user_id: int):
        touch_presence(user_id)
