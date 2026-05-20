"""Seed global channels and system tags."""

from __future__ import annotations

from django.db import transaction

from ..constants import GLOBAL_CHANNEL_SEEDS, SYSTEM_TAG_SEEDS
from ..models import Channel, Tag


@transaction.atomic
def seed_chat_infrastructure() -> dict[str, int]:
    channels_created = 0
    for item in GLOBAL_CHANNEL_SEEDS:
        _, created = Channel.objects.update_or_create(
            code=item['code'],
            defaults={
                'name': item['name'],
                'description': item['description'],
                'channel_type': item['channel_type'],
                'metadata_json': {'enterprise': True},
            },
        )
        if created:
            channels_created += 1

    tags_created = 0
    for item in SYSTEM_TAG_SEEDS:
        _, created = Tag.objects.update_or_create(
            code=item['code'],
            defaults={
                'name': item['name'],
                'color': item['color'],
                'is_system': True,
            },
        )
        if created:
            tags_created += 1

    return {'channels_created': channels_created, 'tags_created': tags_created}
