"""Candidate collections — CRUD, ranking, sharing, analytics."""

from __future__ import annotations

from typing import Any, Optional

from django.db import transaction
from django.db.models import Avg, Count

from apps.accounts_et_roles.models import StudentProfile
from apps.stage.models import CandidateCollection, CandidateCollectionItem, InternshipOffer
from apps.stage.services.audit_hooks import record_offer_event
from apps.stage.services.exceptions import OfferValidationError
from apps.stage.services.permissions import assert_can_manage_offers


@transaction.atomic
def create_collection(
    *,
    actor,
    name: str,
    description: str = '',
    linked_offer: InternshipOffer | None = None,
    is_shared: bool = False,
) -> CandidateCollection:
    assert_can_manage_offers(actor)
    collection = CandidateCollection.objects.create(
        name=name,
        description=description,
        owner=actor,
        linked_offer=linked_offer,
        is_shared=is_shared,
    )
    record_offer_event(
        action='CREATE',
        event_code='internship.collection.created',
        summary=f'Collection created: {name}',
        offer_id=linked_offer.pk if linked_offer else 0,
        actor=actor,
        metadata={'collection_id': collection.pk},
    )
    return collection


@transaction.atomic
def add_student_to_collection(
    *,
    collection: CandidateCollection,
    student: StudentProfile,
    actor,
    notes: str = '',
    priority: int = 0,
) -> CandidateCollectionItem:
    assert_can_manage_offers(actor)
    if collection.owner_id != actor.pk and not collection.is_shared:
        raise OfferValidationError('You cannot modify this collection.')
    item, created = CandidateCollectionItem.objects.get_or_create(
        collection=collection,
        student_profile=student,
        defaults={'notes': notes, 'priority': priority, 'added_by': actor},
    )
    if not created:
        item.notes = notes or item.notes
        item.priority = priority
        item.save(update_fields=['notes', 'priority', 'updated_at'])
    return item


@transaction.atomic
def remove_student_from_collection(
    *,
    collection: CandidateCollection,
    student: StudentProfile,
    actor,
) -> None:
    assert_can_manage_offers(actor)
    CandidateCollectionItem.objects.filter(
        collection=collection,
        student_profile=student,
    ).delete()


def rank_collection(collection: CandidateCollection) -> list[CandidateCollectionItem]:
    return list(
        collection.items.select_related('student_profile__user')
        .order_by('-priority', '-added_at')
    )


def collection_analytics(collection: CandidateCollection) -> dict:
    items = collection.items.count()
    return {
        'collection_id': collection.pk,
        'name': collection.name,
        'student_count': items,
        'is_shared': collection.is_shared,
        'linked_offer_id': collection.linked_offer_id,
        'owner_email': collection.owner.email if collection.owner_id else None,
    }


def export_collection_payload(collection: CandidateCollection) -> list[dict]:
    return [
        {
            'student_profile_id': item.student_profile_id,
            'email': item.student_profile.user.email,
            'priority': item.priority,
            'notes': item.notes,
            'added_at': item.added_at.isoformat(),
        }
        for item in rank_collection(collection)
    ]
