"""Service-layer tests for the CV lifecycle.

These run without hitting the API layer so failures are easy to localise.
"""

from django.contrib.auth import get_user_model
from django.db import IntegrityError
from django.test import TestCase

from apps.accounts_et_roles.models import StudentProfile
from apps.cv_builder.constants import SectionType
from apps.cv_builder.models import CvSection, CvTemplate, StudentCv
from apps.cv_builder.services import cv_service, section_service, version_service
from apps.cv_builder.services.template_service import seed_builtin_templates

User = get_user_model()


class CvServiceTests(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.user = User.objects.create_user(
            email='student1@example.com',
            password='Pw!12345',
            role=User.RoleChoices.STUDENT,
        )
        cls.profile, _ = StudentProfile.objects.get_or_create(
            user=cls.user,
            defaults={'professional_summary': 'Test summary.'},
        )
        seed_builtin_templates()

    def test_create_student_cv_seeds_default_sections_and_marks_primary(self):
        cv = cv_service.create_student_cv(self.profile, title='CV A')
        self.assertTrue(cv.is_primary)
        self.assertGreater(cv.sections.count(), 0)
        self.assertTrue(
            cv.sections.filter(section_type=SectionType.SUMMARY).exists(),
        )

    def test_second_cv_is_not_primary_by_default(self):
        first = cv_service.create_student_cv(self.profile, title='First')
        second = cv_service.create_student_cv(self.profile, title='Second')
        self.assertTrue(first.is_primary)
        self.assertFalse(second.is_primary)

    def test_make_primary_is_exclusive(self):
        first = cv_service.create_student_cv(self.profile, title='First')
        second = cv_service.create_student_cv(self.profile, title='Second')
        cv_service.make_primary(second)
        first.refresh_from_db()
        second.refresh_from_db()
        self.assertFalse(first.is_primary)
        self.assertTrue(second.is_primary)

    def test_primary_unique_constraint(self):
        cv_service.create_student_cv(self.profile, title='First')
        other = StudentCv.objects.create(
            student_profile=self.profile,
            template=CvTemplate.objects.first(),
            title='Bypass',
            is_primary=False,
        )
        other.is_primary = True
        with self.assertRaises(IntegrityError):
            other.save()

    def test_switch_template_preserves_content(self):
        cv = cv_service.create_student_cv(self.profile, title='Switch test')
        summary = cv.sections.get(section_type=SectionType.SUMMARY)
        summary.content_json = {'text': 'Keep me.'}
        summary.save()

        other = CvTemplate.objects.exclude(pk=cv.template_id).filter(is_active=True).first()
        cv_service.switch_template(cv, other)

        summary.refresh_from_db()
        cv.refresh_from_db()
        self.assertEqual(cv.template_id, other.pk)
        self.assertEqual(summary.content_json, {'text': 'Keep me.'})

    def test_reorder_sections(self):
        cv = cv_service.create_student_cv(self.profile, title='Reorder')
        ids = list(cv.sections.values_list('pk', flat=True))
        reversed_ids = list(reversed(ids))
        section_service.reorder_sections(cv, reversed_ids)
        actual = list(cv.sections.order_by('order_index').values_list('pk', flat=True))
        self.assertEqual(actual, reversed_ids)

    def test_delete_primary_forbidden_when_others_exist(self):
        first = cv_service.create_student_cv(self.profile, title='Primary')
        cv_service.create_student_cv(self.profile, title='Secondary')
        from django.core.exceptions import ValidationError
        with self.assertRaises(ValidationError):
            cv_service.delete_student_cv(first)

    def test_snapshot_and_restore_round_trip(self):
        cv = cv_service.create_student_cv(self.profile, title='VersionMe')
        summary = cv.sections.get(section_type=SectionType.SUMMARY)
        summary.content_json = {'text': 'V1 summary'}
        summary.save()

        v1 = version_service.snapshot(cv, note='before edit')

        summary.content_json = {'text': 'V2 summary'}
        summary.save()
        section_count_before_restore = cv.sections.count()

        version_service.restore(cv, v1)
        cv.refresh_from_db()

        restored = cv.sections.get(section_type=SectionType.SUMMARY)
        self.assertEqual(restored.content_json, {'text': 'V1 summary'})
        # Restore preserves the section shape
        self.assertEqual(cv.sections.count(), section_count_before_restore)
