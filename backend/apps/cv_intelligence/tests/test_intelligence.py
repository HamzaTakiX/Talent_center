from django.test import SimpleTestCase

from apps.cv_intelligence.services.cv_hash import (
    compute_cv_hash_from_builder,
    compute_cv_hash_from_bytes,
)
from apps.cv_intelligence.services.extraction.builder_extractor import builder_payload_to_structured
from apps.cv_intelligence.services.extraction.text_parser import parse_raw_text_to_structured
from apps.cv_intelligence.services.language.detector import detect_languages
from apps.cv_intelligence.services.scoring.ats_engine import analyze_ats
from apps.cv_intelligence.services.scoring.score_engine import compute_scores


class CvIntelligenceExtractionTests(SimpleTestCase):
    def test_builder_extraction(self):
        payload = {
            'details': {'name': 'Ahmed Benali', 'email': 'ahmed@test.com', 'summary': 'Finance student'},
            'skills': ['Excel', 'Power BI', 'Financial Analysis'],
            'education': [{'degree': 'Master Finance', 'institution': 'ESCA'}],
            'workExp': [{'position': 'Stage Analyste', 'company': 'BMCE', 'dates': '2025'}],
        }
        structured = builder_payload_to_structured(payload)
        self.assertEqual(structured['name'], 'Ahmed Benali')
        self.assertIn('Excel', structured['skills'])
        self.assertGreaterEqual(len(structured['internship_history']), 1)

    def test_text_parser_email(self):
        text = 'Jean Dupont\njean.dupont@email.com\n+212 600 000000\nCompétences: Python, SQL'
        structured = parse_raw_text_to_structured(text)
        self.assertEqual(structured['email'], 'jean.dupont@email.com')

    def test_language_detection_mixed(self):
        text = 'Expérience professionnelle\nPython developer\nخبرة في البرمجة'
        langs = detect_languages(text)
        self.assertTrue('fr' in langs or 'en' in langs)

    def test_scoring_is_deterministic(self):
        structured = {
            'name': 'Test',
            'email': 't@t.com',
            'skills': ['Python', 'Django', 'React', 'SQL', 'Git'],
            'education': ['Master'],
            'experience': ['Dev Intern — Company'],
            'professional_summary': 'Developer',
        }
        ats = analyze_ats(structured)
        scores1 = compute_scores(structured, ats, {})
        scores2 = compute_scores(structured, ats, {})
        self.assertEqual(scores1, scores2)
        self.assertLessEqual(scores1['global'], 100)
        self.assertGreaterEqual(scores1['global'], 0)

    def test_cv_hash_builder_is_stable(self):
        payload = {
            'details': {'name': 'Test User', 'email': 't@t.com'},
            'skills': [{'name': 'Python'}],
            'workExp': [],
            'education': [],
            'projects': [],
            'languages': [],
        }
        h1 = compute_cv_hash_from_builder(payload)
        h2 = compute_cv_hash_from_builder({**payload, 'details': {'email': 't@t.com', 'name': 'Test User'}})
        self.assertEqual(h1, h2)
        self.assertEqual(len(h1), 64)

    def test_cv_hash_bytes(self):
        data = b'%PDF-1.4 fake cv content'
        self.assertEqual(compute_cv_hash_from_bytes(data), compute_cv_hash_from_bytes(data))
        self.assertNotEqual(compute_cv_hash_from_bytes(data), compute_cv_hash_from_bytes(b'other'))
