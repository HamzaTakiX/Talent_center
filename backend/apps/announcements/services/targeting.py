"""Audience targeting engine for announcements."""

from __future__ import annotations

from django.db.models import Q, QuerySet

from apps.accounts_et_roles.models import StudentProfile
from apps.announcements.models import Announcement, AnnouncementTarget


def _student_matches_target(student: StudentProfile, target: AnnouncementTarget) -> bool:
    tt = target.target_type
    if tt == AnnouncementTarget.TargetType.ALL:
        return True
    if tt == AnnouncementTarget.TargetType.FILIERE:
        return student.filiere_id == target.filiere_id
    if tt == AnnouncementTarget.TargetType.CLASS_GROUP:
        return student.class_group_id == target.class_group_id
    if tt == AnnouncementTarget.TargetType.ACADEMIC_LEVEL:
        return student.academic_level_id == target.academic_level_id
    if tt == AnnouncementTarget.TargetType.ACADEMIC_SECTOR:
        return student.academic_sector_id == target.academic_sector_id
    if tt == AnnouncementTarget.TargetType.INTERNSHIP_TYPE:
        return student.internship_type_id == target.internship_type_id
    if tt == AnnouncementTarget.TargetType.ACADEMIC_YEAR:
        return student.academic_year_ref_id == target.academic_year_id
    if tt == AnnouncementTarget.TargetType.INTERNSHIP_SEEKING:
        return bool(target.value_json.get('seeking', True)) and not student.metadata_json.get('has_internship')
    if tt == AnnouncementTarget.TargetType.LEVEL:
        return student.academic_level_id == target.academic_level_id
    if tt == AnnouncementTarget.TargetType.USER:
        return student.user_id == target.target_user_id
    if tt == AnnouncementTarget.TargetType.CUSTOM:
        rules = target.value_json or {}
        if rules.get('filiere_ids') and student.filiere_id not in rules['filiere_ids']:
            return False
        if rules.get('level_ids') and student.academic_level_id not in rules['level_ids']:
            return False
        return True
    return False


def announcement_visible_to_student(announcement: Announcement, student: StudentProfile) -> bool:
    if announcement.target_scope == Announcement.TargetScope.ALL_STUDENTS:
        return True
    targets = list(announcement.targets.all())
    if not targets:
        return announcement.target_scope == Announcement.TargetScope.ALL_STUDENTS
    for target in targets:
        if target.target_type == AnnouncementTarget.TargetType.ALL:
            return True
    groups: dict[str, list[AnnouncementTarget]] = {}
    for t in targets:
        groups.setdefault(t.target_type, []).append(t)
    for _tt, group in groups.items():
        if not any(_student_matches_target(student, t) for t in group):
            return False
    return True


def filter_announcements_for_student(
    qs: QuerySet[Announcement],
    student: StudentProfile,
) -> QuerySet[Announcement]:
  ids = [a.pk for a in qs if announcement_visible_to_student(a, student)]
  return qs.filter(pk__in=ids)


def estimate_audience_count(announcement: Announcement) -> int:
    if announcement.target_scope == Announcement.TargetScope.ALL_STUDENTS:
        return StudentProfile.objects.count()
    students = StudentProfile.objects.select_related(
        'filiere', 'class_group', 'academic_level', 'academic_sector',
        'internship_type', 'academic_year_ref',
    )
    return sum(1 for s in students if announcement_visible_to_student(announcement, s))
