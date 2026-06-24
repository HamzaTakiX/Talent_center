"""Student-facing announcement feed — visibility, filters, recommendations."""

from __future__ import annotations

from datetime import timedelta
from decimal import Decimal

from django.contrib.auth import get_user_model
from django.utils import timezone

from apps.accounts_et_roles.models import StudentProfile
from apps.announcements.models import (
    Announcement,
    AnnouncementType,
    RecommendationScore,
    StudentAnnouncementAction,
    StudentAnnouncementBookmark,
)
from apps.announcements.services.engagement import record_student_announcement_view
from apps.announcements.services.recommendation import upsert_recommendation_score
from apps.announcements.services.student_bookmarks import bookmark_flags_for_student
from apps.announcements.services.targeting import announcement_visible_to_student

User = get_user_model()

URGENT_PRIORITIES = frozenset({
    Announcement.Priority.URGENT,
    Announcement.Priority.PINNED,
    Announcement.Priority.INSTITUTIONAL_CRITICAL,
})
IMPORTANT_PRIORITIES = frozenset({Announcement.Priority.IMPORTANT})


def _priority_bucket(priority: str) -> str:
    if priority in URGENT_PRIORITIES:
        return 'urgent'
    if priority in IMPORTANT_PRIORITIES:
        return 'important'
    return 'normal'


def _priority_matches_filter(priority: str, filter_value: str) -> bool:
    if not filter_value or filter_value == 'all':
        return True
    bucket = _priority_bucket(priority)
    mapping = {
        'Urgent': 'urgent',
        'Important': 'important',
        'Normal': 'normal',
        'urgent': 'urgent',
        'important': 'important',
        'normal': 'normal',
    }
    return bucket == mapping.get(filter_value, filter_value.lower())


def _date_matches_filter(published_at, date_filter: str) -> bool:
    if not date_filter or date_filter == 'all':
        return True
    if not published_at:
        return date_filter == 'all'
    now = timezone.now()
    if date_filter == 'today':
        return published_at.date() == now.date()
    if date_filter == 'week':
        return published_at >= now - timedelta(days=7)
    if date_filter == 'month':
        return published_at >= now - timedelta(days=30)
    return True


def _published_queryset() -> list[Announcement]:
    return list(
        Announcement.objects.filter(status=Announcement.Status.PUBLISHED)
        .select_related('announcement_type')
        .prefetch_related('attachments', 'targets', 'internship_details')
        .order_by('-is_pinned', '-published_at', '-created_at')
    )


def _viewed_announcement_ids(student: StudentProfile) -> set[int]:
    return set(
        StudentAnnouncementAction.objects.filter(
            student_profile=student,
            action_type=StudentAnnouncementAction.ActionType.VIEW,
        ).values_list('announcement_id', flat=True)
    )


def _score_map(
    student: StudentProfile,
    announcements: list[Announcement],
) -> dict[int, tuple[Decimal, bool]]:
    existing = {
        s.announcement_id: (s.score, s.is_recommended)
        for s in RecommendationScore.objects.filter(
            student_profile=student,
            announcement_id__in=[a.pk for a in announcements],
        )
    }
    scores: dict[int, tuple[Decimal, bool]] = {}
    for ann in announcements:
        if ann.pk in existing:
            scores[ann.pk] = existing[ann.pk]
        else:
            obj = upsert_recommendation_score(student, ann)
            scores[ann.pk] = (obj.score, obj.is_recommended)
    return scores


def _serialize_attachment(att, request) -> dict:
    file_url = None
    if att.file:
        file_url = request.build_absolute_uri(att.file.url) if request else att.file.url
    return {
        'id': att.pk,
        'kind': att.kind,
        'fileUrl': file_url,
        'externalUrl': att.external_url or None,
        'originalFilename': att.original_filename or '',
        'label': att.label or '',
        'mimeType': att.mime_type or '',
        'fileSizeBytes': att.file_size_bytes,
    }


def _serialize_announcement(
    ann: Announcement,
    *,
    student: StudentProfile,
    request,
    score: Decimal | None,
    is_recommended: bool,
    is_unread: bool,
) -> dict:
    lang = 'fr'
    if request:
        accept = request.headers.get('Accept-Language', 'fr')
        lang = (accept.split(',')[0].split('-')[0] or 'fr').lower()
    at = ann.announcement_type
    name_i18n = at.name_i18n or {}
    type_name = name_i18n.get(lang) or at.name

    cover_url = None
    if ann.cover_image:
        cover_url = request.build_absolute_uri(ann.cover_image.url) if request else ann.cover_image.url

    deadline = ann.application_deadline
    deadline_urgent = False
    if deadline:
        days = (deadline - timezone.now()).days
        deadline_urgent = days <= 3

    internship = getattr(ann, 'internship_details', None)
    internship_details = None
    if internship:
        internship_details = {
            'duration': internship.duration or '',
            'location': internship.location or '',
            'workMode': internship.work_mode,
            'compensation': internship.compensation or '',
            'offerStatus': internship.offer_status,
        }

    match_score = float(score) if score is not None else None
    return {
        'id': str(ann.uuid),
        'title': ann.title,
        'summary': ann.summary or '',
        'body': ann.body or '',
        'typeCode': at.code,
        'typeName': type_name,
        'typeIcon': at.icon or '',
        'typeColor': at.color or '',
        'priority': ann.priority,
        'priorityBucket': _priority_bucket(ann.priority),
        'companyName': ann.company_name or '',
        'coverImageUrl': cover_url,
        'externalLink': ann.external_link or None,
        'publishedAt': ann.published_at.isoformat() if ann.published_at else None,
        'applicationDeadline': deadline.isoformat() if deadline else None,
        'deadlineUrgent': deadline_urgent,
        'attachments': [_serialize_attachment(a, request) for a in ann.attachments.all()],
        'internshipDetails': internship_details,
        'matchScore': round(match_score) if match_score is not None else None,
        'recommended': is_recommended,
        'isUnread': is_unread,
        'isPinned': ann.is_pinned,
        'allowComments': ann.allow_comments,
    }


def get_student_announcement_feed(
    student: StudentProfile,
    *,
    request=None,
    type_code: str | None = None,
    priority: str | None = None,
    date_filter: str | None = None,
    search: str | None = None,
    limit: int = 100,
) -> dict:
    """Return feed items, recommended subset, stats, and available types."""
    all_published = _published_queryset()
    visible = [a for a in all_published if announcement_visible_to_student(a, student)]
    viewed_ids = _viewed_announcement_ids(student)
    scores = _score_map(student, visible)

    q = (search or '').strip().lower()

    def passes_filters(ann: Announcement) -> bool:
        if type_code and type_code != 'all' and ann.announcement_type.code != type_code:
            return False
        if not _priority_matches_filter(ann.priority, priority or 'all'):
            return False
        if not _date_matches_filter(ann.published_at, date_filter or 'all'):
            return False
        if q:
            haystack = ' '.join([
                ann.title,
                ann.summary,
                ann.body,
                ann.company_name,
                ann.announcement_type.code,
                ann.announcement_type.name,
            ]).lower()
            if q not in haystack:
                return False
        return True

    filtered = [a for a in visible if passes_filters(a)]
    filtered.sort(
        key=lambda a: (
            -int(a.is_pinned),
            -float(scores.get(a.pk, (Decimal('0'), False))[0]),
            -(a.published_at.timestamp() if a.published_at else 0),
        ),
    )
    filtered = filtered[:limit]

    from apps.announcements.services.student_bookmarks import bookmark_flags_for_student

    bookmark_flags = bookmark_flags_for_student(student, {a.pk for a in filtered})
    items = []
    for ann in filtered:
        ann_score, ann_recommended = scores.get(ann.pk, (None, False))
        payload = _serialize_announcement(
            ann,
            student=student,
            request=request,
            score=ann_score,
            is_recommended=ann_recommended,
            is_unread=ann.pk not in viewed_ids,
        )
        flags = bookmark_flags.get(ann.pk, {})
        payload['isSaved'] = flags.get('isSaved', False)
        payload['isFavorited'] = flags.get('isFavorited', False)
        items.append(payload)
    recommended = [i for i in items if i.get('recommended')][:8]

    visible_ids = {a.pk for a in visible}
    unread_count = sum(1 for a in visible if a.pk not in viewed_ids)

    saved_bookmark_ids = set(
        StudentAnnouncementBookmark.objects.filter(
            student_profile=student,
            announcement_id__in=visible_ids,
            bookmark_type__in=[
                StudentAnnouncementBookmark.BookmarkType.SAVE,
                StudentAnnouncementBookmark.BookmarkType.FAVORITE,
            ],
        ).values_list('announcement_id', flat=True)
    )
    saved_action_ids = set(
        StudentAnnouncementAction.objects.filter(
            student_profile=student,
            announcement_id__in=visible_ids,
            action_type=StudentAnnouncementAction.ActionType.SAVE,
        ).values_list('announcement_id', flat=True)
    )
    saved_count = len(saved_bookmark_ids | saved_action_ids)

    recent_cutoff = timezone.now() - timedelta(days=7)
    recent_count = sum(
        1 for a in visible
        if a.published_at and a.published_at >= recent_cutoff
    )

    type_codes_seen = {a.announcement_type.code for a in visible}
    types = []
    for at in AnnouncementType.objects.filter(is_active=True, code__in=type_codes_seen).order_by('sort_order'):
        name_i18n = at.name_i18n or {}
        lang = 'fr'
        if request:
            accept = request.headers.get('Accept-Language', 'fr')
            lang = (accept.split(',')[0].split('-')[0] or 'fr').lower()
        types.append({
            'code': at.code,
            'name': name_i18n.get(lang) or at.name,
            'icon': at.icon or '',
            'color': at.color or '',
        })

    return {
        'items': items,
        'recommended': recommended,
        'stats': {
            'total': len(visible),
            'saved': saved_count,
            'recent': recent_count,
            'unread': unread_count,
        },
        'types': types,
    }


def get_student_announcement_detail(
    student: StudentProfile,
    *,
    announcement_uuid,
    request=None,
) -> dict | None:
    """Return a single published announcement detail for the student, or None if unavailable."""
    ann = (
        Announcement.objects.filter(
            uuid=announcement_uuid,
            status=Announcement.Status.PUBLISHED,
        )
        .select_related('announcement_type')
        .prefetch_related('attachments', 'targets', 'internship_details')
        .first()
    )
    if not ann or not announcement_visible_to_student(ann, student):
        return None

    record_student_announcement_view(student, ann)

    viewed_ids = _viewed_announcement_ids(student)
    scores = _score_map(student, [ann])
    ann_score, ann_recommended = scores.get(ann.pk, (None, False))
    flags = bookmark_flags_for_student(student, {ann.pk}).get(
        ann.pk,
        {'isSaved': False, 'isFavorited': False},
    )

    announcement = _serialize_announcement(
        ann,
        student=student,
        request=request,
        score=ann_score,
        is_recommended=ann_recommended,
        is_unread=ann.pk not in viewed_ids,
    )
    announcement['isSaved'] = flags['isSaved']
    announcement['isFavorited'] = flags['isFavorited']
    if ann.publish_end_at:
        announcement['publishEndAt'] = ann.publish_end_at.isoformat()

    return {'announcement': announcement}
