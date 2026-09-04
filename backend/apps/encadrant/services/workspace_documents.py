"""Workspace document center — upload, review and view tracking."""

from __future__ import annotations

from pathlib import Path

from django.utils import timezone
from rest_framework.exceptions import PermissionDenied, ValidationError

from apps.accounts_et_roles.models import User
from apps.encadrant.models import WorkspaceDocument, WorkspaceDocumentReview
from apps.encadrant.services.meeting_authorization import (
    get_encadrant_profile,
    get_student_profile,
    pair_is_allowed,
    resolve_student_encadrant_for_user,
    supervised_student_ids,
)

ALLOWED_EXTENSIONS = {
    '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.md', '.txt',
}
MAX_UPLOAD_BYTES = 10 * 1024 * 1024
VALID_CATEGORIES = {choice.value for choice in WorkspaceDocument.Category}
VALID_REVIEW_STATUSES = {choice.value for choice in WorkspaceDocumentReview.Status}


def format_size(size_bytes: int) -> str:
    if size_bytes >= 1024 * 1024:
        return f'{size_bytes / (1024 * 1024):.1f} MB'
    if size_bytes >= 1024:
        return f'{int(round(size_bytes / 1024))} KB'
    return f'{size_bytes} B'


def infer_category(filename: str) -> str:
    name = filename.lower()
    if any(token in name for token in ('chapter', 'rapport', 'report', 'memoire', 'thesis')):
        return WorkspaceDocument.Category.REPORT
    if any(token in name for token in ('ref', 'biblio', 'research', 'dataset')):
        return WorkspaceDocument.Category.RESEARCH
    if any(token in name for token in ('stage', 'convention', 'internship', 'evaluation')):
        return WorkspaceDocument.Category.INTERNSHIP
    if any(token in name for token in ('meeting', 'reunion', 'minutes', 'slides')):
        return WorkspaceDocument.Category.MEETING
    return WorkspaceDocument.Category.SHARED


def _display_name(user: User | None) -> str:
    if not user:
        return ''
    return user.full_name or user.email


def serialize_document(document: WorkspaceDocument) -> dict:
    review = getattr(document, 'review', None)
    review_payload = None
    if review:
        review_payload = {
            'comment': review.comment,
            'grade': review.grade,
            'status': review.status,
            'authorName': _display_name(review.author),
            'updatedAt': review.updated_at.isoformat() if review.updated_at else None,
        }
    return {
        'id': document.pk,
        'name': document.original_name,
        'category': document.category,
        'fileUrl': document.file.url if document.file else '',
        'mimeType': document.mime_type,
        'sizeBytes': document.size_bytes,
        'sizeLabel': format_size(document.size_bytes),
        'version': f'v{document.version}',
        'uploadedBy': {
            'id': document.uploaded_by_id,
            'name': _display_name(document.uploaded_by),
        },
        'uploadedAt': document.created_at.isoformat() if document.created_at else None,
        'review': review_payload,
        'viewedByEncadrant': document.viewed_by_encadrant_at is not None,
        'viewedByEncadrantAt': (
            document.viewed_by_encadrant_at.isoformat()
            if document.viewed_by_encadrant_at
            else None
        ),
    }


def resolve_document_scope(user: User, student_profile_id: int | None = None):
    if user.role == User.RoleChoices.STUDENT:
        student = get_student_profile(user)
        encadrant = None
        try:
            _, encadrant = resolve_student_encadrant_for_user(user)
        except PermissionDenied:
            encadrant = None
        return student, encadrant

    if user.role == User.RoleChoices.SUPERVISOR:
        encadrant = get_encadrant_profile(user)
        if not student_profile_id:
            raise ValidationError({'student_profile_id': 'Required.'})
        student, _ = resolve_student_encadrant_for_user(
            user,
            student_profile_id=int(student_profile_id),
        )
        return student, encadrant

    raise PermissionDenied('Only students and supervisors may access workspace documents.')


def list_documents_for_user(user: User, student_profile_id: int | None = None):
    student, _encadrant = resolve_document_scope(user, student_profile_id)
    return (
        WorkspaceDocument.objects.filter(student_profile=student)
        .select_related('uploaded_by', 'review__author')
        .order_by('-created_at')
    )


def get_accessible_document(user: User, document_id: int) -> WorkspaceDocument:
    document = (
        WorkspaceDocument.objects.select_related(
            'student_profile',
            'encadrant_profile',
            'uploaded_by',
            'review__author',
        )
        .filter(pk=document_id)
        .first()
    )
    if not document:
        raise ValidationError({'document': 'Not found.'})

    if user.role == User.RoleChoices.STUDENT:
        student = get_student_profile(user)
        if document.student_profile_id != student.pk:
            raise PermissionDenied('You cannot access this document.')
        return document

    if user.role == User.RoleChoices.SUPERVISOR:
        encadrant = get_encadrant_profile(user)
        allowed = supervised_student_ids(encadrant)
        if document.student_profile_id not in allowed:
            raise PermissionDenied('Student not under your supervision.')
        if not pair_is_allowed(document.student_profile_id, encadrant.pk):
            raise PermissionDenied('Student is not assigned to this encadrant.')
        return document

    raise PermissionDenied('Only students and supervisors may access workspace documents.')


def create_document(user: User, upload, category: str | None = None) -> WorkspaceDocument:
    if user.role != User.RoleChoices.STUDENT:
        raise PermissionDenied('Only the student can import workspace documents.')
    if not upload:
        raise ValidationError({'file': 'Required.'})

    filename = Path(getattr(upload, 'name', '') or 'document').name
    extension = Path(filename).suffix.lower()
    if extension not in ALLOWED_EXTENSIONS:
        raise ValidationError({'file': 'Unsupported file type.'})
    if getattr(upload, 'size', 0) > MAX_UPLOAD_BYTES:
        raise ValidationError({'file': 'File exceeds 10 MB.'})

    student, encadrant = resolve_document_scope(user)
    chosen = (category or '').strip().lower()
    if chosen not in VALID_CATEGORIES:
        chosen = infer_category(filename)

    existing = WorkspaceDocument.objects.filter(
        student_profile=student,
        original_name=filename,
    ).count()

    return WorkspaceDocument.objects.create(
        student_profile=student,
        encadrant_profile=encadrant,
        file=upload,
        original_name=filename,
        category=chosen,
        mime_type=getattr(upload, 'content_type', '') or '',
        size_bytes=getattr(upload, 'size', 0) or 0,
        uploaded_by=user,
        version=existing + 1,
    )


def delete_document(user: User, document: WorkspaceDocument) -> None:
    if user.role != User.RoleChoices.STUDENT:
        raise PermissionDenied('Only the student can delete a workspace document.')
    student = get_student_profile(user)
    if document.student_profile_id != student.pk:
        raise PermissionDenied('You cannot delete this document.')
    if document.file:
        document.file.delete(save=False)
    document.delete()


def upsert_review(
    user: User,
    document: WorkspaceDocument,
    *,
    comment: str = '',
    grade: str = '',
    status: str | None = None,
) -> WorkspaceDocumentReview:
    if user.role != User.RoleChoices.SUPERVISOR:
        raise PermissionDenied('Only the supervisor can review a document.')
    get_accessible_document(user, document.pk)

    cleaned_comment = (comment or '').strip()
    cleaned_grade = (grade or '').strip()[:32]
    if not cleaned_comment and not cleaned_grade:
        raise ValidationError({'comment': 'Provide feedback or a grade.'})

    chosen_status = (status or WorkspaceDocumentReview.Status.PENDING).strip().lower()
    if chosen_status not in VALID_REVIEW_STATUSES:
        raise ValidationError({'status': 'Invalid status.'})

    review, _created = WorkspaceDocumentReview.objects.update_or_create(
        document=document,
        defaults={
            'author': user,
            'comment': cleaned_comment,
            'grade': cleaned_grade,
            'status': chosen_status,
        },
    )
    if document.viewed_by_encadrant_at is None:
        document.viewed_by_encadrant_at = timezone.now()
        document.save(update_fields=['viewed_by_encadrant_at', 'updated_at'])
    return review


def mark_viewed_by_encadrant(user: User, document: WorkspaceDocument) -> WorkspaceDocument:
    if user.role != User.RoleChoices.SUPERVISOR:
        raise PermissionDenied('Only the supervisor can mark a document as viewed.')
    get_accessible_document(user, document.pk)
    if document.viewed_by_encadrant_at is None:
        document.viewed_by_encadrant_at = timezone.now()
        document.save(update_fields=['viewed_by_encadrant_at', 'updated_at'])
    return document
