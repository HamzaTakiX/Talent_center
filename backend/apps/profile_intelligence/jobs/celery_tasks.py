"""Celery background jobs for Student Intelligence scoring."""

from __future__ import annotations

import logging

logger = logging.getLogger(__name__)


def schedule_student_recompute(student_profile_id: int) -> None:
    """Enqueue async recompute or run synchronously when Celery is unavailable."""
    try:
        from .celery_tasks import recompute_student_intelligence_task
        if recompute_student_intelligence_task is not None:
            recompute_student_intelligence_task.delay(student_profile_id)
            return
    except Exception:
        pass

    from apps.accounts_et_roles.models import StudentProfile
    from apps.profile_intelligence.services.student_intelligence_service import (
        recompute_student_intelligence,
    )

    try:
        student = StudentProfile.objects.get(pk=student_profile_id)
        recompute_student_intelligence(student)
    except StudentProfile.DoesNotExist:
        logger.warning('Student profile %s not found for intelligence recompute', student_profile_id)


try:
    from celery import shared_task

    @shared_task(bind=True, max_retries=2, default_retry_delay=60)
    def recompute_student_intelligence_task(self, student_profile_id: int) -> dict:
        from apps.accounts_et_roles.models import StudentProfile
        from apps.profile_intelligence.services.student_intelligence_service import (
            recompute_student_intelligence,
        )

        try:
            student = StudentProfile.objects.get(pk=student_profile_id)
            indicator = recompute_student_intelligence(student)
            return {
                'student_profile_id': student_profile_id,
                'risk_score': indicator.risk_score,
                'engagement_score': indicator.engagement_score,
            }
        except StudentProfile.DoesNotExist:
            return {'error': 'not_found'}
        except Exception as exc:
            logger.exception('Intelligence recompute failed for %s', student_profile_id)
            raise self.retry(exc=exc) from exc

    @shared_task
    def recompute_all_students_intelligence_task() -> dict:
        from apps.profile_intelligence.services.student_intelligence_service import (
            recompute_students_batch,
        )
        count = recompute_students_batch()
        return {'processed': count}

except ImportError:
    recompute_student_intelligence_task = None
    recompute_all_students_intelligence_task = None
