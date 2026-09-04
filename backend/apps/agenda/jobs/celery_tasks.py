"""
Celery tasks for the calendar.

Follows the existing pattern (``apps.notifications.jobs.celery_tasks``): tasks
are autodiscovered by ``core.celery``, and run inline when no Redis is
configured because ``CELERY_TASK_ALWAYS_EAGER`` is set in that case.

Schedule ``agenda.dispatch_reminders`` every minute (Celery beat, or the
equivalent management command from an external scheduler).
"""

from __future__ import annotations

import logging

from celery import shared_task

logger = logging.getLogger(__name__)


@shared_task(name='agenda.dispatch_reminders')
def dispatch_reminders_task(grace_minutes: int = 10) -> int:
    from apps.agenda.services.reminders import dispatch_due_reminders

    sent = dispatch_due_reminders(grace_minutes=grace_minutes)
    if sent:
        logger.info('Dispatched %s calendar reminder(s)', sent)
    return sent
