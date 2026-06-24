"""
Cross-app signal hooks that feed activity tracking and schedule
intelligence recomputation when platform data changes.
"""

from __future__ import annotations

from django.db.models.signals import post_save
from django.dispatch import receiver

from apps.accounts_et_roles.models import StudentProfile

from .jobs.celery_tasks import schedule_student_recompute
from .services import activity_tracking_service


def _schedule(profile: StudentProfile) -> None:
    schedule_student_recompute(profile.pk)


@receiver(post_save, sender=StudentProfile)
def on_student_profile_updated(sender, instance: StudentProfile, created: bool, **kwargs):
    if not created:
        activity_tracking_service.track_action(
            student_profile=instance,
            source_app='accounts_et_roles',
            action_code='profile.updated',
        )
        _schedule(instance)


def register_cross_app_hooks() -> None:
    """Wire receivers for models in other apps — called from AppConfig.ready()."""
    try:
        from apps.stage.models import OfferApplication

        @receiver(post_save, sender=OfferApplication)
        def on_application_saved(sender, instance, created, **kwargs):
            activity_tracking_service.track_action(
                student_profile=instance.student_profile,
                source_app='stage',
                action_code='application.submitted' if created else 'application.updated',
                metadata={'application_id': instance.pk, 'status': instance.status},
            )
            _schedule(instance.student_profile)
    except Exception:
        pass

    try:
        from apps.cv_intelligence.models import CvIntelligenceReport

        @receiver(post_save, sender=CvIntelligenceReport)
        def on_cv_intel_report_saved(sender, instance, created, **kwargs):
            if instance.status == 'COMPLETED':
                activity_tracking_service.track_action(
                    student_profile=instance.student_profile,
                    source_app='cv_intelligence',
                    action_code='cv.analysis.completed',
                    metadata={
                        'report_id': instance.pk,
                        'global_score': instance.global_score,
                    },
                )
                _schedule(instance.student_profile)
    except Exception:
        pass

    try:
        from apps.career_coach.models import AiConversation

        @receiver(post_save, sender=AiConversation)
        def on_coach_message_saved(sender, instance, created, **kwargs):
            if not created or instance.role != 'user':
                return
            profile = getattr(instance.user, 'student_profile', None)
            if profile is None:
                return
            activity_tracking_service.track_action(
                student_profile=profile,
                source_app='career_coach',
                action_code='coach.message',
                metadata={'session_id': str(instance.session_id)},
            )
            _schedule(profile)
    except Exception:
        pass

    try:
        from apps.announcements.models import StudentAnnouncementAction

        @receiver(post_save, sender=StudentAnnouncementAction)
        def on_announcement_action_saved(sender, instance, created, **kwargs):
            if not created:
                return
            activity_tracking_service.track_action(
                student_profile=instance.student_profile,
                source_app='announcements',
                action_code=f'announcement.{instance.action_type.lower()}',
                metadata={'announcement_id': instance.announcement_id},
            )
            _schedule(instance.student_profile)
    except Exception:
        pass
