"""Persistent conversation memory for the AI Career Coach."""

from __future__ import annotations

import uuid

from django.conf import settings
from django.db import models


class AiCoachSession(models.Model):
    """Session metadata for grouped AI coaching conversations."""

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='ai_coach_sessions',
    )
    session_id = models.UUIDField(default=uuid.uuid4, db_index=True)
    title = models.CharField(max_length=255, blank=True, default='')
    mode = models.CharField(max_length=32, blank=True, default='career-coach')
    is_archived = models.BooleanField(default=False, db_index=True)
    chat_summary = models.JSONField(default=dict, blank=True)
    chat_summary_message_count = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True, db_index=True)

    class Meta:
        db_table = 'ai_coach_sessions'
        ordering = ['-updated_at']
        constraints = [
            models.UniqueConstraint(fields=['user', 'session_id'], name='ai_coach_session_user_session_uniq'),
        ]
        indexes = [
            models.Index(fields=['user', 'is_archived', '-updated_at']),
        ]

    def __str__(self) -> str:
        label = self.title or str(self.session_id)
        return f'{label} ({self.user_id})'


class AiConversation(models.Model):
    """Flat message store — one row per message in a coaching session."""

    class Role(models.TextChoices):
        USER = 'user', 'User'
        ASSISTANT = 'assistant', 'Assistant'
        SYSTEM = 'system', 'System'

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='ai_conversations',
    )
    session_id = models.UUIDField(default=uuid.uuid4, db_index=True)
    role = models.CharField(max_length=16, choices=Role.choices)
    message = models.TextField()
    mode = models.CharField(max_length=32, blank=True, default='career-coach')
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        db_table = 'ai_conversations'
        ordering = ['created_at']
        indexes = [
            models.Index(fields=['user', 'session_id', 'created_at']),
        ]

    def __str__(self) -> str:
        return f'{self.role}@{self.session_id} ({self.created_at:%Y-%m-%d %H:%M})'
