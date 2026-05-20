"""
Intelligent supervisor (encadrant) assignment engine.

Analyzes eligible students and encadrants against the ESCA academic hierarchy,
internship context, specialization domains, and workload constraints.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from decimal import Decimal
from typing import Any, Optional

from django.contrib.auth import get_user_model
from django.db import transaction
from django.db.models import Prefetch, Q

from apps.accounts_et_roles.models import StudentProfile, SupervisorProfile
from apps.admin_management.models import (
    AcademicYear,
    Assignment,
    EncadrantProfile,
)
from apps.admin_management.services.encadrants import _assigned_student_count
from apps.admin_management.services.specialization_domains import (
    get_encadrant_domain_codes,
    match_student_to_domain_codes,
)
from apps.admin_management.services.supervised_internship_types import (
    get_encadrant_supervised_internship_type_ids,
)

User = get_user_model()

INACTIVE_ACCOUNT_STATUSES = frozenset({
    User.AccountStatus.ARCHIVED,
    User.AccountStatus.SUSPENDED,
    User.AccountStatus.BLOCKED,
})

ACTIVE_APPLICATION_STATUSES = frozenset({'SUBMITTED', 'UNDER_REVIEW', 'SHORTLISTED', 'INTERVIEW', 'ACCEPTED'})

# Scoring weights (priority: internship type → filière → level → sector → class → domains → workload)
WEIGHT_INTERNSHIP_TYPE = 30.0
WEIGHT_FILIERE = 22.0
WEIGHT_LEVEL = 18.0
WEIGHT_SECTOR = 15.0
WEIGHT_CLASS = 10.0
WEIGHT_YEAR = 8.0
WEIGHT_DOMAIN = 18.0
WEIGHT_INTERNSHIP_DOMAIN = 12.0
WEIGHT_WORKLOAD = 10.0

MAX_SCORE = (
    WEIGHT_INTERNSHIP_TYPE + WEIGHT_FILIERE + WEIGHT_LEVEL + WEIGHT_SECTOR + WEIGHT_CLASS
    + WEIGHT_YEAR + WEIGHT_DOMAIN + WEIGHT_INTERNSHIP_DOMAIN + WEIGHT_WORKLOAD
)

def resolve_academic_year(academic_year: str = '') -> str:
    code = (academic_year or '').strip()
    if code:
        if AcademicYear.objects.filter(code=code, is_active=True).exists():
            return code
        raise ValueError(f'Academic year "{code}" is not valid or active.')
    current = AcademicYear.objects.filter(is_current=True, is_active=True).first()
    if current:
        return current.code
    fallback = AcademicYear.objects.filter(is_active=True).order_by('-start_year').first()
    if fallback:
        return fallback.code
    raise ValueError('No active academic year configured.')


def _scope_allows(scope_ids: list, entity_id: Optional[int]) -> bool:
    if not scope_ids:
        return True
    if entity_id is None:
        return False
    return entity_id in scope_ids


def _scope_year_allows(scope_years: list[str], year: str) -> bool:
    if not scope_years:
        return True
    return year in scope_years


@dataclass
class StudentAnalysis:
    student_profile_id: int
    user_id: int
    full_name: str
    email: str
    filiere_id: Optional[int]
    filiere_code: str
    filiere_name: str
    program_family: str
    level_id: Optional[int]
    level_name: str
    sector_id: Optional[int]
    sector_name: str
    class_group_id: Optional[int]
    class_name: str
    academic_year: str
    internship_type_id: Optional[int]
    internship_type_name: str
    internship_category: str
    internship_duration: str
    internship_domain: str
    internship_company: str
    internship_status: str
    skills: list
    preferred_supervision_type: str
    inferred_domains: set[str] = field(default_factory=set)
    assignment_id: Optional[int] = None
    current_encadrant_id: Optional[int] = None
    is_locked: bool = False


@dataclass
class EncadrantAnalysis:
    encadrant_profile_id: int
    user_id: int
    full_name: str
    email: str
    specialization_domains: list[str]
    max_capacity: int
    current_load: int
    is_available: bool
    is_active: bool
    scope_filiere_ids: list[int]
    scope_level_ids: list[int]
    scope_sector_ids: list[int]
    scope_class_group_ids: list[int]
    scope_academic_years: list[str]
    supervised_internship_type_ids: list[int]


def _get_internship_context(student: StudentProfile) -> tuple[str, str, str]:
    company = ''
    status = 'ACTIVE_WORKFLOW'
    try:
        from apps.stage.models import OfferApplication

        app = (
            OfferApplication.objects.filter(
                student_profile=student,
                status__in=ACTIVE_APPLICATION_STATUSES,
            )
            .select_related('offer')
            .order_by('-applied_at')
            .first()
        )
        if app and app.offer:
            company = app.offer.company_name or ''
            status = app.status
    except Exception:
        pass
    internship_domain = ''
    if student.academic_sector:
        internship_domain = student.academic_sector.name
    elif student.internship_type:
        internship_domain = student.internship_type.name
    return company, status, internship_domain


def analyze_student(
    student: StudentProfile,
    *,
    assignment: Optional[Assignment] = None,
) -> StudentAnalysis:
    user = student.user
    profile = getattr(user, 'profile', None)
    full_name = profile.full_name if profile else user.email
    filiere = student.filiere
    level = student.academic_level
    sector = student.academic_sector
    class_group = student.class_group
    internship_type = student.internship_type
    company, internship_status, internship_domain = _get_internship_context(student)

    sector_name = sector.name if sector else ''
    program_family = filiere.program_family if filiere else ''
    inferred = match_student_to_domain_codes(
        skills=list(student.skills or []),
        sector_name=sector_name,
        internship_domain=internship_domain,
        professional_summary=student.professional_summary or '',
        filiere_program_family=program_family,
    )
    if internship_type and internship_type.name:
        inferred |= match_student_to_domain_codes(
            skills=list(student.skills or []),
            sector_name=sector_name,
            internship_domain=internship_type.name,
            professional_summary=student.professional_summary or '',
            filiere_program_family=program_family,
        )

    preferred = ''
    if internship_type:
        preferred = internship_type.name

    return StudentAnalysis(
        student_profile_id=student.pk,
        user_id=user.pk,
        full_name=full_name,
        email=user.email,
        filiere_id=filiere.pk if filiere else None,
        filiere_code=filiere.code if filiere else '',
        filiere_name=filiere.name if filiere else student.program_major,
        program_family=filiere.program_family if filiere else '',
        level_id=level.pk if level else None,
        level_name=level.name if level else '',
        sector_id=sector.pk if sector else None,
        sector_name=sector_name,
        class_group_id=class_group.pk if class_group else None,
        class_name=class_group.name if class_group else student.current_class,
        academic_year=student.academic_year or (assignment.academic_year if assignment else ''),
        internship_type_id=internship_type.pk if internship_type else None,
        internship_type_name=internship_type.name if internship_type else '',
        internship_category=(student.internship_category or program_family or '').strip().upper(),
        internship_duration=student.internship_duration or (
            internship_type.duration_hint if internship_type else ''
        ),
        internship_domain=internship_domain,
        internship_company=company,
        internship_status=internship_status,
        skills=list(student.skills or []),
        preferred_supervision_type=preferred,
        inferred_domains=inferred,
        assignment_id=assignment.pk if assignment else None,
        current_encadrant_id=(
            assignment.encadrant_profile_id if assignment and assignment.encadrant_profile_id else None
        ),
        is_locked=bool(assignment.is_locked) if assignment else False,
    )


def analyze_encadrant(encadrant: EncadrantProfile) -> EncadrantAnalysis:
    supervisor: SupervisorProfile = encadrant.supervisor_profile
    user = supervisor.user
    profile = getattr(user, 'profile', None)
    full_name = profile.full_name if profile else user.email
    load = _assigned_student_count(encadrant)
    max_cap = encadrant.max_concurrent_students or supervisor.student_capacity or 0
    user_active = user.is_active and user.account_status not in INACTIVE_ACCOUNT_STATUSES
    available = (
        encadrant.is_active
        and user_active
        and supervisor.accepting_students
        and (max_cap == 0 or load < max_cap)
    )
    return EncadrantAnalysis(
        encadrant_profile_id=encadrant.pk,
        user_id=user.pk,
        full_name=full_name,
        email=user.email,
        specialization_domains=get_encadrant_domain_codes(encadrant),
        max_capacity=max_cap,
        current_load=load,
        is_available=available,
        is_active=encadrant.is_active and user_active,
        scope_filiere_ids=list(encadrant.scope_filiere_ids or []),
        scope_level_ids=list(encadrant.scope_level_ids or []),
        scope_sector_ids=list(encadrant.scope_sector_ids or []),
        scope_class_group_ids=list(encadrant.scope_class_group_ids or []),
        scope_academic_years=list(encadrant.scope_academic_years or []),
        supervised_internship_type_ids=get_encadrant_supervised_internship_type_ids(encadrant),
    )


def get_eligible_students_queryset(academic_year: str):
    """
    Students eligible for smart assignment:
    - active user, not archived/suspended/blocked
    - active assignment for the academic year with a class group

    Missing internship type is allowed here; precheck surfaces it as a warning
    so admins can still run the engine while data is being completed.
    """
    return (
        StudentProfile.objects.filter(
            user__role=User.RoleChoices.STUDENT,
            user__is_active=True,
            assignments__academic_year=academic_year,
            assignments__is_active=True,
            assignments__class_group__isnull=False,
        )
        .exclude(user__account_status__in=INACTIVE_ACCOUNT_STATUSES)
        .exclude(academic_access__internship_eligible=False)
        .select_related(
            'user',
            'user__profile',
            'filiere',
            'academic_level',
            'academic_sector',
            'class_group',
            'internship_type',
            'academic_year_ref',
        )
        .prefetch_related(
            Prefetch(
                'assignments',
                queryset=Assignment.objects.filter(
                    academic_year=academic_year,
                    is_active=True,
                ).select_related('encadrant_profile', 'class_group'),
            ),
        )
        .distinct()
    )


def get_available_encadrants_queryset(
    *,
    excluded_encadrant_ids: Optional[list[int]] = None,
):
    qs = EncadrantProfile.objects.filter(
        is_active=True,
        supervisor_profile__user__is_active=True,
        supervisor_profile__accepting_students=True,
    ).exclude(
        supervisor_profile__user__account_status__in=INACTIVE_ACCOUNT_STATUSES,
    ).select_related(
        'supervisor_profile',
        'supervisor_profile__user',
        'supervisor_profile__user__profile',
    ).prefetch_related('specialization_domains', 'supervised_internship_types')
    if excluded_encadrant_ids:
        qs = qs.exclude(pk__in=excluded_encadrant_ids)
    return qs


def _internship_type_compatible(student: StudentAnalysis, encadrant: EncadrantAnalysis) -> bool:
    supervised = encadrant.supervised_internship_type_ids
    if not supervised:
        return True
    if not student.internship_type_id:
        return False
    return student.internship_type_id in supervised


def compute_match_score(
    student: StudentAnalysis,
    encadrant: EncadrantAnalysis,
    *,
    projected_load: int,
) -> float:
    if not encadrant.is_active:
        return 0.0

    if not _internship_type_compatible(student, encadrant):
        return 0.0

    score = 0.0

    if student.internship_type_id:
        if student.internship_type_id in encadrant.supervised_internship_type_ids:
            score += WEIGHT_INTERNSHIP_TYPE
        elif encadrant.supervised_internship_type_ids:
            return 0.0
        else:
            score += WEIGHT_INTERNSHIP_TYPE * 0.35
    elif encadrant.supervised_internship_type_ids:
        score += WEIGHT_INTERNSHIP_TYPE * 0.2
    else:
        score += WEIGHT_INTERNSHIP_TYPE * 0.5

    if _scope_allows(encadrant.scope_filiere_ids, student.filiere_id):
        score += WEIGHT_FILIERE
    elif encadrant.scope_filiere_ids:
        return 0.0

    if _scope_allows(encadrant.scope_level_ids, student.level_id):
        score += WEIGHT_LEVEL
    elif encadrant.scope_level_ids:
        return 0.0

    if student.sector_id:
        if _scope_allows(encadrant.scope_sector_ids, student.sector_id):
            score += WEIGHT_SECTOR
        elif encadrant.scope_sector_ids:
            score += WEIGHT_SECTOR * 0.25
    else:
        score += WEIGHT_SECTOR * 0.6

    if _scope_allows(encadrant.scope_class_group_ids, student.class_group_id):
        score += WEIGHT_CLASS
    elif encadrant.scope_class_group_ids:
        score += WEIGHT_CLASS * 0.3

    if _scope_year_allows(encadrant.scope_academic_years, student.academic_year):
        score += WEIGHT_YEAR
    elif encadrant.scope_academic_years:
        return 0.0

    enc_domains = set(encadrant.specialization_domains)
    student_domains = student.inferred_domains
    if enc_domains and student_domains:
        overlap = len(enc_domains & student_domains)
        if overlap:
            ratio = overlap / max(len(student_domains), 1)
            score += WEIGHT_DOMAIN * min(1.0, ratio + 0.25)
        else:
            score += WEIGHT_DOMAIN * 0.15
    elif enc_domains or student_domains:
        score += WEIGHT_DOMAIN * 0.4
    else:
        score += WEIGHT_DOMAIN * 0.5

    if student.internship_domain and enc_domains:
        inferred_intern = match_student_to_domain_codes(
            skills=student.skills,
            sector_name=student.sector_name,
            internship_domain=student.internship_domain,
            professional_summary='',
            filiere_program_family=student.program_family,
        )
        if inferred_intern & enc_domains:
            score += WEIGHT_INTERNSHIP_DOMAIN
        else:
            score += WEIGHT_INTERNSHIP_DOMAIN * 0.35
    else:
        score += WEIGHT_INTERNSHIP_DOMAIN * 0.5

    max_cap = encadrant.max_capacity or 1
    load_ratio = projected_load / max_cap if max_cap else 1.0
    if load_ratio >= 1.0:
        return 0.0
    balance = 1.0 - load_ratio
    score += WEIGHT_WORKLOAD * balance

    return round(min(100.0, (score / MAX_SCORE) * 100.0), 2)


def run_smart_assignment_engine(
    *,
    academic_year: str = '',
    dry_run: bool = True,
    excluded_student_ids: Optional[list[int]] = None,
    excluded_encadrant_ids: Optional[list[int]] = None,
    respect_locks: bool = True,
    assignment_strategy: str = 'full',
    assigned_by=None,
) -> dict[str, Any]:
    year = resolve_academic_year(academic_year)
    excluded_students = set(excluded_student_ids or [])
    excluded_encadrants = set(excluded_encadrant_ids or [])
    strategy = assignment_strategy or 'full'

    students_qs = get_eligible_students_queryset(year)
    encadrants_qs = get_available_encadrants_queryset(
        excluded_encadrant_ids=list(excluded_encadrants),
    )

    student_analyses: list[StudentAnalysis] = []
    for sp in students_qs:
        if sp.pk in excluded_students:
            continue
        active_assignment = next(
            (a for a in sp.assignments.all() if a.is_active),
            None,
        )
        if active_assignment is None:
            continue
        analysis = analyze_student(sp, assignment=active_assignment)
        if strategy in ('skip_assigned', 'unassigned_only') and analysis.current_encadrant_id:
            continue
        student_analyses.append(analysis)

    encadrant_analyses: dict[int, EncadrantAnalysis] = {}
    for enc in encadrants_qs:
        encadrant_analyses[enc.pk] = analyze_encadrant(enc)

    projected_loads: dict[int, int] = {eid: 0 for eid in encadrant_analyses}
    for sa in student_analyses:
        if sa.is_locked and respect_locks:
            if sa.current_encadrant_id:
                projected_loads[sa.current_encadrant_id] = projected_loads.get(
                    sa.current_encadrant_id, 0,
                ) + 1
        elif sa.current_encadrant_id and sa.current_encadrant_id not in excluded_encadrants:
            projected_loads[sa.current_encadrant_id] = projected_loads.get(
                sa.current_encadrant_id, 0,
            ) + 1

    student_analyses.sort(
        key=lambda s: (
            -bool(s.internship_type_id),
            -len(s.inferred_domains),
            -bool(s.sector_id),
            s.filiere_code,
        ),
    )

    proposed: list[dict[str, Any]] = []
    unassigned: list[dict[str, Any]] = []
    locked_kept = 0
    specialization_matches = 0
    total_scored = 0

    for sa in student_analyses:
        if sa.is_locked and respect_locks:
            locked_kept += 1
            if sa.current_encadrant_id:
                proposed.append({
                    'student_profile_id': sa.student_profile_id,
                    'assignment_id': sa.assignment_id,
                    'encadrant_profile_id': sa.current_encadrant_id,
                    'match_score': None,
                    'locked': True,
                    'changed': False,
                })
            continue

        best_enc_id: Optional[int] = None
        best_score = -1.0

        for eid, enc in encadrant_analyses.items():
            max_cap = enc.max_capacity
            if max_cap and projected_loads.get(eid, 0) >= max_cap:
                continue
            if not enc.is_available and projected_loads.get(eid, 0) >= max_cap:
                continue

            score = compute_match_score(
                sa,
                enc,
                projected_load=projected_loads.get(eid, 0),
            )
            if score > best_score:
                best_score = score
                best_enc_id = eid

        if best_enc_id is None or best_score <= 0:
            reason = 'NO_SUITABLE_ENCADRANT'
            if sa.internship_type_id and not any(
                _internship_type_compatible(sa, enc) for enc in encadrant_analyses.values()
            ):
                reason = 'NO_SUPERVISOR_FOR_INTERNSHIP_TYPE'
            unassigned.append(_student_payload(sa, reason=reason))
            continue

        enc = encadrant_analyses[best_enc_id]
        if sa.inferred_domains & set(enc.specialization_domains):
            specialization_matches += 1
        total_scored += 1

        changed = sa.current_encadrant_id != best_enc_id
        proposed.append({
            'student_profile_id': sa.student_profile_id,
            'assignment_id': sa.assignment_id,
            'encadrant_profile_id': best_enc_id,
            'encadrant_user_id': enc.user_id,
            'match_score': best_score,
            'locked': False,
            'changed': changed,
        })
        if changed:
            if sa.current_encadrant_id:
                projected_loads[sa.current_encadrant_id] = max(
                    0,
                    projected_loads.get(sa.current_encadrant_id, 0) - 1,
                )
            projected_loads[best_enc_id] = projected_loads.get(best_enc_id, 0) + 1

    applied_count = 0
    if not dry_run:
        applied_count = _apply_proposals(
            proposed,
            assigned_by=assigned_by,
            respect_locks=respect_locks,
        )
        for enc in encadrants_qs:
            enc.current_workload = _assigned_student_count(enc)
            enc.save(update_fields=['current_workload', 'updated_at'])

    overloaded = sum(
        1
        for eid, enc in encadrant_analyses.items()
        if enc.max_capacity and projected_loads.get(eid, 0) > enc.max_capacity
    )
    available_supervisors = sum(
        1
        for enc in encadrant_analyses.values()
        if enc.is_available
    )

    spec_rate = (
        round((specialization_matches / total_scored) * 100, 1)
        if total_scored
        else 0.0
    )
    assigned_count = sum(1 for p in proposed if p.get('encadrant_profile_id'))
    if not dry_run and applied_count:
        try:
            from apps.history.integrations.smart_assignment import assignment_run_completed

            assignment_run_completed(
                academic_year=year,
                applied_count=applied_count,
                assigned_count=assigned_count,
                unassigned_count=len(unassigned),
                actor=assigned_by,
                dry_run=dry_run,
            )
        except Exception:
            pass
    accuracy = (
        round(
            sum(p['match_score'] for p in proposed if p.get('match_score')) / max(assigned_count, 1),
            1,
        )
        if assigned_count
        else 0.0
    )

    runtime_alerts: list[dict[str, Any]] = []
    if unassigned:
        runtime_alerts.append({
            'code': 'RUNTIME_UNASSIGNED_STUDENTS',
            'severity': 'warning',
            'count': len(unassigned),
        })

    return {
        'academic_year': year,
        'dry_run': dry_run,
        'assignment_strategy': strategy,
        'runtime_alerts': runtime_alerts,
        'stats': {
            'total_eligible_students': len(student_analyses),
            'total_assigned': assigned_count,
            'unassigned_count': len(unassigned),
            'locked_assignments': locked_kept,
            'overloaded_encadrants': overloaded,
            'available_supervisors': available_supervisors,
            'specialization_match_rate': spec_rate,
            'assignment_accuracy': accuracy,
            'applied_changes': applied_count if not dry_run else sum(
                1 for p in proposed if p.get('changed') and not p.get('locked')
            ),
        },
        'proposals': proposed,
        'unassigned_students': unassigned,
        'encadrants': [
            _encadrant_result_payload(encadrant_analyses[eid], projected_loads.get(eid, 0))
            for eid in encadrant_analyses
        ],
    }


def _student_payload(sa: StudentAnalysis, reason: str = '') -> dict[str, Any]:
    return {
        'student_profile_id': sa.student_profile_id,
        'user_id': sa.user_id,
        'full_name': sa.full_name,
        'email': sa.email,
        'filiere': sa.filiere_name,
        'filiere_code': sa.filiere_code,
        'program_family': sa.program_family,
        'level': sa.level_name,
        'class_name': sa.class_name,
        'sector': sa.sector_name,
        'internship_type': sa.internship_type_name,
        'internship_type_id': sa.internship_type_id,
        'internship_category': sa.internship_category,
        'internship_duration': sa.internship_duration,
        'internship_domain': sa.internship_domain,
        'internship_company': sa.internship_company,
        'internship_status': sa.internship_status,
        'academic_year': sa.academic_year,
        'reason': reason,
    }


def _encadrant_result_payload(enc: EncadrantAnalysis, projected_load: int) -> dict[str, Any]:
    max_cap = enc.max_capacity or 0
    load_pct = round((projected_load / max_cap) * 100, 1) if max_cap else 0.0
    return {
        'encadrant_profile_id': enc.encadrant_profile_id,
        'user_id': enc.user_id,
        'full_name': enc.full_name,
        'email': enc.email,
        'specialization_domains': enc.specialization_domains,
        'supervised_internship_type_ids': enc.supervised_internship_type_ids,
        'current_load': projected_load,
        'max_capacity': max_cap,
        'load_percent': load_pct,
        'is_available': enc.is_available,
        'is_overloaded': bool(max_cap and projected_load > max_cap),
    }


@transaction.atomic
def _apply_proposals(
    proposals: list[dict[str, Any]],
    *,
    assigned_by=None,
    respect_locks: bool = True,
) -> int:
    count = 0
    for item in proposals:
        if item.get('locked') and respect_locks:
            continue
        if not item.get('changed', True):
            continue
        assignment_id = item.get('assignment_id')
        encadrant_id = item.get('encadrant_profile_id')
        if not assignment_id:
            continue
        try:
            assignment = Assignment.objects.select_for_update().get(pk=assignment_id, is_active=True)
        except Assignment.DoesNotExist:
            continue
        if assignment.is_locked and respect_locks:
            continue
        assignment.encadrant_profile_id = encadrant_id
        assignment.assignment_source = Assignment.AssignmentSource.AUTO
        score = item.get('match_score')
        assignment.match_score = Decimal(str(score)) if score is not None else None
        assignment.assigned_by = assigned_by
        assignment.save(
            update_fields=[
                'encadrant_profile_id',
                'assignment_source',
                'match_score',
                'assigned_by',
                'updated_at',
            ],
        )
        count += 1
    return count


@transaction.atomic
def manual_reassign_student(
    *,
    student_profile_id: int,
    encadrant_profile_id: Optional[int],
    academic_year: str = '',
    assigned_by=None,
    lock: Optional[bool] = None,
) -> Assignment:
    year = resolve_academic_year(academic_year)
    assignment = Assignment.objects.select_for_update().get(
        student_profile_id=student_profile_id,
        academic_year=year,
        is_active=True,
    )
    if lock is not None:
        assignment.is_locked = lock
    old_encadrant_id = assignment.encadrant_profile_id

    if encadrant_profile_id is not None:
        enc = EncadrantProfile.objects.filter(pk=encadrant_profile_id, is_active=True).first()
        if enc is None:
            raise ValueError('Encadrant not found or inactive.')
        try:
            sp = StudentProfile.objects.select_related('internship_type').get(
                pk=student_profile_id,
            )
            enc_analysis = analyze_encadrant(enc)
            student_analysis = analyze_student(sp, assignment=assignment)
            if not _internship_type_compatible(student_analysis, enc_analysis):
                raise ValueError(
                    'This supervisor does not supervise the student internship type.',
                )
        except StudentProfile.DoesNotExist:
            pass
        load = _assigned_student_count(enc)
        max_cap = enc.max_concurrent_students or 0
        if max_cap and load >= max_cap and assignment.encadrant_profile_id != encadrant_profile_id:
            raise ValueError('Encadrant has reached maximum student capacity.')
        assignment.encadrant_profile_id = encadrant_profile_id
        assignment.assignment_source = Assignment.AssignmentSource.MANUAL
    elif encadrant_profile_id is None:
        assignment.encadrant_profile = None
        assignment.assignment_source = Assignment.AssignmentSource.MANUAL

    assignment.assigned_by = assigned_by
    assignment.save()

    if assignment.encadrant_profile_id:
        enc = assignment.encadrant_profile
        enc.current_workload = _assigned_student_count(enc)
        enc.save(update_fields=['current_workload', 'updated_at'])
    if old_encadrant_id and old_encadrant_id != assignment.encadrant_profile_id:
        old_enc = EncadrantProfile.objects.filter(pk=old_encadrant_id).first()
        if old_enc:
            old_enc.current_workload = _assigned_student_count(old_enc)
            old_enc.save(update_fields=['current_workload', 'updated_at'])
    return assignment


def build_assignment_results_payload(academic_year: str = '') -> dict[str, Any]:
    year = resolve_academic_year(academic_year)
    students_qs = get_eligible_students_queryset(year)
    encadrants_qs = EncadrantProfile.objects.filter(is_active=True).select_related(
        'supervisor_profile__user__profile',
    )

    encadrant_cards: list[dict[str, Any]] = []
    for enc in encadrants_qs:
        enc_analysis = analyze_encadrant(enc)
        assigned_students = []
        for sp in students_qs:
            active_a = next((a for a in sp.assignments.all() if a.is_active), None)
            if not active_a or active_a.encadrant_profile_id != enc.pk:
                continue
            sa = analyze_student(sp, assignment=active_a)
            assigned_students.append({
                **_student_payload(sa),
                'assignment_id': active_a.pk,
                'match_score': float(active_a.match_score) if active_a.match_score else None,
                'is_locked': active_a.is_locked,
                'assignment_source': active_a.assignment_source,
            })
        load = len(assigned_students)
        max_cap = enc_analysis.max_capacity
        encadrant_cards.append({
            **_encadrant_result_payload(enc_analysis, load),
            'students': assigned_students,
        })

    unassigned = []
    for sp in students_qs:
        active_a = next((a for a in sp.assignments.all() if a.is_active), None)
        if active_a and not active_a.encadrant_profile_id:
            sa = analyze_student(sp, assignment=active_a)
            unassigned.append(_student_payload(sa, reason='UNASSIGNED'))

    total_assigned = sum(len(c['students']) for c in encadrant_cards)
    stats = {
        'total_eligible_students': students_qs.count(),
        'total_assigned': total_assigned,
        'unassigned_count': len(unassigned),
        'overloaded_encadrants': sum(1 for c in encadrant_cards if c.get('is_overloaded')),
        'available_supervisors': sum(1 for c in encadrant_cards if c.get('is_available')),
    }

    return {
        'academic_year': year,
        'stats': stats,
        'encadrants': encadrant_cards,
        'unassigned_students': unassigned,
    }
