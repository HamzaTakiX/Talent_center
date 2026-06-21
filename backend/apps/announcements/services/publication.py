"""Publication workflow, scheduling, and auto-expiration."""

from __future__ import annotations

from django.utils import timezone

from apps.announcements.models import (
    Announcement,
    AnnouncementInternshipDetails,
    AnnouncementPublicationLog,
    AnnouncementTarget,
)


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


def publish_announcement(announcement: Announcement, user) -> Announcement:
    prev = announcement.status
    now = timezone.now()
    announcement.status = Announcement.Status.PUBLISHED
    announcement.published_at = now
    if not announcement.publish_start_at:
        announcement.publish_start_at = now
    announcement.updated_by = user
    announcement.save()
    log_publication_action(
        announcement,
        AnnouncementPublicationLog.Action.PUBLISHED,
        user,
        previous_status=prev,
    )
    try:
        from apps.history.audit import audit

        audit.emit(
            module='announcements',
            action='PUBLISH',
            event_code='announcement.published',
            summary=f'Announcement published: {announcement.title}',
            actor=user,
            entity_type='announcement',
            entity_id=announcement.id,
            old_values={'status': prev},
            new_values={'status': announcement.status},
            metadata={'announcement_id': announcement.id},
        )
    except Exception:
        pass
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
            actor=user,
        )
    except Exception:
        pass
    return announcement


def schedule_announcement(announcement: Announcement, user) -> Announcement:
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
        ann.status = Announcement.Status.PUBLISHED
        ann.published_at = now
        ann.save(update_fields=['status', 'published_at', 'updated_at'])
        count += 1
    return count


def process_expired_announcements() -> int:
    from django.db.models import Q

    now = timezone.now()
    qs = Announcement.objects.filter(
        status__in=[Announcement.Status.PUBLISHED, Announcement.Status.SCHEDULED],
    ).filter(Q(publish_end_at__lte=now) | Q(expires_at__lte=now))
    return qs.update(status=Announcement.Status.EXPIRED)
