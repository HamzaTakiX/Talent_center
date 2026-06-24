"""Publication workflow, scheduling, and auto-expiration."""

from __future__ import annotations

from datetime import datetime
from zoneinfo import ZoneInfo

from django.utils import timezone

from apps.announcements.models import (
    Announcement,
    AnnouncementInternshipDetails,
    AnnouncementPublicationLog,
    AnnouncementTarget,
)

DEFAULT_SCHEDULE_TIMEZONE = 'Africa/Casablanca'


def log_publication_action(
    announcement: Announcement,
    action: str,
    user,
    *,
    previous_status: str = '',
    note: str = '',
) -> None:
    AnnouncementPublicationLog.objects.create(
        announcement=announcement,
        action=action,
        performed_by=user,
        previous_status=previous_status,
        new_status=announcement.status,
        note=note,
    )


def _emit_audit(
    announcement: Announcement,
    *,
    action: str,
    event_code: str,
    summary: str,
    actor,
    old_values: dict | None = None,
    new_values: dict | None = None,
) -> None:
    try:
        from apps.history.audit import audit

        audit.emit(
            module='announcements',
            action=action,
            event_code=event_code,
            summary=summary,
            actor=actor,
            entity_type='announcement',
            entity_id=announcement.id,
            old_values=old_values or {},
            new_values=new_values or {},
            metadata={'announcement_id': announcement.id},
        )
    except Exception:
        pass


def _emit_published_notifications(announcement: Announcement, actor) -> None:
    try:
        from apps.notifications.events.publisher import emit_event

        targets = announcement.targets.all()
        filiere_ids = [t.filiere_id for t in targets if t.filiere_id]
        class_group_ids = [t.class_group_id for t in targets if t.class_group_id]
        emit_event(
            event_code='announcement.published',
            source_app='announcements',
            entity_type='announcement',
            entity_id=announcement.pk,
            payload={
                'announcement_id': announcement.pk,
                'title': announcement.title,
                'body': announcement.summary or announcement.body[:200],
                'action_url': f'/student/announcements/{announcement.uuid}',
                'filiere_ids': filiere_ids,
                'class_group_ids': class_group_ids,
            },
            actor=actor,
        )
    except Exception:
        pass


def _recompute_recommendation_scores(announcement: Announcement) -> None:
    try:
        from apps.announcements.services.recommendation import recompute_scores_for_announcement

        recompute_scores_for_announcement(announcement)
    except Exception:
        pass


def build_scheduled_datetime(
    date_str: str,
    time_str: str,
    tz_name: str = DEFAULT_SCHEDULE_TIMEZONE,
) -> datetime:
    """Convert local date/time in a timezone to an aware UTC datetime."""
    tz = ZoneInfo(tz_name or DEFAULT_SCHEDULE_TIMEZONE)
    naive = datetime.strptime(f'{date_str} {time_str}', '%Y-%m-%d %H:%M')
    local_dt = naive.replace(tzinfo=tz)
    return local_dt.astimezone(ZoneInfo('UTC'))


def validate_future_publish_start(publish_start_at: datetime) -> None:
    if publish_start_at <= timezone.now():
        raise ValueError('Publish date and time must be in the future.')


def get_schedule_timezone(announcement: Announcement) -> str:
    meta = announcement.metadata_json or {}
    return meta.get('schedule_timezone') or DEFAULT_SCHEDULE_TIMEZONE


def set_schedule_timezone(announcement: Announcement, tz_name: str) -> None:
    meta = dict(announcement.metadata_json or {})
    meta['schedule_timezone'] = tz_name or DEFAULT_SCHEDULE_TIMEZONE
    announcement.metadata_json = meta


def publish_announcement(
    announcement: Announcement,
    user,
    *,
    automated: bool = False,
) -> Announcement:
    prev = announcement.status
    now = timezone.now()
    announcement.status = Announcement.Status.PUBLISHED
    announcement.published_at = now
    if not announcement.publish_start_at:
        announcement.publish_start_at = now
    if user:
        announcement.updated_by = user
    announcement.save()
    log_action = (
        AnnouncementPublicationLog.Action.AUTO_PUBLISHED
        if automated
        else AnnouncementPublicationLog.Action.PUBLISHED
    )
    log_publication_action(
        announcement,
        log_action,
        user,
        previous_status=prev,
        note='Automatic publication' if automated else '',
    )
    _emit_audit(
        announcement,
        action='PUBLISH',
        event_code='announcement.published',
        summary=(
            f'Announcement auto-published: {announcement.title}'
            if automated
            else f'Announcement published: {announcement.title}'
        ),
        actor=user,
        old_values={'status': prev},
        new_values={'status': announcement.status, 'automated': automated},
    )
    _emit_published_notifications(announcement, user)
    _recompute_recommendation_scores(announcement)
    return announcement


def schedule_announcement(announcement: Announcement, user) -> Announcement:
    if not announcement.publish_start_at:
        raise ValueError('A publish date and time are required to schedule.')
    validate_future_publish_start(announcement.publish_start_at)
    prev = announcement.status
    announcement.status = Announcement.Status.SCHEDULED
    announcement.updated_by = user
    announcement.save()
    log_publication_action(
        announcement,
        AnnouncementPublicationLog.Action.SCHEDULED,
        user,
        previous_status=prev,
    )
    _emit_audit(
        announcement,
        action='SCHEDULE',
        event_code='announcement.scheduled',
        summary=f'Announcement scheduled: {announcement.title}',
        actor=user,
        old_values={'status': prev},
        new_values={
            'status': announcement.status,
            'publish_start_at': announcement.publish_start_at.isoformat(),
        },
    )
    return announcement


def modify_schedule(
    announcement: Announcement,
    user,
    *,
    previous_publish_start_at,
) -> None:
    if announcement.status != Announcement.Status.SCHEDULED:
        return
    log_publication_action(
        announcement,
        AnnouncementPublicationLog.Action.SCHEDULE_MODIFIED,
        user,
        previous_status=announcement.status,
        note=(
            f'From {previous_publish_start_at} to {announcement.publish_start_at}'
            if previous_publish_start_at
            else ''
        ),
    )
    _emit_audit(
        announcement,
        action='UPDATE',
        event_code='announcement.schedule_modified',
        summary=f'Announcement schedule modified: {announcement.title}',
        actor=user,
        old_values={'publish_start_at': str(previous_publish_start_at)},
        new_values={'publish_start_at': announcement.publish_start_at.isoformat()},
    )


def cancel_schedule(announcement: Announcement, user) -> Announcement:
    prev = announcement.status
    announcement.status = Announcement.Status.DRAFT
    announcement.updated_by = user
    announcement.save()
    log_publication_action(
        announcement,
        AnnouncementPublicationLog.Action.SCHEDULE_CANCELLED,
        user,
        previous_status=prev,
    )
    _emit_audit(
        announcement,
        action='UPDATE',
        event_code='announcement.schedule_cancelled',
        summary=f'Announcement schedule cancelled: {announcement.title}',
        actor=user,
        old_values={'status': prev},
        new_values={'status': announcement.status},
    )
    return announcement


def archive_announcement(announcement: Announcement, user) -> Announcement:
    prev = announcement.status
    announcement.status = Announcement.Status.ARCHIVED
    announcement.updated_by = user
    announcement.save()
    log_publication_action(
        announcement,
        AnnouncementPublicationLog.Action.ARCHIVED,
        user,
        previous_status=prev,
    )
    return announcement


def unarchive_announcement(announcement: Announcement, user) -> Announcement:
    if announcement.status != Announcement.Status.ARCHIVED:
        return announcement
    last_archive = (
        announcement.publication_logs.filter(
            action=AnnouncementPublicationLog.Action.ARCHIVED,
        )
        .order_by('-created_at')
        .first()
    )
    restore_status = (
        last_archive.previous_status
        if last_archive and last_archive.previous_status
        else Announcement.Status.DRAFT
    )
    valid_statuses = {choice[0] for choice in Announcement.Status.choices}
    if restore_status not in valid_statuses or restore_status == Announcement.Status.ARCHIVED:
        restore_status = Announcement.Status.DRAFT
    prev = announcement.status
    announcement.status = restore_status
    announcement.updated_by = user
    announcement.save()
    log_publication_action(
        announcement,
        AnnouncementPublicationLog.Action.UNARCHIVED,
        user,
        previous_status=prev,
    )
    return announcement


def unpublish_announcement(announcement: Announcement, user) -> Announcement:
    prev = announcement.status
    announcement.status = Announcement.Status.DRAFT
    announcement.updated_by = user
    announcement.save()
    log_publication_action(
        announcement,
        AnnouncementPublicationLog.Action.UNPUBLISHED,
        user,
        previous_status=prev,
    )
    return announcement


def duplicate_announcement(source: Announcement, user) -> Announcement:
    targets = list(source.targets.all())
    internship = getattr(source, 'internship_details', None)

    new = Announcement.objects.create(
        title=f'{source.title} (copy)',
        summary=source.summary,
        body=source.body,
        announcement_type=source.announcement_type,
        priority=source.priority,
        status=Announcement.Status.DRAFT,
        target_scope=source.target_scope,
        company_name=source.company_name,
        external_link=source.external_link,
        tags=list(source.tags or []),
        visibility_rules=dict(source.visibility_rules or {}),
        recommendation_metadata=dict(source.recommendation_metadata or {}),
        metadata_json=dict(source.metadata_json or {}),
        publish_start_at=source.publish_start_at,
        publish_end_at=source.publish_end_at,
        application_deadline=source.application_deadline,
        is_pinned=False,
        allow_comments=source.allow_comments,
        overrides_mute=source.overrides_mute,
        overrides_ban=source.overrides_ban,
        created_by=user,
        updated_by=user,
        posted_by=user,
    )

    for t in targets:
        AnnouncementTarget.objects.create(
            announcement=new,
            target_type=t.target_type,
            filiere=t.filiere,
            class_group=t.class_group,
            academic_level=t.academic_level,
            academic_year=t.academic_year,
            academic_sector=t.academic_sector,
            internship_type=t.internship_type,
            role=t.role,
            target_user=t.target_user,
            value_json=dict(t.value_json or {}),
            is_inclusive=t.is_inclusive,
        )

    if internship:
        AnnouncementInternshipDetails.objects.create(
            announcement=new,
            internship_type=internship.internship_type,
            internship_type_code=internship.internship_type_code,
            duration=internship.duration,
            location=internship.location,
            work_mode=internship.work_mode,
            required_skills=list(internship.required_skills or []),
            technologies=list(internship.technologies or []),
            languages=list(internship.languages or []),
            recruiter_name=internship.recruiter_name,
            recruiter_email=internship.recruiter_email,
            company_sector=internship.company_sector,
            internship_start_date=internship.internship_start_date,
            internship_end_date=internship.internship_end_date,
            compensation=internship.compensation,
            offer_status=internship.offer_status,
            linked_offer=internship.linked_offer,
        )

    log_publication_action(
        new,
        AnnouncementPublicationLog.Action.DUPLICATED,
        user,
        note=f'Duplicated from {source.uuid}',
    )
    return new


def process_scheduled_publications() -> int:
    now = timezone.now()
    qs = Announcement.objects.filter(
        status=Announcement.Status.SCHEDULED,
        publish_start_at__lte=now,
    )
    count = 0
    for ann in qs:
        publish_announcement(ann, user=None, automated=True)
        count += 1
    return count


def process_expired_announcements() -> int:
    from django.db.models import Q

    now = timezone.now()
    qs = Announcement.objects.filter(
        status__in=[Announcement.Status.PUBLISHED, Announcement.Status.SCHEDULED],
    ).filter(Q(publish_end_at__lte=now) | Q(expires_at__lte=now))
    count = 0
    for ann in qs:
        prev = ann.status
        ann.status = Announcement.Status.EXPIRED
        ann.save(update_fields=['status', 'updated_at'])
        log_publication_action(
            ann,
            AnnouncementPublicationLog.Action.EXPIRED,
            None,
            previous_status=prev,
        )
        count += 1
    return count
