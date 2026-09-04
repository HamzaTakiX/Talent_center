from django.test import SimpleTestCase, TestCase
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APIClient
from unittest.mock import patch

from apps.report_reviewer.models import PageAnalysisCache
from apps.report_reviewer.services.deterministic_rules import run_deterministic_checks
from apps.report_reviewer.services.json_validation import (
    compute_score,
    merge_issues,
    normalize_ai_payload,
)

User = get_user_model()


class DeterministicRulesTests(SimpleTestCase):
    def test_double_space_and_punctuation(self):
        text = 'Cette  solution permet. Bonjour , comment. Bonjour,comment allez-vous????'
        issues = run_deterministic_checks(page_text=text, page_number=1, mode='full')
        cats = {i['category'] for i in issues}
        titles = {i['title'] for i in issues}
        self.assertIn('typography', cats)
        self.assertTrue(any('Double espace' in t for t in titles))
        self.assertTrue(any('Espace avant' in t or 'Espace manquant' in t or 'Ponctuation' in t for t in titles))

    def test_heading_gap(self):
        issues = run_deterministic_checks(
            page_text='Texte.',
            page_number=2,
            headings=['2.1 Intro', '2.2 Suite', '2.4 Fin'],
            outline=[{'level': 2, 'title': '2.1 Intro', 'number': '2.1'}, {'level': 2, 'title': '2.2', 'number': '2.2'}, {'level': 2, 'title': '2.4', 'number': '2.4'}],
            mode='structure',
        )
        self.assertTrue(any(i['quote'] == '2.3' or '2.3' in i['description'] for i in issues))

    def test_figure_ref_to_verify(self):
        issues = run_deterministic_checks(
            page_text='Comme présenté dans la figure 3.5, le résultat est clair.',
            page_number=3,
            figures=['Figure 3.1 Architecture', 'Figure 3.2 Flux'],
            captions=['Figure 3.1 Architecture'],
            mode='coherence',
        )
        self.assertTrue(any(i['category'] == 'reference' for i in issues))

    def test_empty_page_yields_no_crash(self):
        issues = run_deterministic_checks(page_text='', page_number=1, mode='full')
        self.assertIsInstance(issues, list)


class JsonValidationTests(SimpleTestCase):
    def test_filters_low_confidence(self):
        raw = {
            'summary': {'score': 80, 'totalIssues': 2},
            'issues': [
                {
                    'id': '1',
                    'category': 'grammar',
                    'severity': 'minor',
                    'title': 'Accord',
                    'description': 'Erreur',
                    'quote': 'les données est',
                    'confidence': 0.4,
                },
                {
                    'id': '2',
                    'category': 'grammar',
                    'severity': 'minor',
                    'title': 'Accord',
                    'description': 'Erreur',
                    'quote': 'les données sont',
                    'confidence': 0.9,
                },
            ],
        }
        out = normalize_ai_payload(raw, page_number=5)
        self.assertEqual(len(out['issues']), 1)
        self.assertEqual(out['issues'][0]['pageNumber'], 5)

    def test_rejects_non_object(self):
        with self.assertRaises(ValueError):
            normalize_ai_payload([], page_number=1)

    def test_merge_and_score(self):
        det = [{'id': 'd', 'category': 'punctuation', 'severity': 'minor', 'title': 'A', 'quote': 'x , y', 'source': 'deterministic'}]
        ai = [{'id': 'a', 'category': 'punctuation', 'severity': 'minor', 'title': 'A', 'quote': 'x , y', 'source': 'ai'}]
        merged = merge_issues(det, ai)
        self.assertEqual(len(merged), 1)
        score = compute_score(merged, 90)
        self.assertTrue(0 <= score <= 100)


class AnalyzePageApiTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(email='student@test.com', password='pass12345')
        self.client = APIClient()

    def _payload(self, **overrides):
        base = {
            'reportId': 'rpt-main-2026',
            'pageNumber': 1,
            'pageId': 'page-1',
            'contentHash': 'a' * 64,
            'includeContext': True,
            'mode': 'full',
            'page': {
                'text': 'Cette solution permet de tester le relecteur académique.',
                'html': '<p>Cette solution permet de tester le relecteur académique.</p>',
                'headings': [],
                'figures': [],
                'tables': [],
                'captions': [],
            },
            'context': {
                'chapterTitle': 'Chapitre 1',
                'sectionTitle': '1.1',
                'previousExcerpt': '',
                'nextExcerpt': '',
                'outline': [],
            },
        }
        base.update(overrides)
        return base

    def test_unauthorized(self):
        res = self.client.post('/api/report-reviewer/analyze-page/', self._payload(), format='json')
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_empty_page_rejected(self):
        self.client.force_authenticate(user=self.user)
        payload = self._payload()
        payload['page']['text'] = '   '
        res = self.client.post('/api/report-reviewer/analyze-page/', payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    @patch('apps.report_reviewer.services.analysis_service.get_reviewer_ollama_client')
    def test_analyze_and_cache(self, mock_client_factory):
        mock_client = mock_client_factory.return_value
        mock_client.is_available.return_value = True
        mock_client.chat_json.return_value = (
            {
                'summary': {'score': 88, 'totalIssues': 1},
                'issues': [
                    {
                        'id': 'issue-1',
                        'category': 'academic_style',
                        'severity': 'suggestion',
                        'title': 'Style',
                        'description': 'Formulation un peu générale.',
                        'suggestion': 'Préciser le verbe.',
                        'quote': 'permet de tester',
                        'confidence': 0.85,
                    }
                ],
            },
            'qwen3:8b',
        )

        self.client.force_authenticate(user=self.user)
        res1 = self.client.post('/api/report-reviewer/analyze-page/', self._payload(), format='json')
        self.assertEqual(res1.status_code, status.HTTP_200_OK)
        body1 = res1.json()
        self.assertTrue(body1['success'])
        self.assertFalse(body1['data']['cached'])
        self.assertIn('analysis', body1['data'])

        res2 = self.client.post('/api/report-reviewer/analyze-page/', self._payload(), format='json')
        self.assertEqual(res2.status_code, status.HTTP_200_OK)
        self.assertTrue(res2.json()['data']['cached'])
        self.assertEqual(PageAnalysisCache.objects.filter(user=self.user).count(), 1)

    @patch('apps.report_reviewer.services.analysis_service.get_reviewer_ollama_client')
    def test_ollama_unavailable(self, mock_client_factory):
        mock_client = mock_client_factory.return_value
        mock_client.is_available.return_value = False
        self.client.force_authenticate(user=self.user)
        res = self.client.post('/api/report-reviewer/analyze-page/', self._payload(), format='json')
        self.assertEqual(res.status_code, status.HTTP_503_SERVICE_UNAVAILABLE)
        self.assertFalse(res.json()['success'])
