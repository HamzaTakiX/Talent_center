"""Student bookmark / favorite actions for announcements."""

from __future__ import annotations

from django.db.models import F

from apps.accounts_et_roles.models import StudentProfile
from apps.announcements.models import (
    Announcement,
    StudentAnnouncementAction,
    StudentAnnouncementBookmark,
)
from apps.announcements.services.recommendation import upsert_recommendation_score
from apps.announcements.services.targeting import announcement_visible_to_student

VALID_BOOKMARK_TYPES = frozenset({
    StudentAnnouncementBookmark.BookmarkType.SAVE,
    StudentAnnouncementBookmark.BookmarkType.FAVORITE,
})


def _bookmark_flags(student: StudentProfile, announcement_ids: set[int]) -> tuple[set[int], set[int]]:
    if not announcement_ids:
        return set(), set()
    rows = StudentAnnouncementBookmark.objects.filter(
        student_profile=student,
        announcement_id__in=announcement_ids,
        bookmark_type__in=VALID_BOOKMARK_TYPES,
    ).values_list('announcement_id', 'bookmark_type')
    saved_ids: set[int] = set()
    favorited_ids: set[int] = set()
    for ann_id, bookmark_type in rows:
        if bookmark_type == StudentAnnouncementBookmark.BookmarkType.SAVE:
            saved_ids.add(ann_id)
        elif bookmark_type == StudentAnnouncementBookmark.BookmarkType.FAVORITE:
            favorited_ids.add(ann_id)
    return saved_ids, favorited_ids


def bookmark_flags_for_student(
    student: StudentProfile,
    announcement_ids: set[int],
) -> dict[int, dict[str, bool]]:
    saved_ids, favorited_ids = _bookmark_flags(student, announcement_ids)
    if announcement_ids:
        saved_action_ids = set(
            StudentAnnouncementAction.objects.filter(
                student_profile=student,
                announcement_id__in=announcement_ids,
                action_type=StudentAnnouncementAction.ActionType.SAVE,
            ).values_list('announcement_id', flat=True)
        )
        saved_ids |= saved_action_ids
    return {
        ann_id: {
            'isSaved': ann_id in saved_ids,
            'isFavorited': ann_id in favorited_ids,
        }
        for ann_id in announcement_ids
    }


def toggle_student_announcement_bookmark(
    student: StudentProfile,
    announcement: Announcement,
    bookmark_type: str,
) -> dict:
    if bookmark_type not in VALID_BOOKMARK_TYPES:
        raise ValueError(f'Invalid bookmark type: {bookmark_type}')

    existing = StudentAnnouncementBookmark.objects.filter(
        student_profile=student,
        announcement=announcement,
        bookmark_type=bookmark_type,
    ).first()

    if existing:
        existing.delete()
        if bookmark_type == StudentAnnouncementBookmark.BookmarkType.SAVE:
            Announcement.objects.filter(pk=announcement.pk, save_count__gt=0).update(
                save_count=F('save_count') - 1,
            )
        upsert_recommendation_score(student, announcement)
        return {'active': False, 'bookmarkType': bookmark_type}

    StudentAnnouncementBookmark.objects.create(
        student_profile=student,
        announcement=announcement,
        bookmark_type=bookmark_type,
    )
    if bookmark_type == StudentAnnouncementBookmark.BookmarkType.SAVE:
        StudentAnnouncementAction.objects.create(
            student_profile=student,
            announcement=announcement,
            action_type=StudentAnnouncementAction.ActionType.SAVE,
        )
        Announcement.objects.filter(pk=announcement.pk).update(
            save_count=F('save_count') + 1,
        )
    upsert_recommendation_score(student, announcement)
    return {'active': True, 'bookmarkType': bookmark_type}


def get_student_saved_announcement_feed(
    student: StudentProfile,
    *,
    request=None,
    search: str | None = None,
    limit: int = 100,
) -> dict:
    """Return announcements saved or favorited by the student."""
    from apps.announcements.services.student_feed import (
        _published_queryset,
        _score_map,
        _serialize_announcement,
        _viewed_announcement_ids,
    )

    bookmark_ann_ids = set(
        StudentAnnouncementBookmark.objects.filter(
            student_profile=student,
            bookmark_type__in=VALID_BOOKMARK_TYPES,
        ).values_list('announcement_id', flat=True)
    )
    saved_action_ids = set(
        StudentAnnouncementAction.objects.filter(
            student_profile=student,
            action_type=StudentAnnouncementAction.ActionType.SAVE,
        ).values_list('announcement_id', flat=True)
    )
    target_ids = bookmark_ann_ids | saved_action_ids
    if not target_ids:
        return {'items': [], 'stats': {'total': 0}}

    all_published = _published_queryset()
    visible = [
        a for a in all_published
        if a.pk in target_ids and announcement_visible_to_student(a, student)
    ]
    viewed_ids = _viewed_announcement_ids(student)
    scores = _score_map(student, visible)
    saved_ids, favorited_ids = _bookmark_flags(student, {a.pk for a in visible})

    q = (search or '').strip().lower()

    def passes_search(ann: Announcement) -> bool:
        if not q:
            return True
        haystack = ' '.join([
            ann.title,
            ann.summary,
            ann.body,
            ann.company_name,
            ann.announcement_type.code,
            ann.announcement_type.name,
        ]).lower()
        return q in haystack

    filtered = [a for a in visible if passes_search(a)]
    filtered.sort(
        key=lambda a: -(a.published_at.timestamp() if a.published_at else 0),
    )
    filtered = filtered[:limit]

    items = []
    for ann in filtered:
        payload = _serialize_announcement(
            ann,
            student=student,
            request=request,
            score=scores.get(ann.pk),
            is_unread=ann.pk not in viewed_ids,
        )
        payload['isSaved'] = ann.pk in saved_ids or ann.pk in saved_action_ids
        payload['isFavorited'] = ann.pk in favorited_ids
        items.append(payload)

    return {
        'items': items,
        'stats': {'total': len(items)},
    }
