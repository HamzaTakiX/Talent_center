from celery import shared_task

from apps.announcements.services.publication import (
    process_expired_announcements,
    process_scheduled_publications,
)


@shared_task(name='announcements.process_scheduled_publications')
def process_scheduled_announcement_publications() -> dict:
    published = process_scheduled_publications()
    expired = process_expired_announcements()
    return {'published': published, 'expired': expired}
