"""WebSocket consumer for streaming career coach responses."""

from __future__ import annotations

import json
import uuid

from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from django.contrib.auth.models import AnonymousUser

from apps.career_coach.services.coach_service import chat_stream, get_student


class CareerCoachConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        user = self.scope.get('user')
        if not user or isinstance(user, AnonymousUser) or not user.is_authenticated:
            await self.close(code=4401)
            return

        student = await self._get_student(user)
        if not student:
            await self.close(code=4403)
            return

        self.user = user
        self.session_group = f'career_coach_user_{user.pk}'
        await self.channel_layer.group_add(self.session_group, self.channel_name)
        await self.accept()
        await self.send_json({'event_type': 'connected', 'provider': 'career_coach'})

    async def disconnect(self, code):
        if hasattr(self, 'session_group'):
            await self.channel_layer.group_discard(self.session_group, self.channel_name)

    async def receive_json(self, content, **kwargs):
        if not hasattr(self, 'user'):
            return

        event_type = content.get('type') or content.get('event_type')
        if event_type == 'ping':
            await self.send_json({'event_type': 'pong'})
            return

        if event_type != 'chat':
            return

        message = (content.get('message') or '').strip()
        if not message:
            await self.send_json({'event_type': 'error', 'message': 'Empty message.'})
            return

        mode = content.get('mode', 'career-coach')
        offer_uuid = content.get('offer_uuid')
        raw_session = content.get('session_id')
        session_id = None
        if raw_session:
            try:
                session_id = uuid.UUID(str(raw_session))
            except ValueError:
                pass

        await self.send_json({'event_type': 'typing', 'is_typing': True})

        events = await self._run_chat_stream(message, mode, session_id, offer_uuid)
        for event in events:
            await self.send_json({'event_type': 'stream', 'payload': event})

        await self.send_json({'event_type': 'typing', 'is_typing': False})

    @database_sync_to_async
    def _run_chat_stream(self, message, mode, session_id, offer_uuid):
        return list(
            chat_stream(
                self.user,
                message=message,
                session_id=session_id,
                mode=mode,
                offer_uuid=offer_uuid,
            )
        )

    @database_sync_to_async
    def _get_student(self, user):
        return get_student(user)
