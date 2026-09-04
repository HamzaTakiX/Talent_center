"""Regression tests for offer creation by URL import, and for the targeting gate.

Run with:
    python manage.py test apps.stage.tests --settings=core.settings_test
"""

from __future__ import annotations

from datetime import timedelta
from unittest.mock import patch

import requests
from django.contrib.auth import get_user_model
from django.test import TestCase
from django.utils import timezone

from apps.admin_management.models import AdminProfile
from apps.stage.models import InternshipOffer, OfferImportHistory, OfferImportJob
from apps.stage.services.exceptions import OfferValidationError, StageServiceError
from apps.stage.services.import_html import HtmlFetchError, fetch_html, validate_url_format
from apps.stage.services.import_parsers import IndeedParser, LinkedInParser
from apps.stage.services.offer_import_service import (
    _build_offer_payload,
    approve_import_and_publish,
    failure_message,
    run_import_extraction,
    save_import_as_draft,
    start_import_from_url,
)
from apps.stage.services.offer_service import (
    create_offer_draft,
    missing_publish_requirements,
    publish_offer,
)
from apps.stage.services.offer_types import resolve_offer_type

User = get_user_model()

VALID_TARGETING = {
    'programs': ['Informatique'],
    'levels': ['Bac+5'],
}


def make_admin(email: str = 'stage.admin@esca.test') -> User:
    """Platform admin allowed to manage internship offers."""
    user = User.objects.create_user(email=email, password='StrongPass!234')
    user.role = User.RoleChoices.ADMIN
    user.is_staff = True
    user.save(update_fields=['role', 'is_staff'])
    AdminProfile.objects.create(
        user=user,
        admin_level=AdminProfile.AdminLevel.SUPER,
        extra_permission_codes=['internship.manage'],
        is_active=True,
    )
    return user


class FakeResponse:
    def __init__(self, *, status_code=200, url='https://jobs.example.com/offer/1', content=b'', content_type='text/html; charset=utf-8'):
        self.status_code = status_code
        self.url = url
        self.content = content
        self.headers = {'Content-Type': content_type}
        self.encoding = 'utf-8'


# ---------------------------------------------------------------------------
# A. Creation from a URL
# ---------------------------------------------------------------------------

class UrlFormatValidationTests(TestCase):
    def test_accepts_full_url_with_query_parameters(self):
        url = 'https://www.rekrute.com/offre-emploi-stage.html?utm_source=news&id=42#apply'
        self.assertEqual(validate_url_format(url), url)

    def test_rejects_malformed_urls_with_invalid_url_code(self):
        for candidate in ('', '   ', 'not a url', 'www.rekrute.com/offre', 'ftp://rekrute.com/x', 'https://'):
            with self.subTest(candidate=candidate):
                with self.assertRaises(HtmlFetchError) as ctx:
                    validate_url_format(candidate)
                self.assertEqual(ctx.exception.code, 'invalid_url')


class FetchHtmlErrorCodeTests(TestCase):
    """`fetch_html` must classify failures so the user gets an actionable message."""

    def _fetch(self, response=None, exception=None):
        with patch('apps.stage.services.import_html.requests.get') as mocked:
            if exception is not None:
                mocked.side_effect = exception
            else:
                mocked.return_value = response
            with self.assertRaises(HtmlFetchError) as ctx:
                fetch_html('https://jobs.example.com/offer/1')
            self.assertEqual(mocked.call_count, 1, 'fetch_html must issue exactly one GET')
        return ctx.exception

    def test_403_is_reported_as_blocked_not_as_a_broken_url(self):
        self.assertEqual(self._fetch(FakeResponse(status_code=403)).code, 'blocked')

    def test_429_is_reported_as_blocked(self):
        self.assertEqual(self._fetch(FakeResponse(status_code=429)).code, 'blocked')

    def test_401_is_reported_as_blocked(self):
        self.assertEqual(self._fetch(FakeResponse(status_code=401)).code, 'blocked')

    def test_linkedin_999_is_reported_as_blocked_not_unreachable(self):
        """LinkedIn's anti-crawler status must not read as a broken link."""
        self.assertEqual(self._fetch(FakeResponse(status_code=999)).code, 'blocked')

    def test_404_is_reported_as_not_found(self):
        self.assertEqual(self._fetch(FakeResponse(status_code=404)).code, 'not_found')

    def test_500_is_reported_as_unreachable(self):
        self.assertEqual(self._fetch(FakeResponse(status_code=500)).code, 'unreachable')

    def test_pdf_response_is_reported_as_not_html(self):
        exc = self._fetch(FakeResponse(content=b'%PDF-1.7', content_type='application/pdf'))
        self.assertEqual(exc.code, 'not_html')

    def test_empty_body_is_reported_as_empty_page(self):
        self.assertEqual(self._fetch(FakeResponse(content=b'   \n  ')).code, 'empty_page')

    def test_timeout_is_reported_as_timeout(self):
        self.assertEqual(self._fetch(exception=requests.Timeout()).code, 'timeout')

    def test_connection_error_is_reported_as_unreachable(self):
        self.assertEqual(self._fetch(exception=requests.ConnectionError()).code, 'unreachable')

    def test_no_placeholder_offer_is_invented_for_a_blocked_job_board(self):
        """A refused fetch must surface as an error, not a stand-in offer.

        LinkedIn and Indeed used to answer a blocked request with a fabricated
        offer titled "Imported LinkedIn offer". The import then reported success,
        and the operator only discovered the page had never been read when
        publishing refused the empty draft.
        """
        for parser in (LinkedInParser(), IndeedParser()):
            with self.subTest(parser=parser.parser_name):
                with patch('apps.stage.services.import_html.requests.get') as mocked:
                    mocked.return_value = FakeResponse(status_code=999)
                    with self.assertRaises(HtmlFetchError) as ctx:
                        parser.extract('https://www.linkedin.com/jobs/view/1')
                self.assertEqual(ctx.exception.code, 'blocked')

    def test_reachable_job_board_page_without_content_reports_no_content(self):
        with patch('apps.stage.services.import_html.requests.get') as mocked:
            mocked.return_value = FakeResponse(
                content=b'<html><body><div id="app"></div></body></html>',
            )
            with self.assertRaises(HtmlFetchError) as ctx:
                LinkedInParser().extract('https://www.linkedin.com/jobs/view/1')
        self.assertEqual(ctx.exception.code, 'no_content_extracted')

    def test_successful_fetch_returns_html_and_final_url(self):
        with patch('apps.stage.services.import_html.requests.get') as mocked:
            mocked.return_value = FakeResponse(
                content='<html><body><h1>Stage PFE</h1></body></html>'.encode('utf-8'),
                url='https://jobs.example.com/offer/1?ref=1',
            )
            html, final_url = fetch_html('https://jobs.example.com/offer/1')
        self.assertIn('Stage PFE', html)
        self.assertEqual(final_url, 'https://jobs.example.com/offer/1?ref=1')


class FailureMessageTests(TestCase):
    def test_every_known_code_has_operator_facing_wording(self):
        for code in (
            'invalid_url', 'unreachable', 'not_found', 'timeout', 'blocked',
            'not_html', 'empty_page', 'unsupported_website',
            'no_content_extracted', 'extraction_failed',
        ):
            with self.subTest(code=code):
                message = failure_message(code)
                self.assertTrue(message)
                self.assertNotIn('Traceback', message)
                self.assertNotIn('Exception', message)

    def test_unknown_code_falls_back_to_a_generic_actionable_message(self):
        self.assertEqual(failure_message('some_new_driver_error'), failure_message('extraction_failed'))


class StartImportFromUrlTests(TestCase):
    def setUp(self):
        self.actor = make_admin()

    def test_unreachable_url_raises_a_user_safe_error_and_creates_no_job(self):
        with patch(
            'apps.stage.services.offer_import_service.check_url_reachable',
            side_effect=HtmlFetchError('Website is unreachable.', code='unreachable'),
        ):
            with self.assertRaises(StageServiceError) as ctx:
                start_import_from_url(actor=self.actor, source_url='https://offline.example.com/offer')
        self.assertEqual(ctx.exception.code, 'unreachable')
        self.assertEqual(str(ctx.exception), failure_message('unreachable'))
        self.assertEqual(OfferImportJob.objects.count(), 0)

    def test_malformed_url_raises_invalid_url(self):
        with self.assertRaises(StageServiceError) as ctx:
            start_import_from_url(actor=self.actor, source_url='definitely-not-a-url')
        self.assertEqual(ctx.exception.code, 'invalid_url')

    def test_reachable_url_opens_a_job_and_records_history(self):
        with patch(
            'apps.stage.services.offer_import_service.check_url_reachable',
            return_value='https://www.rekrute.com/offre-emploi.html',
        ):
            job = start_import_from_url(
                actor=self.actor,
                source_url='https://www.rekrute.com/offre-emploi.html?utm=x',
            )
        self.assertEqual(job.status, OfferImportJob.Status.PENDING)
        self.assertTrue(
            job.history.filter(step=OfferImportHistory.Step.URL_VALIDATED).exists(),
        )


class RunImportExtractionTests(TestCase):
    """The failure bookkeeping must survive; it used to be rolled back."""

    def setUp(self):
        self.actor = make_admin()
        self.job = OfferImportJob.objects.create(
            source_url='https://jobs.example.com/offer/1',
            detected_platform=OfferImportJob.Platform.COMPANY_WEBSITE,
            status=OfferImportJob.Status.PENDING,
            initiated_by=self.actor,
        )

    def _extraction_error(self, exception):
        with patch(
            'apps.stage.services.offer_import_service.extract_offer_from_url',
            side_effect=exception,
        ):
            with self.assertRaises(StageServiceError) as ctx:
                run_import_extraction(self.job, actor=self.actor)
        return ctx.exception

    def test_fetch_failure_persists_failed_status_and_history(self):
        exc = self._extraction_error(HtmlFetchError('boom', code='blocked'))

        self.assertEqual(exc.code, 'blocked')
        self.job.refresh_from_db()
        self.assertEqual(self.job.status, OfferImportJob.Status.FAILED)
        self.assertEqual(self.job.error_message, failure_message('blocked'))
        self.assertTrue(self.job.history.filter(step=OfferImportHistory.Step.FAILED).exists())

    def test_unexpected_parser_crash_is_not_surfaced_verbatim(self):
        exc = self._extraction_error(ZeroDivisionError('division by zero'))

        self.assertEqual(exc.code, 'extraction_failed')
        self.assertNotIn('division by zero', str(exc))
        self.job.refresh_from_db()
        self.assertEqual(self.job.status, OfferImportJob.Status.FAILED)
        detail = self.job.history.filter(step=OfferImportHistory.Step.FAILED).first()
        self.assertIn('ZeroDivisionError', detail.payload_json.get('detail', ''))

    def test_reachable_page_without_offer_content_fails_with_a_specific_code(self):
        class Extracted:
            parser_used = 'generic'

            def to_dict(self):
                return {'title': '', 'description': 'too short', 'company_name': ''}

        with patch(
            'apps.stage.services.offer_import_service.extract_offer_from_url',
            return_value=Extracted(),
        ):
            with self.assertRaises(StageServiceError) as ctx:
                run_import_extraction(self.job, actor=self.actor)

        self.assertEqual(ctx.exception.code, 'no_content_extracted')
        self.job.refresh_from_db()
        self.assertEqual(self.job.status, OfferImportJob.Status.FAILED)

    def test_successful_extraction_reaches_preview_ready(self):
        class Extracted:
            parser_used = 'company_website'

            def to_dict(self):
                return {
                    'title': 'Stage PFE Développeur Full Stack',
                    'company_name': 'TechCorp Maroc',
                    'description': 'Une description suffisamment longue pour être exploitable par la plateforme.',
                    'location': 'Casablanca',
                    'skills': 'React, Django',
                    'internship_type': 'PFE',
                }

        with patch(
            'apps.stage.services.offer_import_service.extract_offer_from_url',
            return_value=Extracted(),
        ):
            job = run_import_extraction(self.job, actor=self.actor)

        self.assertEqual(job.status, OfferImportJob.Status.PREVIEW_READY)
        self.assertEqual(job.normalized_data['company_name'], 'TechCorp Maroc')
        self.assertEqual(job.normalized_data['offer_type'], InternshipOffer.OfferType.PFE)


# ---------------------------------------------------------------------------
# B. Offer type normalisation (invalid values used to reach the DB column)
# ---------------------------------------------------------------------------

class OfferTypeResolutionTests(TestCase):
    def test_frontend_tokens_map_to_canonical_choices(self):
        canonical = {choice for choice, _label in InternshipOffer.OfferType.choices}
        cases = {
            'pfe': InternshipOffer.OfferType.PFE,
            'PFE': InternshipOffer.OfferType.PFE,
            'Stage PFE': InternshipOffer.OfferType.PFE,
            "Stage de fin d'études": InternshipOffer.OfferType.PFE,
            'pfa': InternshipOffer.OfferType.PFA,
            'summer': InternshipOffer.OfferType.INTERNSHIP,
            'observation': InternshipOffer.OfferType.INTERNSHIP,
            'alternance': InternshipOffer.OfferType.ALTERNANCE,
            'CDI': InternshipOffer.OfferType.JOB,
            # ESCA academic catalog slugs sent by the admin studio.
            'mission-pro': InternshipOffer.OfferType.INTERNSHIP,
            'bras-droit': InternshipOffer.OfferType.INTERNSHIP,
        }
        for token, expected in cases.items():
            with self.subTest(token=token):
                self.assertEqual(resolve_offer_type(token), expected)

        for token in ('', None, 'STAGE_OBLIGATOIRE_M1_ESCA', 'unknown-token-42'):
            with self.subTest(token=token):
                self.assertIn(resolve_offer_type(token), canonical)

    def test_resolved_value_always_fits_the_column(self):
        max_length = InternshipOffer._meta.get_field('offer_type').max_length
        for token in ('a very long academic internship type label that will never fit', 'pfe', None):
            self.assertLessEqual(len(resolve_offer_type(token)), max_length)


# ---------------------------------------------------------------------------
# C. Targeting ("ciblage manquant")
# ---------------------------------------------------------------------------

class TargetingGateTests(TestCase):
    def setUp(self):
        self.actor = make_admin()
        self.base_payload = {
            'title': 'Stage PFE Data Engineer',
            'company_name': 'TechCorp Maroc',
            'description': 'Description complète du poste proposé aux étudiants.',
            'location_city': 'Casablanca',
            'offer_type': 'pfe',
            'required_skills': ['Python', 'SQL'],
            'application_deadline': timezone.now() + timedelta(days=45),
        }

    def test_offer_with_targeting_publishes(self):
        offer = create_offer_draft(actor=self.actor, data={**self.base_payload, **VALID_TARGETING})
        self.assertTrue(offer.targeting_rules.filter(is_active=True).exists())

        published = publish_offer(offer=offer, actor=self.actor)
        self.assertEqual(published.status, InternshipOffer.Status.OPEN)

    def test_offer_without_targeting_is_refused_with_structured_details(self):
        offer = create_offer_draft(actor=self.actor, data=self.base_payload)
        self.assertFalse(offer.targeting_rules.exists())
        self.assertIn('targeting', missing_publish_requirements(offer))

        with self.assertRaises(OfferValidationError) as ctx:
            publish_offer(offer=offer, actor=self.actor)

        self.assertIn('targeting', ctx.exception.details['missing_fields'])
        offer.refresh_from_db()
        self.assertEqual(offer.status, InternshipOffer.Status.DRAFT)

    def test_draft_creation_never_requires_targeting(self):
        offer = create_offer_draft(actor=self.actor, data=self.base_payload)
        self.assertEqual(offer.status, InternshipOffer.Status.DRAFT)


class ImportPayloadTargetingTests(TestCase):
    """`_build_offer_payload` used to drop the admin's targeting selection.

    That single omission is what produced "ciblage manquant" on every import,
    because `publish_offer` refuses an offer without an active targeting rule.
    """

    def setUp(self):
        self.actor = make_admin()
        self.job = OfferImportJob.objects.create(
            source_url='https://jobs.example.com/offer/7',
            detected_platform=OfferImportJob.Platform.COMPANY_WEBSITE,
            status=OfferImportJob.Status.PREVIEW_READY,
            initiated_by=self.actor,
            normalized_data={
                'title': 'Stage PFE Data Engineer',
                'company_name': 'TechCorp Maroc',
                'description': 'Description issue de la page importée, assez longue.',
                'location_city': 'Casablanca',
                'offer_type': InternshipOffer.OfferType.PFE,
                'required_skills': ['Python'],
                'parser_used': 'company_website',
            },
        )
        self.overrides = {
            **VALID_TARGETING,
            'classes': ['M2-INFO-A'],
            'internship_types': ['PFE'],
            'application_deadline': (timezone.now() + timedelta(days=30)).isoformat(),
            'required_skills': ['Python', 'Airflow'],
            'location_country': 'Maroc',
            'is_remote': True,
            'duration_months': 6,
        }

    def test_payload_keeps_targeting_keys(self):
        payload = _build_offer_payload(self.job, self.overrides)
        self.assertEqual(payload['programs'], ['Informatique'])
        self.assertEqual(payload['levels'], ['Bac+5'])
        self.assertEqual(payload['classes'], ['M2-INFO-A'])
        self.assertEqual(payload['internship_types'], ['PFE'])

    def test_payload_keeps_admin_edited_scalar_fields(self):
        payload = _build_offer_payload(self.job, self.overrides)
        self.assertEqual(payload['location_country'], 'Maroc')
        self.assertTrue(payload['is_remote'])
        self.assertEqual(payload['duration_months'], 6)
        self.assertEqual(payload['required_skills'], ['Python', 'Airflow'])

    def test_draft_from_import_has_targeting_rules(self):
        offer = save_import_as_draft(self.job, actor=self.actor, overrides=self.overrides)
        self.assertTrue(offer.targeting_rules.filter(is_active=True).exists())
        self.assertNotIn('targeting', missing_publish_requirements(offer))

    def test_draft_from_import_has_targeting_even_when_skipping_duplicate_check(self):
        offer = save_import_as_draft(
            self.job,
            actor=self.actor,
            overrides=self.overrides,
            skip_duplicate_check=True,
        )
        self.assertTrue(offer.targeting_rules.filter(is_active=True).exists())

    def test_approve_and_publish_succeeds_with_targeting(self):
        offer = approve_import_and_publish(self.job, actor=self.actor, overrides=self.overrides)
        self.assertEqual(offer.status, InternshipOffer.Status.OPEN)
        self.job.refresh_from_db()
        self.assertEqual(self.job.status, OfferImportJob.Status.COMPLETED)

    def test_approve_without_targeting_reports_the_missing_field_not_a_500(self):
        overrides = {k: v for k, v in self.overrides.items() if k not in ('programs', 'levels', 'classes', 'internship_types')}
        with self.assertRaises(OfferValidationError) as ctx:
            approve_import_and_publish(self.job, actor=self.actor, overrides=overrides)
        self.assertIn('targeting', ctx.exception.details['missing_fields'])

    def test_non_canonical_offer_type_is_preserved_in_metadata(self):
        payload = _build_offer_payload(
            self.job,
            {**self.overrides, 'offer_type': 'STAGE_OBLIGATOIRE_M1_ESCA'},
        )
        self.assertEqual(
            payload['metadata_json']['academic_internship_type'],
            'STAGE_OBLIGATOIRE_M1_ESCA',
        )
        self.assertIn(
            payload['offer_type'],
            {choice for choice, _ in InternshipOffer.OfferType.choices},
        )
