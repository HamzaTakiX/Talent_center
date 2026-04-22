"""
Suggestion engine — turns signals into concrete nudges for students.

A "suggestion" is an action the student can take that would improve
their profile health. They are generated idempotently: re-running the
engine never duplicates an open suggestion, and stale ones are closed
when the underlying condition is resolved.
"""

from __future__ import annotations

from django.utils import timezone

from apps.accounts_et_roles.models import StudentProfile

from ..models import (
    StudentProfileRisk,
    StudentProfileSuggestion,
)


def _ensure_suggestion(
    *,
    student_profile: StudentProfile,
    suggestion_type: str,
    title: str,
    priority: str,
    metadata: dict | None = None,
) -> StudentProfileSuggestion:
    """
    Idempotent upsert keyed on (student, suggestion_type, title) while
    the suggestion is still open. Prevents the engine from flooding the
    UI on every run.
    """
    existing = (
        StudentProfileSuggestion.objects
        .filter(
            student_profile=student_profile,
            suggestion_type=suggestion_type,
            title=title,
            is_completed=False,
        )
        .first()
    )
    if existing:
        if existing.priority != priority:
            existing.priority = priority
            existing.save(update_fields=['priority', 'updated_at'])
        return existing
    return StudentProfileSuggestion.objects.create(
        student_profile=student_profile,
        suggestion_type=suggestion_type,
        title=title,
        priority=priority,
        metadata_json=metadata or {},
    )


def generate_suggestions(student_profile: StudentProfile) -> list[StudentProfileSuggestion]:
    """
    Produce the current set of open suggestions for a student.

    Reads profile state + active risks and maps them to suggestions.
    Callers typically run this after detect_risk().
    """
    suggestions: list[StudentProfileSuggestion] = []

    # --- Profile-driven suggestions ---
    if not student_profile.identity_confirmed:
        suggestions.append(
            _ensure_suggestion(
                student_profile=student_profile,
                suggestion_type=StudentProfileSuggestion.SuggestionType.PROFILE,
                title='Confirm your identity to unlock the platform',
                priority=StudentProfileSuggestion.Priority.CRITICAL,
            )
        )
    if not student_profile.profile_completed:
        suggestions.append(
            _ensure_suggestion(
                student_profile=student_profile,
                suggestion_type=StudentProfileSuggestion.SuggestionType.PROFILE,
                title='Complete your student profile',
                priority=StudentProfileSuggestion.Priority.HIGH,
            )
        )
    if not student_profile.career_objective:
        suggestions.append(
            _ensure_suggestion(
                student_profile=student_profile,
                suggestion_type=StudentProfileSuggestion.SuggestionType.CAREER,
                title='Describe your career objective',
                priority=StudentProfileSuggestion.Priority.MEDIUM,
            )
        )
    if not student_profile.availability:
        suggestions.append(
            _ensure_suggestion(
                student_profile=student_profile,
                suggestion_type=StudentProfileSuggestion.SuggestionType.CAREER,
                title='Set your availability for internships',
                priority=StudentProfileSuggestion.Priority.MEDIUM,
            )
        )

    # --- Risk-driven suggestions ---
    active_risks = StudentProfileRisk.objects.filter(
        student_profile=student_profile,
        is_active=True,
    )
    for risk in active_risks:
        if risk.risk_type == 'missing_cv':
            suggestions.append(
                _ensure_suggestion(
                    student_profile=student_profile,
                    suggestion_type=StudentProfileSuggestion.SuggestionType.CV,
                    title='Create your first CV',
                    priority=StudentProfileSuggestion.Priority.HIGH,
                )
            )
        elif risk.risk_type == 'inactivity':
            suggestions.append(
                _ensure_suggestion(
                    student_profile=student_profile,
                    suggestion_type=StudentProfileSuggestion.SuggestionType.ENGAGEMENT,
                    title='Come back and continue your setup',
                    priority=StudentProfileSuggestion.Priority.MEDIUM,
                )
            )

    return suggestions


def mark_suggestion_completed(suggestion_id: int) -> StudentProfileSuggestion:
    """Close a suggestion — typically called from the API."""
    suggestion = StudentProfileSuggestion.objects.get(pk=suggestion_id)
    if not suggestion.is_completed:
        suggestion.is_completed = True
        suggestion.completed_at = timezone.now()
        suggestion.save(update_fields=['is_completed', 'completed_at', 'updated_at'])
    return suggestion
