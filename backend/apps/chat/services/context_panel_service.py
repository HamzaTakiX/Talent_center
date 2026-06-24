"""Enriched conversation context panel — real backend data only."""

from __future__ import annotations

from typing import Any

from apps.accounts_et_roles.models import StudentProfile
from apps.chat.models import Conversation, ConversationContext
from apps.chat.permissions import user_can_access_conversation
from apps.stage.models import InternshipOffer, OfferApplication, StudentOfferMatchScore
from apps.stage.services.chat_service import get_application_for_chat, offer_uuid_from_context
from apps.stage.services.student_journey_service import (
    _latest_cv_analysis_score,
    get_application_readiness,
    list_student_applications,
)


def _profile_intelligence_scores(student: StudentProfile) -> dict[str, Any]:
    cv_score = _latest_cv_analysis_score(student)
    readiness_label = None
    if cv_score is not None:
        readiness_label = 'high' if cv_score >= 68 else 'building'
    return {'ats_score': cv_score, 'internship_readiness': readiness_label}


def build_context_panel(user, conversation: Conversation) -> dict[str, Any] | None:
    if not user_can_access_conversation(user, conversation):
        return None

    ctx = getattr(conversation, 'context', None)
    if not ctx:
        return {'conversation_id': conversation.pk}

    snap = ctx.context_snapshot_json or {}
    student_profile_id = snap.get('student_profile_id')
    student: StudentProfile | None = None
    if student_profile_id:
        student = (
            StudentProfile.objects.select_related(
                'user',
                'filiere',
                'class_group',
                'academic_level',
                'internship_type',
            )
            .filter(pk=student_profile_id)
            .first()
        )
    elif ctx.student_user_id:
        student = StudentProfile.objects.select_related(
            'user', 'filiere', 'class_group', 'academic_level', 'internship_type'
        ).filter(user_id=ctx.student_user_id).first()

    offer: InternshipOffer | None = None
    offer_uuid = offer_uuid_from_context(ctx)
    if offer_uuid:
        offer = InternshipOffer.objects.filter(uuid=offer_uuid).first()

    application: OfferApplication | None = None
    if student and offer:
        application = get_application_for_chat(offer, student)

    cv_score = _latest_cv_analysis_score(student) if student else None
    intel = _profile_intelligence_scores(student) if student else {'ats_score': None, 'internship_readiness': None}

    match_score = None
    if student and offer:
        row = StudentOfferMatchScore.objects.filter(student_profile=student, offer=offer).first()
        if row:
            match_score = float(row.score)
        elif application and application.match_score_at_apply is not None:
            match_score = float(application.match_score_at_apply)

    readiness = None
    if student and offer:
        readiness = get_application_readiness(student, offer)

    applications = list_student_applications(student, active_only=False) if student else []

    interview_status = None
    if application:
        interview_status = snap.get('interview_at') or application.metadata_json.get('interview_status')

    return {
        'conversation_id': conversation.pk,
        'conversation_type': ctx.conversation_type,
        'workflow_state': ctx.workflow_state,
        'priority': ctx.urgency,
        'assigned_to_id': ctx.assigned_to_id,
        'student': {
            'profile_id': student.pk if student else snap.get('student_profile_id'),
            'user_id': student.user_id if student else ctx.student_user_id,
            'name': snap.get('student_name') or (f'{student.user.first_name} {student.user.last_name}'.strip() if student and student.user else ''),
            'email': snap.get('student_email') or (student.user.email if student and student.user else ''),
            'phone': snap.get('student_phone') or '',
            'program': snap.get('filiere_name') or (student.filiere.name if student and student.filiere else ''),
            'academic_level': snap.get('academic_level') or (
                student.academic_level.name if student and student.academic_level else ''
            ),
            'class': snap.get('class_code') or (student.class_group.code if student and student.class_group else ''),
            'cv_score': cv_score,
            'ats_score': intel.get('ats_score'),
            'internship_readiness': intel.get('internship_readiness'),
        },
        'offer': {
            'id': offer.pk if offer else snap.get('offer_id'),
            'uuid': str(offer.uuid) if offer else snap.get('offer_uuid'),
            'title': offer.title if offer else snap.get('offer_title'),
            'company': offer.company_name if offer else snap.get('company_name'),
            'deadline': offer.application_deadline.isoformat() if offer and offer.application_deadline else snap.get('application_deadline'),
            'internship_type': snap.get('internship_type') or (offer.offer_type if offer else ''),
        },
        'application': {
            'id': application.pk if application else snap.get('application_id'),
            'uuid': str(application.uuid) if application else snap.get('application_uuid'),
            'status': application.status if application else snap.get('application_status'),
            'applied_at': application.applied_at.isoformat() if application and application.applied_at else snap.get('applied_at'),
            'interview_status': interview_status,
            'match_score': match_score,
        },
        'current_applications': applications[:10],
        'readiness': readiness,
    }
