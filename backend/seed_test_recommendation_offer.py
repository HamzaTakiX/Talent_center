#!/usr/bin/env python
"""
Seed a full demo internship offer that appears in recommendations
for the local Test Student account (student@talent-center.local).

Usage (from backend/):
  python seed_test_recommendation_offer.py
"""
from __future__ import annotations

import io
import os
import sys
from datetime import timedelta
from decimal import Decimal
from urllib.request import Request, urlopen

import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
django.setup()

from django.contrib.auth import get_user_model
from django.core.files.base import ContentFile
from django.utils import timezone
from django.utils.text import slugify

from apps.stage.models import InternshipOffer, OfferTargetingRule, StudentOfferMatchScore
from apps.stage.services.matching_service import compute_match_score, persist_match_score
from apps.stage.models import MatchingHistory

User = get_user_model()

TEST_EMAIL = 'student@talent-center.local'
EXTERNAL_SOURCE = 'local_seed'
EXTERNAL_ID = 'test-student-recommendation-offer-v1'

# Public company logo (same pattern as imported LinkedIn offers).
LOGO_URL = (
    'https://logo.clearbit.com/attaliss.com'
)


def _download_logo() -> ContentFile | None:
    try:
        req = Request(LOGO_URL, headers={'User-Agent': 'TalentCenterSeed/1.0'})
        with urlopen(req, timeout=8) as resp:
            data = resp.read()
        if not data or len(data) < 200:
            return None
        return ContentFile(data, name='attaliss-logo.png')
    except Exception as exc:  # noqa: BLE001
        print(f'  Logo download skipped: {exc}')
        return None


def _generate_logo() -> ContentFile:
    """Local fallback logo so the card always shows an image like other offers."""
    try:
        from PIL import Image, ImageDraw
    except ImportError:
        # Tiny valid PNG (blue square) without Pillow.
        import base64

        png = base64.b64decode(
            'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO5W2fQAAAAASUVORK5CYII='
        )
        return ContentFile(png, name='attaliss-fallback.png')

    img = Image.new('RGB', (256, 256), '#1d4ed8')
    draw = ImageDraw.Draw(img)
    draw.ellipse((28, 28, 228, 228), fill='#3b82f6')
    draw.rounded_rectangle((68, 96, 188, 160), radius=18, fill='white')
    draw.text((108, 108), 'A', fill='#1d4ed8')
    buf = io.BytesIO()
    img.save(buf, format='PNG')
    return ContentFile(buf.getvalue(), name='attaliss-test-logo.png')


def _get_test_student():
    user = User.objects.filter(email=TEST_EMAIL).select_related(
        'student_profile__filiere',
        'student_profile__class_group',
        'student_profile__internship_type',
        'student_profile__academic_level',
    ).first()
    if not user or not getattr(user, 'student_profile', None):
        raise SystemExit(
            f'Compte {TEST_EMAIL} introuvable. Lancez d’abord: python setup_test_student.py'
        )
    return user.student_profile


def _upsert_offer(student) -> InternshipOffer:
    now = timezone.now()
    defaults = {
        'title': 'Assistant Marketing Digital — Offre Test Talent Center',
        'slug': slugify('assistant-marketing-digital-offre-test-talent-center')[:280],
        'description': (
            'Offre de démonstration pour le portail étudiant.\n\n'
            'Vous rejoindrez l’équipe marketing d’Attaliss pour soutenir '
            'les campagnes digitales, le content et le reporting KPI.\n\n'
            'Mission principale :\n'
            '- Concevoir des posts et newsletters\n'
            '- Suivre les performances (GA4, Meta Ads)\n'
            '- Collaborer avec sales & produit sur les campagnes ESCA'
        ),
        'company_name': 'Attaliss',
        'company_website': 'https://attaliss.com',
        'company_description': (
            'Attaliss accompagne les écoles et entreprises sur le matching '
            'talents / stages avec une plateforme orientée carrière.'
        ),
        'location_city': 'Casablanca',
        'location_country': 'Maroc',
        'is_remote': False,
        'is_hybrid': True,
        'offer_type': InternshipOffer.OfferType.INTERNSHIP,
        'duration_months': 1,
        'start_date': (now + timedelta(days=21)).date(),
        'end_date': (now + timedelta(days=51)).date(),
        'application_deadline': now + timedelta(days=14),
        'compensation_amount': Decimal('2500.00'),
        'compensation_currency': 'MAD',
        'compensation_period': InternshipOffer.CompensationPeriod.MONTHLY,
        'required_skills': ['Marketing', 'Excel', 'Communication', 'Canva'],
        'preferred_skills': ['SEO', 'Google Analytics', 'Français', 'Anglais'],
        'required_languages': ['Français', 'Anglais'],
        'min_education_level': InternshipOffer.EducationLevel.BAC_PLUS_2,
        'status': InternshipOffer.Status.OPEN,
        'published_at': now - timedelta(hours=2),
        'opened_at': now - timedelta(hours=2),
        'view_count': 42,
        'application_count': 3,
        'metadata_json': {
            'company_logo': LOGO_URL,
            'seeded_for': 'test_student_recommendations',
            'work_mode': 'hybrid',
            'benefits': [
                'Mentorat marketing',
                'Ticket restaurant',
                'Accès outils Adobe / Notion',
            ],
            'responsibilities': [
                'Créer du contenu pour les réseaux sociaux',
                'Analyser les performances des campagnes',
                'Participer aux réunions hebdomadaires marketing',
            ],
        },
        'external_url': 'https://attaliss.com/careers/test-internship',
        'external_source': EXTERNAL_SOURCE,
        'external_id': EXTERNAL_ID,
    }

    offer, created = InternshipOffer.objects.update_or_create(
        external_source=EXTERNAL_SOURCE,
        external_id=EXTERNAL_ID,
        defaults=defaults,
    )

    logo_file = _download_logo() or _generate_logo()
    offer.company_logo.save(logo_file.name, logo_file, save=True)
    meta = dict(offer.metadata_json or {})
    meta['company_logo'] = LOGO_URL
    offer.metadata_json = meta
    offer.save(update_fields=['metadata_json', 'updated_at'])

    # Replace targeting so Test Student always passes.
    offer.targeting_rules.all().delete()
    rules = []
    if student.filiere_id:
        rules.append(
            OfferTargetingRule(
                offer=offer,
                rule_type=OfferTargetingRule.RuleType.FILIERE,
                value_json={
                    'filiere_ids': [student.filiere_id],
                    'filiere_codes': [student.filiere.code],
                    'labels': [student.filiere.name],
                },
                priority=10,
            )
        )
    if student.class_group_id:
        rules.append(
            OfferTargetingRule(
                offer=offer,
                rule_type=OfferTargetingRule.RuleType.CLASS_GROUP,
                value_json={
                    'class_group_ids': [student.class_group_id],
                    'class_codes': [student.class_group.code],
                    'labels': [student.class_group.name],
                },
                priority=20,
            )
        )
    if student.internship_type_id:
        rules.append(
            OfferTargetingRule(
                offer=offer,
                rule_type=OfferTargetingRule.RuleType.INTERNSHIP_TYPE,
                value_json={
                    'internship_type_ids': [student.internship_type_id],
                    'internship_type_codes': [student.internship_type.code],
                    'labels': [student.internship_type.name],
                },
                priority=30,
            )
        )
    if rules:
        OfferTargetingRule.objects.bulk_create(rules)

    score, reasons, _ = compute_match_score(student, offer)
    persist_match_score(
        student,
        offer,
        trigger=MatchingHistory.Trigger.MANUAL,
    )

    # Boost for demo visibility if still low (e.g. empty student skills).
    match = StudentOfferMatchScore.objects.filter(student_profile=student, offer=offer).first()
    if match and match.score < Decimal('75'):
        match.score = Decimal('88.00')
        match.is_recommended = True
        match.score_breakdown = {
            **(match.score_breakdown or {}),
            'seed_boost': {'reason': 'Demo boost for Test Student', 'score': 88},
        }
        match.save(update_fields=['score', 'is_recommended', 'score_breakdown', 'updated_at'])
        score = match.score

    print(f'  Offer    : {"created" if created else "updated"} — {offer.title}')
    print(f'  Company  : {offer.company_name}')
    print(f'  Status   : {offer.status}')
    print(f'  Logo     : {"file" if offer.company_logo else "url"}')
    print(f'  Match    : {score}')
    print(f'  UUID     : {offer.uuid}')
    return offer


def main():
    student = _get_test_student()
    print('=' * 60)
    print('Seed offre recommandée — Test Student')
    print('=' * 60)
    print(f'  Student  : {student.user.email}')
    print(f'  Filière  : {student.filiere.code if student.filiere_id else "—"}')
    print(f'  Classe   : {student.current_class or "—"}')
    print(
        f'  Type     : {student.internship_type.name if student.internship_type_id else "—"}'
    )
    _upsert_offer(student)
    print('=' * 60)
    print('Rechargez http://localhost:5173/student/internship-offers')
    print('La section « Recommandé pour vous » doit afficher l’offre Attaliss.')
    print('=' * 60)


if __name__ == '__main__':
    main()
