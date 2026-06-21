"""Base resolver utilities."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Iterable

from django.contrib.auth import get_user_model

User = get_user_model()


@dataclass
class ResolvedRecipient:
    user: User
    role: str = ''


def dedupe_users(users: Iterable[User]) -> list[User]:
    seen: set[int] = set()
    result: list[User] = []
    for user in users:
        if not user or not getattr(user, 'pk', None) or user.pk in seen:
            continue
        if not getattr(user, 'is_active', True):
            continue
        seen.add(user.pk)
        result.append(user)
    return result
