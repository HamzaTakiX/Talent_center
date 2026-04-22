"""
Signal receivers that feed the intelligence layer from other apps.

Cross-app coupling rule: other apps do NOT import this module. They
either raise a Django signal we subscribe to here, or they call the
service layer directly. Either way, this app stays the only place
that *writes* to its own tables.
"""

from __future__ import annotations

from django.contrib.auth.signals import user_logged_in
from django.db.models.signals import post_save
from django.dispatch import receiver

from apps.accounts_et_roles.models import StudentProfile
from apps.cv_builder.models import StudentCv

from .models import (
    StudentProfileContext,
    StudentProfileModuleData,
    StudentProfileModuleRegistry,
)
from .services import activity_tracking_service


# ---------------------------------------------------------------------------
# Auth: user_logged_in → activity log
# ---------------------------------------------------------------------------

@receiver(user_logged_in)
def on_user_logged_in(sender, user, request, **kwargs):
    """Log a LOGIN activity when a student user logs in."""
    profile = getattr(user, 'student_profile', None)
    if profile is None:
        return
    activity_tracking_service.track_login(
        student_profile=profile,
        source_app='authentication',
        metadata={
            'user_id': user.pk,
            'auth_provider': getattr(user, 'auth_provider', ''),
        },
    )


# ---------------------------------------------------------------------------
# CV builder: StudentCv saved → context + module data
# ---------------------------------------------------------------------------

_CV_MODULE_CODE = 'cv_builder'


def _get_or_create_cv_module() -> StudentProfileModuleRegistry:
    module, _ = StudentProfileModuleRegistry.objects.get_or_create(
        module_code=_CV_MODULE_CODE,
        defaults={
            'module_name': 'CV Builder',
            'source_app': 'cv_builder',
            'is_active': True,
        },
    )
    return module


@receiver(post_save, sender=StudentCv)
def on_cv_saved(sender, instance: StudentCv, created: bool, **kwargs):
    """
    Refresh the CV context/module data when a StudentCv is created or
    updated. We summarise the CV into a JSON payload — we do NOT copy
    its content; the cv_builder app remains the source of truth.
    """
    profile = instance.student_profile

    summary = {
        'has_cv': True,
        'is_primary': instance.is_primary,
        'status': instance.status,
        'current_score': instance.current_score,
        'last_analyzed_at': (
            instance.last_analyzed_at.isoformat() if instance.last_analyzed_at else None
        ),
    }

    StudentProfileContext.objects.update_or_create(
        student_profile=profile,
        context_code='cv_completion',
        defaults={
            'source_app': 'cv_builder',
            'summary_json': summary,
            'status': StudentProfileContext.Status.ACTIVE,
        },
    )

    module = _get_or_create_cv_module()
    # Aggregate across all of a student's CVs so the module card shows
    # the best score and total count, not just this single save.
    cv_qs = profile.cvs.all()
    metrics = {
        'cv_count': cv_qs.count(),
        'best_score': max(
            (cv.current_score for cv in cv_qs if cv.current_score is not None),
            default=None,
        ),
    }
    StudentProfileModuleData.objects.update_or_create(
        student_profile=profile,
        module=module,
        defaults={
            'summary_json': summary,
            'metrics_json': metrics,
        },
    )

    activity_tracking_service.track_action(
        student_profile=profile,
        source_app='cv_builder',
        action_code='cv.created' if created else 'cv.updated',
        metadata={'cv_id': instance.pk, 'status': instance.status},
    )


# ---------------------------------------------------------------------------
# Accounts: ensure every new StudentProfile has an indicator row
# ---------------------------------------------------------------------------

@receiver(post_save, sender=StudentProfile)
def on_student_profile_saved(sender, instance: StudentProfile, created: bool, **kwargs):
    if created:
        from .models import StudentProfileIndicator, StudentProfileStateTransition

        StudentProfileIndicator.objects.get_or_create(student_profile=instance)
        StudentProfileStateTransition.objects.create(
            student_profile=instance,
            from_state='',
            to_state=StudentProfileStateTransition.State.NEW,
            trigger_type=StudentProfileStateTransition.TriggerType.SYSTEM,
            reason='profile created',
        )
