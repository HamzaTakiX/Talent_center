"""
Cross-app signal hooks that feed activity tracking and schedule
intelligence recomputation when platform data changes.
"""

from __future__ import annotations

import threading

from django.db import transaction
from django.db.models.signals import post_save
from django.dispatch import receiver

from apps.accounts_et_roles.models import StudentProfile

from .jobs.celery_tasks import schedule_student_recompute
from .services import activity_tracking_service


def _run_profile_intelligence_side_effects(profile_id: int) -> None:
    """Activity log + intelligence recompute — must not block HTTP onboarding paths."""
    from apps.accounts_et_roles.models import StudentProfile as StudentProfileModel

    try:
        profile = StudentProfileModel.objects.get(pk=profile_id)
    except StudentProfileModel.DoesNotExist:
        return

    activity_tracking_service.track_action(
        student_profile=profile,
        source_app='accounts_et_roles',
        action_code='profile.updated',
    )
    schedule_student_recompute(profile_id)


def _defer_profile_intelligence_side_effects(profile_id: int) -> None:
    threading.Thread(
        target=_run_profile_intelligence_side_effects,
        args=(profile_id,),
        name=f'profile-intel-{profile_id}',
        daemon=True,
    ).start()


def _schedule_recompute(profile: StudentProfile) -> None:
    profile_id = profile.pk
    transaction.on_commit(lambda: schedule_student_recompute(profile_id))


@receiver(post_save, sender=StudentProfile)
def on_student_profile_updated(sender, instance: StudentProfile, created: bool, **kwargs):
    if created:
        return
    profile_id = instance.pk
    transaction.on_commit(lambda: _defer_profile_intelligence_side_effects(profile_id))


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
            _schedule_recompute(instance.student_profile)
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
                _schedule_recompute(instance.student_profile)
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
            _schedule_recompute(profile)
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
            _schedule_recompute(instance.student_profile)
    except Exception:
        pass
