"""Interview simulation orchestration with provider abstraction."""

from __future__ import annotations

import json
import random
import re
import threading
from datetime import timedelta
from dataclasses import dataclass
from statistics import mean
from typing import Any

from django.conf import settings
from django.db import transaction
from django.db.models import Prefetch
from django.utils import timezone

from apps.accounts_et_roles.models import StudentProfile
from apps.career_coach.services.context_builder import build_student_context
from apps.career_coach.services.context_summaries import get_or_build_summaries
from apps.cv_intelligence.models import (
    InterviewAnswer,
    InterviewConfiguration,
    InterviewContextSummary,
    InterviewEvaluation,
    InterviewFeedback,
    InterviewQuestion,
    InterviewSession,
    InterviewTranscript,
)
from apps.cv_intelligence.services.ai.ollama_client import get_ollama_client
from apps.cv_intelligence.services.offer_ai_coach import _serialize_offer_context
from apps.cv_intelligence.services.orchestrator import get_active_report
from apps.notifications.events.publisher import emit_event
from apps.stage.models import InternshipOffer
from apps.stage.services.offer_import_service import preview_offer_from_url
from apps.stage.services.student_journey_service import get_match_for_offer


def _question_temperature() -> float:
    return float(getattr(settings, 'INTERVIEW_QUESTION_TEMPERATURE', 0.65))


def _eval_temperature() -> float:
    return float(getattr(settings, 'INTERVIEW_EVAL_TEMPERATURE', 0.15))


def _normalize_question(text: str) -> str:
    cleaned = (text or '').lower()
    cleaned = re.sub(r'[^\w\s]', ' ', cleaned, flags=re.UNICODE)
    return ' '.join(cleaned.split())


def _question_tokens(text: str) -> set[str]:
    tokens = _normalize_question(text).split()
    return {t for t in tokens if len(t) > 2}


def _is_similar_question(text: str, prior: str, threshold: float = 0.62) -> bool:
    a, b = _question_tokens(text), _question_tokens(prior)
    if not a or not b:
        return False
    overlap = len(a & b) / min(len(a), len(b))
    return overlap >= threshold


def _is_duplicate_question(text: str, asked: list[str]) -> bool:
    normalized = _normalize_question(text)
    if not normalized:
        return True
    for prior in asked:
        prior_norm = _normalize_question(prior)
        if not prior_norm:
            continue
        if normalized == prior_norm:
            return True
        if normalized in prior_norm or prior_norm in normalized:
            return True
        if _is_similar_question(text, prior):
            return True
    return False


def _skills_from_context(context: dict[str, Any]) -> list[str]:
    raw = str(context.get('skills_summary') or '').strip()
    return [s.strip() for s in raw.split(',') if s.strip()]


def _interview_type_from_cfg(session_cfg: dict[str, Any]) -> str:
    requested = (session_cfg or {}).get('requested') or {}
    raw = requested.get('interview_type') or session_cfg.get('interview_type') or 'mixed'
    return str(raw).lower()


def _recent_questions_for_student(
    student: StudentProfile,
    *,
    interview_type: str | None = None,
    limit: int = 60,
) -> list[str]:
    qs = InterviewQuestion.objects.filter(session__student_profile=student).order_by('-created_at')
    if interview_type:
        qs = qs.filter(session__configuration__interview_type=interview_type)
    seen: set[str] = set()
    result: list[str] = []
    for text in qs.values_list('question_text', flat=True)[:limit * 3]:
        cleaned = str(text or '').strip()
        norm = _normalize_question(cleaned)
        if not norm or norm in seen:
            continue
        seen.add(norm)
        result.append(cleaned)
        if len(result) >= limit:
            break
    return result


def _is_technical_question(text: str) -> bool:
    q = (text or '').lower()
    markers = (
        'projet', 'technolog', 'stack', 'implément', 'implement', 'api', 'architecture',
        'débog', 'debog', 'debug', 'bug', 'code', 'choix technique', 'tests', 'ci/cd',
        'performance', 'déploy', 'deploy', 'framework', 'database', 'sql', 'algorithm',
        'système', 'system design', 'fonctionnalité', 'feature', 'développ', 'develop',
        'programm', 'infrastructure', 'scalab', 'latence', 'outil', 'stack',
    )
    return any(marker in q for marker in markers)


def _is_hr_behavioral_question(text: str) -> bool:
    q = (text or '').lower()
    markers = (
        'conflit', 'équipe', 'equipe', 'communication', 'motivation', 'pourquoi cette',
        'première semaine', 'premiere semaine', 'erreur que vous', 'priorité', 'priorite',
        'opportunités de croissance', 'opportunites de croissance', 'veille concurrentielle',
        'travail en équipe', 'soft skill', 'valeur que vous', 'objectifs d apprentissage',
        'racontez une situation', 'donnez un exemple', 'conflit ou un desaccord',
        'apporter durant', 'apporter des la premiere', 'décrire une expérience', 'decrire une experience',
        'expérience où', 'experience ou', 'compétences en', 'competences en', 'pour votre entreprise',
        'croissance pour', 'gestion du stress', 'qualités', 'defauts', 'présentez-vous', 'presentez-vous',
        'parlez de vous', 'tell me about yourself', 'strengths and weaknesses',
    )
    return any(marker in q for marker in markers)


def _question_matches_interview_type(text: str, interview_type: str) -> bool:
    cleaned = (text or '').strip()
    if not cleaned:
        return False
    if interview_type == 'technical':
        if _is_hr_behavioral_question(cleaned):
            return False
        return _is_technical_question(cleaned)
    if interview_type == 'hr' or interview_type == 'behavioral':
        if _is_technical_question(cleaned) and not _is_hr_behavioral_question(cleaned):
            return False
        return True
    return True


def _llm_question_system_prompt(interview_type: str) -> str:
    base = (
        'Return JSON with: question{text,category,rationale}. '
        'Question must be specific, profile-aware, CV-aware, and require evidence (project, impact, metrics). '
        'Never ask generic "introduce yourself" without concrete constraints. '
        'Do not repeat or paraphrase any question in asked_questions. '
        'Respect interview_type from config.requested strictly.'
    )
    if interview_type == 'technical':
        return (
            'You are a senior technical interviewer (tech lead). ' + base +
            ' ONLY ask technical questions: implementation, debugging, architecture, trade-offs, tools, '
            'code quality, performance, testing, deployment. '
            'Anchor on CV skills/projects but require technical depth (how, why, what trade-off). '
            'NEVER ask HR/behavioral questions about teamwork conflicts, motivation, career goals, '
            'business growth, competitive intelligence as soft skills, or "what value you bring". '
            'category must be technical.'
        )
    if interview_type in ('hr', 'behavioral'):
        return (
            'You are a senior HR recruiter. ' + base +
            ' Focus on motivation, communication, teamwork, adaptability, and soft skills. '
            'Avoid deep coding puzzles or system-design drills. category should be behavioral or motivation.'
        )
    return (
        'You are a hiring manager running a mixed interview. ' + base +
        ' Blend behavioral and technical angles proportionally.'
    )


def _llm_next_turn_system_prompt(interview_type: str) -> str:
    base = (
        'You are an expert interview coach. Return JSON keys: evaluation, follow_up, next_question. '
        'Evaluation must be grounded in the exact candidate answer. '
        'Do not give generic feedback. '
        'If answer is short/vague, explicitly say what is missing (project context, responsibilities, tools, metrics, outcomes). '
        'ideal_answer must be a concrete improved version tailored to the previous question. '
        'next_question must be NEW, non-repetitive, profile/CV-aware, and different from asked_questions. '
        'Respect interview_type from config.requested strictly for next_question.'
    )
    if interview_type == 'technical':
        return base + (
            ' next_question must be TECHNICAL ONLY (debugging, implementation, architecture, tools, trade-offs). '
            'Do NOT ask HR/behavioral/business-growth questions even if they appear on the CV.'
        )
    if interview_type in ('hr', 'behavioral'):
        return base + ' next_question should focus on soft skills, motivation, and teamwork — not coding drills.'
    return base


def _build_technical_pool_fr(skills: list[str]) -> list[dict[str, str]]:
    base_skills = skills[:8] if skills else ['votre stack principal']
    pool: list[dict[str, str]] = []
    templates = [
        "Sur un projet utilisant {skill}, quelle fonctionnalite avez-vous implementee et comment avez-vous valide le resultat?",
        "Decrivez votre methode pour deboguer un probleme complexe dans un projet {skill}.",
        "Pour un service en {skill}, comment structureriez-vous les couches (API, data, UI) et justifieriez vos choix?",
        "Entre deux options pour {skill}, quels criteres comparez-vous (performance, maintenance, delai)?",
        "Comment avez-vous ou integreriez-vous les tests automatises dans un projet {skill}?",
        "Quels outils utiliseriez-vous pour detecter une regression de performance sur {skill}?",
        "Expliquez comment vous deployeriez une mise a jour {skill} en limitant le risque de regression.",
        "Quelles mesures de securite appliqueriez-vous sur une API construite avec {skill}?",
    ]
    for skill in base_skills:
        for tmpl in templates:
            pool.append({'text': tmpl.format(skill=skill), 'category': 'technical'})
    pool.extend([
        {'text': 'Racontez une decision d architecture que vous avez prise. Quels compromis avez-vous acceptes?', 'category': 'technical'},
        {'text': 'Comment garantissez-vous la qualite (tests, revue, CI) dans vos projets?', 'category': 'technical'},
        {'text': 'Decrivez un incident technique: symptome, diagnostic, correctif, et impact mesurable.', 'category': 'technical'},
        {'text': 'Comment optimiseriez-vous une endpoint lente: profilage, hypotheses, correctifs, verification?', 'category': 'technical'},
    ])
    return pool


def _build_technical_pool_en(skills: list[str]) -> list[dict[str, str]]:
    base_skills = skills[:8] if skills else ['your main stack']
    pool: list[dict[str, str]] = []
    templates = [
        "In a project using {skill}, what feature did you personally implement and how did you validate it?",
        "Walk through your step-by-step approach to debug a complex issue in a {skill} project.",
        "For a {skill} service, how would you structure layers (API, data, UI) and justify your choices?",
        "When comparing two {skill} options, which criteria do you use (performance, maintenance, delivery time)?",
        "How would you integrate automated tests in a {skill} project?",
        "Which tools would you use to detect a performance regression in {skill}?",
        "How would you deploy a {skill} update while limiting regression risk?",
        "What security measures would you apply to an API built with {skill}?",
    ]
    for skill in base_skills:
        for tmpl in templates:
            pool.append({'text': tmpl.format(skill=skill), 'category': 'technical'})
    pool.extend([
        {'text': 'Describe an architecture decision you made and the trade-offs you accepted.', 'category': 'technical'},
        {'text': 'How do you ensure quality (tests, review, CI) in your projects?', 'category': 'technical'},
        {'text': 'Describe a technical incident: symptom, diagnosis, fix, and measurable impact.', 'category': 'technical'},
    ])
    return pool


def _build_hr_pool_fr(profile_hint: str) -> list[dict[str, str]]:
    hint = profile_hint or 'experience recente'
    return [
        {'text': "Donnez un exemple ou vous avez gere un conflit ou un desaccord en equipe. Quelle etait votre approche?", 'category': 'behavioral'},
        {'text': "Decrivez une situation ou vous avez du apprendre vite une nouvelle competence. Comment vous etes-vous organise?", 'category': 'behavioral'},
        {'text': f"En vous appuyant sur votre parcours ({hint}), que pouvez-vous apporter des la premiere semaine?", 'category': 'motivation'},
        {'text': "Racontez une erreur que vous avez faite. Qu'avez-vous change concretement ensuite?", 'category': 'behavioral'},
        {'text': "Comment priorisez-vous vos taches quand plusieurs deadlines arrivent en meme temps?", 'category': 'behavioral'},
        {'text': "Pourquoi ce stage vous interesse et comment il s aligne avec vos objectifs?", 'category': 'motivation'},
        {'text': "Donnez un exemple ou vous avez influence une decision en equipe sans autorite hierarchique.", 'category': 'behavioral'},
        {'text': "Comment gerez-vous le feedback negatif ou une critique sur votre travail?", 'category': 'behavioral'},
    ]


def _pick_from_pool_candidates(
    candidates: list[dict[str, str]],
    asked: list[str],
) -> dict[str, str] | None:
    if not candidates:
        return None
    shuffled = list(candidates)
    random.shuffle(shuffled)
    for item in shuffled:
        text = str(item.get('text') or '').strip()
        if text and not _is_duplicate_question(text, asked):
            return {
                'text': text,
                'category': str(item.get('category') or 'follow_up'),
                'rationale': str(item.get('rationale') or 'Profile-aware question'),
            }
    return None


def _generic_fallback_question(interview_type: str, lang: str) -> dict[str, str]:
    if interview_type == 'technical':
        if lang.startswith('en'):
            text = 'Describe a hard bug you solved: symptom, diagnostic tools, fix, and measurable outcome.'
        else:
            text = 'Decrivez un bug difficile resolu: symptome, outils de diagnostic, correctif et resultat mesurable.'
        return {'text': text, 'category': 'technical', 'rationale': 'Technical fallback'}
    if interview_type in ('hr', 'behavioral'):
        if lang.startswith('en'):
            text = 'Give a concrete example of teamwork under pressure and the personal outcome you achieved.'
        else:
            text = 'Donnez un exemple concret de travail en equipe sous pression et le resultat personnel obtenu.'
        return {'text': text, 'category': 'behavioral', 'rationale': 'HR fallback'}
    if lang.startswith('en'):
        text = 'Pick one CV project and explain your role, actions, and one measurable impact.'
    else:
        text = 'Choisissez un projet de votre CV: votre role, actions personnelles, et un impact mesurable.'
    return {'text': text, 'category': 'mixed', 'rationale': 'Mixed fallback'}


def _question_candidate_pool(
    *,
    context: dict[str, Any],
    session_cfg: dict[str, Any],
    asked: list[str],
) -> list[dict[str, str]]:
    requested = (session_cfg or {}).get('requested') or {}
    language = str(requested.get('language') or 'fr').lower()
    interview_type = str(requested.get('interview_type') or 'mixed').lower()
    skills = _skills_from_context(context)
    top = ', '.join(skills[:3]) if skills else 'votre stack principal'
    profile_hint = (str(context.get('profile_summary') or '') + ' ' + str(context.get('cv_summary') or '')).strip()[:120]

    if interview_type == 'technical':
        pool = (
            _build_technical_pool_en(skills) if language.startswith('en') else _build_technical_pool_fr(skills)
        )
    elif interview_type in ('hr', 'behavioral'):
        pool = _build_hr_pool_fr(profile_hint) if not language.startswith('en') else [
            {'text': 'Tell me about a teamwork conflict and how you handled it.', 'category': 'behavioral'},
            {'text': 'Why are you interested in this internship and what will you contribute early?', 'category': 'motivation'},
            {'text': 'Describe a mistake you made and what you changed afterward.', 'category': 'behavioral'},
            {'text': 'How do you prioritize when multiple deadlines collide?', 'category': 'behavioral'},
            {'text': 'Give an example where you influenced a team decision without formal authority.', 'category': 'behavioral'},
        ]
    elif language.startswith('en'):
        pool = [
            {'text': f"Pick one project from your CV involving {top}. What was your exact contribution and one measurable outcome?", 'category': 'technical'},
            {'text': "Describe a technical challenge you solved recently. What options did you compare before deciding?", 'category': 'technical'},
            {'text': "Tell me about a teamwork situation where priorities changed. How did you adapt and what was the result?", 'category': 'behavioral'},
            {'text': "What skill from your profile do you still need to strengthen for this internship, and how are you improving it?", 'category': 'growth'},
            {'text': "Explain one decision you made in a project that improved quality, speed, or reliability. Include numbers if possible.", 'category': 'impact'},
        ]
    else:
        pool = [
            {'text': f"Selectionnez une experience de votre CV ({top}) et expliquez son impact concret sur votre preparation au stage.", 'category': 'mixed'},
            {'text': "Decrivez un projet ou vous avez coordonne avec d'autres personnes. Quel etait votre role et le resultat final?", 'category': 'mixed'},
            {'text': f"Quelle competence technique ({top}) maitrisez-vous le mieux, et donnez un exemple d application reelle.", 'category': 'mixed'},
            {'text': "Parlez d une contrainte difficile (temps, ressources, exigences floues) et comment vous l avez surmontee.", 'category': 'mixed'},
            {'text': "Quels objectifs d apprentissage visez-vous pendant ce stage, en lien avec votre profil actuel?", 'category': 'motivation'},
            {'text': "Donnez un exemple STAR complet: situation, tache, action personnelle, resultat chiffre.", 'category': 'follow_up'},
        ]

    random.shuffle(pool)
    return [item for item in pool if not _is_duplicate_question(item['text'], asked)]


def _pick_diverse_question(
    *,
    proposed: str,
    context: dict[str, Any],
    session_cfg: dict[str, Any],
    asked: list[str],
) -> dict[str, str]:
    interview_type = _interview_type_from_cfg(session_cfg)
    text = (proposed or '').strip()
    if (
        text
        and not _is_duplicate_question(text, asked)
        and _question_matches_interview_type(text, interview_type)
    ):
        category = 'technical' if interview_type == 'technical' else 'follow_up'
        return {'text': text, 'category': category, 'rationale': 'LLM generated'}

    candidates = _question_candidate_pool(context=context, session_cfg=session_cfg, asked=asked)
    picked = _pick_from_pool_candidates(candidates, asked)
    if picked:
        return picked

    requested = (session_cfg or {}).get('requested') or {}
    language = str(requested.get('language') or 'fr').lower()
    return _generic_fallback_question(interview_type, language)


def _infer_question_theme(question: str) -> str:
    q = (question or '').lower()
    if any(k in q for k in ('debogu', 'debug', 'bug', 'erreur', 'probleme complexe', 'problème complexe')):
        return 'debugging'
    if any(k in q for k in ('equipe', 'équipe', 'team', 'communication', 'conflit', 'collabor', 'priorite')):
        return 'behavioral'
    if any(k in q for k in ('technolog', 'stack', 'implement', 'implément', 'api', 'architecture', 'outil', 'choisi')):
        return 'technical'
    if any(k in q for k in ('pourquoi', 'interess', 'intéress', 'motivation', 'opportunite', 'opportunité')):
        return 'motivation'
    if any(k in q for k in ('competence', 'compétence', 'renforcer', 'apprentissage', 'objectif')):
        return 'growth'
    if any(k in q for k in ('erreur', 'mistake', 'echec', 'échec', 'transform')):
        return 'failure'
    if any(k in q for k in ('present', 'présent', 'parcours', 'profil', 'introduire', '60 secondes')):
        return 'intro'
    return 'mixed'


def _is_generic_ideal_answer(text: str) -> bool:
    lower = (text or '').lower()
    if len(lower.strip()) < 25:
        return True
    generic_markers = (
        'pour me presenter efficacement',
        'lors d un projet de [x]',
        "lors d'un projet de [x]",
        '[votre role]',
        '[action precise]',
        '[resultat chiffre]',
        'donnez un exemple concret et des resultats mesurables',
    )
    return any(marker in lower for marker in generic_markers)


def _contextual_ideal_answer(
    *,
    question: str,
    answer: str,
    context: dict[str, Any],
    theme: str,
) -> str:
    skills = _skills_from_context(context)
    top = skills[0] if skills else 'React/Node'
    second = skills[1] if len(skills) > 1 else 'SQL'
    profile_hint = (str(context.get('profile_summary') or '') + ' ' + str(context.get('cv_summary') or '')).strip()
    profile_short = profile_hint[:90] if profile_hint else 'mon parcours academique et mes projets'

    q_short = (question or '').strip()[:120]

    if theme == 'debugging':
        return (
            f"Pour répondre à « {q_short} », je décrirais une incident réel: symptôme observé, "
            f"logs/outils utilisés ({top}), hypothèse testée, correctif appliqué, et impact mesurable "
            "(ex: -30% temps de réponse ou 0 régression en prod)."
        )
    if theme == 'behavioral':
        return (
            f"Sur « {q_short} », je citerais une situation précise en équipe: contexte initial, "
            f"contrainte (délai/priorités), action personnelle que j ai menée, coordination avec les autres, "
            f"et résultat concret (livraison, qualité, satisfaction client)."
        )
    if theme == 'technical':
        return (
            f"Pour « {q_short} », je choisirais un projet où j ai utilisé {top} et {second}. "
            f"Je préciserais mon rôle exact, la décision technique clé, les alternatives écartées, "
            f"et un résultat chiffré (performance, couverture tests, délai)."
        )
    if theme == 'motivation':
        return (
            f"Pour « {q_short} », je lierais {profile_short} à l offre: compétences déjà acquises ({top}), "
            f"ce que je veux apprendre pendant le stage, et une contribution concrète dès les premières semaines."
        )
    if theme == 'growth':
        return (
            f"Pour « {q_short} », j identifierais une compétence cible ({second}), "
            f"un plan d apprentissage (cours, projet, mentor), et un exemple récent où j ai déjà progressé avec résultat mesurable."
        )
    if theme == 'failure':
        return (
            f"Pour « {q_short} », je raconterais une erreur réelle sans minimiser: ce qui s est passé, "
            f"ma responsabilité, correction immédiate, et changement de process pour éviter la répétition."
        )
    if theme == 'intro':
        return (
            f"Pour « {q_short} », je structurerais en 60-90s: qui je suis ({profile_short}), "
            f"1 projet marquant avec {top}, mon rôle, action clé, résultat chiffré, "
            f"et lien direct avec les besoins du stage."
        )
    return (
        f"Pour répondre précisément à « {q_short} », je donnerais un exemple STAR: "
        f"situation ({top}), tâche personnelle, actions techniques/organisationnelles, "
        f"résultat quantifié, puis apprentissage transférable au poste."
    )


def _contextual_improvement_tips(theme: str, weaknesses: list[str]) -> list[str]:
    tips_by_theme = {
        'debugging': [
            'Décrivez le symptôme avant la solution.',
            'Mentionnez les outils de diagnostic utilisés.',
            'Quantifiez l impact du correctif.',
        ],
        'behavioral': [
            'Clarifiez votre rôle vs le rôle de l équipe.',
            'Montrez comment vous gérez les priorités changeantes.',
            'Terminez par le résultat pour le projet ou l équipe.',
        ],
        'technical': [
            'Nommez les technologies et pourquoi vous les avez choisies.',
            'Expliquez une alternative que vous avez écartée.',
            'Ajoutez un indicateur de performance ou qualité.',
        ],
        'motivation': [
            'Liez votre parcours à l offre précise.',
            'Montrez ce que vous apporterez dès le début.',
            'Évitez les motivations génériques sans lien métier.',
        ],
        'growth': [
            'Donnez un plan concret d amélioration.',
            'Montrez une progression déjà observée.',
        ],
        'failure': [
            'Assumez votre part de responsabilité.',
            'Expliquez la correction et la leçon retenue.',
        ],
        'intro': [
            'Structurez: présentation, expérience clé, valeur pour le poste.',
            'Gardez un rythme court et orienté résultats.',
        ],
    }
    tips = list(tips_by_theme.get(theme, tips_by_theme['intro']))
    for w in weaknesses[:2]:
        if w and w not in tips:
            tips.append(f"Corriger: {w}")
    return tips[:4]


@dataclass
class OfferBundle:
    data: dict[str, Any]
    missing_fields: list[str]


class InterviewAIProvider:
    def generate_first_question(self, *, context: dict[str, Any], session_cfg: dict[str, Any]) -> dict[str, Any]:
        raise NotImplementedError

    def generate_next_turn(
        self,
        *,
        context: dict[str, Any],
        session_cfg: dict[str, Any],
        previous_question: str,
        answer: str,
        transcript: list[dict[str, str]],
    ) -> dict[str, Any]:
        raise NotImplementedError

    def evaluate_final(self, *, context: dict[str, Any], transcript: list[dict[str, str]]) -> dict[str, Any]:
        raise NotImplementedError


class OllamaInterviewProvider(InterviewAIProvider):
    def __init__(self) -> None:
        self.client = get_ollama_client()

    def _chat_json(
        self,
        system_prompt: str,
        payload: dict[str, Any],
        fallback: dict[str, Any],
        *,
        max_tokens: int = 320,
        temperature: float | None = None,
    ) -> tuple[dict[str, Any], str]:
        temp = _eval_temperature() if temperature is None else temperature
        try:
            model = self.client.warm_model()
            result, used_model = self.client.chat_json(
                system_prompt,
                json.dumps(payload, ensure_ascii=False)[:10000],
                max_tokens=max_tokens,
                temperature=temp,
            )
            return result, used_model or model
        except Exception:
            return fallback, 'rule-based'

    def generate_first_question(
        self,
        *,
        context: dict[str, Any],
        session_cfg: dict[str, Any],
        asked_questions: list[str] | None = None,
    ) -> dict[str, Any]:
        asked = list(asked_questions or [])
        interview_type = _interview_type_from_cfg(session_cfg)
        if interview_type in ('technical', 'hr', 'behavioral'):
            diverse = _pick_diverse_question(
                proposed='',
                context=context,
                session_cfg=session_cfg,
                asked=asked,
            )
            return {'question': diverse, 'model': 'rule-based'}

        fallback_q = self._rule_based_first_question(context=context, session_cfg=session_cfg, asked=asked)
        result, model = self._chat_json(
            _llm_question_system_prompt(interview_type),
            {
                'context': context,
                'config': session_cfg,
                'asked_questions': asked[-12:],
            },
            fallback_q,
            max_tokens=220,
            temperature=_question_temperature(),
        )
        q_raw = result.get('question') or {}
        diverse = _pick_diverse_question(
            proposed=str(q_raw.get('text') or fallback_q.get('question', {}).get('text', '')),
            context=context,
            session_cfg=session_cfg,
            asked=asked,
        )
        result['question'] = {
            **diverse,
            'rationale': str(q_raw.get('rationale') or diverse.get('rationale') or ''),
        }
        result['model'] = model
        return result

    def _rule_based_first_question(
        self,
        *,
        context: dict[str, Any],
        session_cfg: dict[str, Any],
        asked: list[str] | None = None,
    ) -> dict[str, Any]:
        candidates = _question_candidate_pool(
            context=context,
            session_cfg=session_cfg,
            asked=list(asked or []),
        )
        if candidates:
            picked = _pick_from_pool_candidates(candidates, list(asked or []))
            if picked:
                return {
                    'question': {
                        'text': picked['text'],
                        'category': picked.get('category') or 'intro',
                        'rationale': picked.get('rationale') or 'Opening question anchored on profile/CV.',
                    },
                }

        requested = (session_cfg or {}).get('requested') or {}
        language = str(requested.get('language') or 'fr').lower()
        interview_type = str(requested.get('interview_type') or 'mixed').lower()
        profile_summary = str(context.get('profile_summary') or '').strip()
        cv_summary = str(context.get('cv_summary') or '').strip()
        skills_raw = str(context.get('skills_summary') or '').strip()
        skills = [s.strip() for s in skills_raw.split(',') if s.strip()]
        top_skills = ', '.join(skills[:3]) if skills else ''
        signal = (profile_summary or cv_summary)[:380]

        if language.startswith('en'):
            if interview_type == 'technical':
                text = (
                    f"Based on your profile and CV ({top_skills or 'your main stack'}), describe one concrete project where you personally implemented a key feature. "
                    "Explain your exact role, technical choices, and one measurable impact."
                )
            else:
                text = (
                    "Using one concrete experience from your profile/CV, explain what value you would bring in your first month as an intern. "
                    "Structure your answer with context, your actions, and measurable results."
                )
            rationale = f"Context anchor: {signal}" if signal else "Profile/CV anchored opening question."
            return {'question': {'text': text, 'category': 'intro', 'rationale': rationale}}

        # Default FR
        if interview_type == 'technical':
            text = (
                f"En vous basant sur votre profil et votre CV ({top_skills or 'vos competences principales'}), decrivez un projet concret ou vous avez implemente une fonctionnalite importante. "
                "Precisez votre role exact, vos choix techniques, et un resultat mesurable."
            )
        elif interview_type == 'hr':
            text = (
                "A partir d une experience precise de votre parcours, expliquez la valeur que vous pouvez apporter durant votre premier mois de stage. "
                "Structurez votre reponse: contexte, actions personnelles, resultat concret."
            )
        else:
            text = (
                f"Choisissez une experience marquante de votre parcours ({top_skills or 'projet/mission principale'}) et expliquez en quoi elle vous prepare a ce stage. "
                "Donnez votre role, les actions realisees, et un impact concret/chiffre."
            )
        rationale = f"Contexte candidat: {signal}" if signal else "Question d ouverture ancree sur profil/CV."
        return {'question': {'text': text, 'category': 'intro', 'rationale': rationale}}

    def _rule_based_turn(
        self,
        *,
        previous_question: str,
        answer: str,
        context: dict[str, Any] | None = None,
        session_cfg: dict[str, Any] | None = None,
        asked: list[str] | None = None,
    ) -> dict[str, Any]:
        text = answer.strip()
        lower = text.lower()
        words = [w for w in text.split() if w.strip()]
        word_count = len(words)
        has_numbers = any(ch.isdigit() for ch in text)
        has_project_signal = any(k in lower for k in ('projet', 'project', 'stage', 'internship', 'application', 'api', 'system'))
        has_action_verbs = any(k in lower for k in ('built', 'developed', 'implemented', 'designed', 'created', 'dirt', 'developpe', 'construit'))
        has_result_signal = any(k in lower for k in ('result', 'impact', 'improve', 'improved', 'augmented', 'reduced', 'gagn', 'ameliore'))

        theme = _infer_question_theme(previous_question)
        ctx = context or {}

        tier = _answer_quality_tier(text)
        if tier == 'skipped':
            communication, technical, relevance = 15, 12, 15
            confidence, professionalism, problem_solving = 15, 18, 12
        elif tier == 'minimal':
            communication, technical, relevance = 22, 18, 22
            confidence, professionalism, problem_solving = 24, 28, 20
        elif tier == 'weak':
            communication = 30 + min(10, word_count)
            technical = 22 + (10 if has_project_signal else 0) + (6 if has_action_verbs else 0)
            relevance = 28 + min(8, word_count)
            confidence = 32 + min(6, word_count // 2)
            professionalism = 34 + min(8, word_count // 2)
            problem_solving = 26 + (10 if has_action_verbs else 0)
        elif tier == 'moderate':
            communication = 58 if word_count >= 30 else 50
            technical = 62 if has_project_signal and has_action_verbs else 50 if has_project_signal else 42
            relevance = 60 if word_count >= 28 else 52
            confidence = 62 if word_count >= 25 else 54
            professionalism = 66 if word_count >= 22 else 58
            problem_solving = 60 if has_action_verbs else 48
        else:
            communication = 78 if word_count >= 45 else 70
            technical = 76 if has_project_signal and has_action_verbs else 62 if has_project_signal else 52
            relevance = 76 if word_count >= 35 else 66
            confidence = 74 if word_count >= 30 else 66
            professionalism = 78 if word_count >= 25 else 70
            problem_solving = 74 if has_action_verbs else 62

        soft_skills = int(round(mean([communication, confidence, professionalism])))
        language_quality = int(round(mean([communication, relevance])))

        strengths: list[str] = []
        weaknesses: list[str] = []
        heuristic_tips: list[str] = []

        if word_count >= 30:
            strengths.append('Réponse relativement structurée.')
        else:
            weaknesses.append('Réponse trop courte, manque de développement.')
            heuristic_tips.append('Développez votre réponse en 4 étapes: contexte, action, résultat, apprentissage.')
        if has_project_signal:
            strengths.append('Vous faites référence à une expérience/projet concret.')
        else:
            weaknesses.append('Aucun exemple projet concret n est mentionné.')
            heuristic_tips.append('Ajoutez un projet précis (technos, rôle, tâche).')
        if has_numbers:
            strengths.append('Présence d éléments mesurables/chiffrés.')
        else:
            weaknesses.append('Pas de résultats mesurables (chiffres, délais, impact).')
            heuristic_tips.append('Ajoutez 1 ou 2 indicateurs: délai, performance, users, taux d erreur, etc.')
        if has_result_signal:
            strengths.append('Vous mentionnez l impact ou les résultats.')
        else:
            weaknesses.append('L impact final n est pas clairement expliqué.')
            heuristic_tips.append('Terminez par un impact business/tech clair.')

        if theme == 'debugging':
            if any(k in lower for k in ('log', 'debug', 'outil', 'test', 'hypothese', 'hypothèse')):
                strengths.append('Vous décrivez des étapes de diagnostic.')
            else:
                weaknesses.append('Le processus de debug (symptôme → cause → correctif) est absent.')
        elif theme == 'motivation':
            if any(k in lower for k in ('offre', 'stage', 'entreprise', 'motiv', 'poste')):
                strengths.append('Vous liez votre motivation au contexte du stage.')
            else:
                weaknesses.append('Le lien avec cette offre de stage n est pas explicite.')
        elif theme == 'behavioral':
            if any(k in lower for k in ('equipe', 'équipe', 'team', 'collabor', 'priorite', 'priorité')):
                strengths.append('Vous intégrez la dimension équipe/priorités.')
            else:
                weaknesses.append('La collaboration ou la gestion des priorités n est pas illustrée.')
        elif theme == 'technical':
            skills = _skills_from_context(ctx)
            if skills and any(s.lower() in lower for s in skills[:5]):
                strengths.append('Vous mentionnez des technologies pertinentes à votre profil.')
            elif not has_project_signal:
                weaknesses.append('Aucune décision technique concrète n est expliquée.')

        if not strengths:
            strengths = ['Intention de réponse présente.']
        if not weaknesses:
            weaknesses = ['Peut encore gagner en précision et profondeur technique.']

        theme_tips = _contextual_improvement_tips(theme, weaknesses)
        tips: list[str] = []
        for tip in theme_tips + heuristic_tips:
            if tip not in tips:
                tips.append(tip)
        if not tips:
            tips = ['Donnez une version STAR concise avec résultat chiffré.']

        weakness_penalty = min(14, len(weaknesses) * 4)
        communication = max(0, communication - weakness_penalty)
        technical = max(0, technical - weakness_penalty)
        relevance = max(0, relevance - weakness_penalty)
        confidence = max(0, confidence - weakness_penalty)
        professionalism = max(0, professionalism - weakness_penalty)
        problem_solving = max(0, problem_solving - weakness_penalty)
        soft_skills = int(round(mean([communication, confidence, professionalism])))
        language_quality = int(round(mean([communication, relevance])))

        missing_skills: list[str] = []
        if word_count < 30:
            missing_skills.append('Structuration STAR')
        if theme == 'debugging' and 'debug' not in lower and 'log' not in lower:
            missing_skills.append('Méthode de diagnostic structurée')
        if theme == 'motivation' and 'offre' not in lower and 'stage' not in lower:
            missing_skills.append('Lien explicite avec l offre')

        improved_answer = _contextual_ideal_answer(
            question=previous_question,
            answer=text,
            context=ctx,
            theme=theme,
        )

        return {
            'evaluation': {
                'communication': communication,
                'confidence': confidence,
                'technical_knowledge': technical,
                'problem_solving': problem_solving,
                'professionalism': professionalism,
                'soft_skills': 66,
                'language_quality': 64 if word_count >= 20 else 52,
                'answer_relevance': relevance,
                'strengths': strengths[:3],
                'weaknesses': weaknesses[:3],
                'missing_skills': missing_skills[:3],
                'ideal_answer': improved_answer,
                'improvement_tips': tips[:4],
                'readiness': (
                    'high' if tier == 'strong' and (communication + technical + relevance) / 3 >= 70
                    else 'medium' if tier in ('moderate', 'strong') and (communication + technical + relevance) / 3 >= 55
                    else 'low'
                ),
            },
            'follow_up': {
                'needed': True,
                'reason': 'deeper_explanation',
            },
            'next_question': _pick_diverse_question(
                proposed='',
                context=ctx,
                session_cfg=session_cfg or {},
                asked=list(asked or []) + [previous_question],
            ),
        }

    def generate_next_turn(
        self,
        *,
        context: dict[str, Any],
        session_cfg: dict[str, Any],
        previous_question: str,
        answer: str,
        transcript: list[dict[str, str]],
        asked_questions: list[str] | None = None,
    ) -> dict[str, Any]:
        asked = list(asked_questions or [])
        interview_type = _interview_type_from_cfg(session_cfg)
        fallback = self._rule_based_turn(
            previous_question=previous_question,
            answer=answer,
            context=context,
            session_cfg=session_cfg,
            asked=asked,
        )
        fallback_next = _pick_diverse_question(
            proposed=str((fallback.get('next_question') or {}).get('text') or ''),
            context=context,
            session_cfg=session_cfg,
            asked=asked,
        )
        fallback['next_question'] = fallback_next

        if interview_type in ('technical', 'hr', 'behavioral'):
            fallback['model'] = 'rule-based'
            return fallback

        result, model = self._chat_json(
            _llm_next_turn_system_prompt(interview_type),
            {
                'context': context,
                'config': session_cfg,
                'previous_question': previous_question,
                'answer': answer,
                'transcript': transcript[-8:],
                'asked_questions': asked[-12:],
            },
            fallback,
            max_tokens=560,
            temperature=max(_question_temperature(), _eval_temperature()),
        )
        next_raw = result.get('next_question') or {}
        diverse_next = _pick_diverse_question(
            proposed=str(next_raw.get('text') or fallback_next.get('text') or ''),
            context=context,
            session_cfg=session_cfg,
            asked=asked,
        )
        result['next_question'] = {
            **diverse_next,
            'rationale': str(next_raw.get('rationale') or diverse_next.get('rationale') or ''),
        }
        theme = _infer_question_theme(previous_question)
        eval_raw = dict(result.get('evaluation') or {})
        ideal = str(eval_raw.get('ideal_answer') or '')
        if _is_generic_ideal_answer(ideal):
            eval_raw['ideal_answer'] = _contextual_ideal_answer(
                question=previous_question,
                answer=answer,
                context=context,
                theme=theme,
            )
        if not eval_raw.get('improvement_tips'):
            weaknesses = list(eval_raw.get('weaknesses') or fallback['evaluation'].get('weaknesses') or [])
            eval_raw['improvement_tips'] = _contextual_improvement_tips(theme, weaknesses)[:4]
        eval_raw = _clamp_evaluation_scores(eval_raw, answer)
        result['evaluation'] = eval_raw
        result['model'] = model
        return result

    def evaluate_final(
        self,
        *,
        context: dict[str, Any],
        transcript: list[dict[str, str]],
        aggregates: dict[str, int] | None = None,
    ) -> dict[str, Any]:
        agg = aggregates or {}
        turn_count = _count_analyzed_answers(transcript)
        lang = str((context or {}).get('language') or 'fr').lower()
        if turn_count == 0:
            return _empty_final_eval('fr' if lang.startswith('fr') else 'en')
        communication = int(agg.get('communication_score') or 0)
        technical = int(agg.get('technical_score') or 0)
        confidence = int(agg.get('confidence_score') or 0)
        professionalism = int(agg.get('professionalism_score') or 0)
        problem_solving = int(agg.get('problem_solving_score') or 0)
        overall = int(agg.get('overall_score') or 0)
        if overall and turn_count:
            fallback = {
                'overall_score': overall,
                'communication_score': communication,
                'technical_score': technical,
                'confidence_score': confidence,
                'professionalism_score': professionalism,
                'problem_solving_score': problem_solving,
                'strengths': [],
                'weaknesses': [],
                'missing_skills': [],
                'ideal_answers': [],
                'improvement_recommendations': [],
                'interview_readiness': 'medium',
            }
        else:
            fallback = _empty_final_eval('fr' if str((context or {}).get('language') or 'fr').startswith('fr') else 'en')
        result, model = self._chat_json(
            (
                'You are an expert interview coach. Analyze the full interview transcript and per-turn aggregates. '
                'Return JSON keys: overall_score, communication_score, technical_score, confidence_score, '
                'professionalism_score, problem_solving_score, strengths, weaknesses, missing_skills, '
                'ideal_answers, improvement_recommendations, interview_readiness (low|medium|high). '
                'Scores must reflect actual answers — cite patterns from transcript. '
                'If aggregates are provided, refine them rather than ignoring them.'
            ),
            {
                'context': context,
                'transcript': transcript[-20:],
                'aggregates': agg,
                'answered_count': turn_count,
            },
            fallback,
            max_tokens=520,
            temperature=_eval_temperature(),
        )
        if agg.get('overall_score') and int(result.get('overall_score') or 0) < 10:
            result['overall_score'] = overall
        if communication and int(result.get('communication_score') or 0) < 10:
            result['communication_score'] = communication
        if technical and int(result.get('technical_score') or 0) < 10:
            result['technical_score'] = technical
        if confidence and int(result.get('confidence_score') or 0) < 10:
            result['confidence_score'] = confidence
        if professionalism and int(result.get('professionalism_score') or 0) < 10:
            result['professionalism_score'] = professionalism
        if problem_solving and int(result.get('problem_solving_score') or 0) < 10:
            result['problem_solving_score'] = problem_solving
        result['model'] = model
        return result


def get_interview_provider() -> InterviewAIProvider:
    provider = getattr(settings, 'INTERVIEW_SIMULATION_PROVIDER', 'ollama')
    if provider == 'ollama':
        return OllamaInterviewProvider()
    return OllamaInterviewProvider()


def _compact_student_context(student: StudentProfile, offer: dict[str, Any] | None) -> dict[str, Any]:
    full_context = build_student_context(student, offer_uuid=str(offer.get('uuid')) if offer and offer.get('uuid') else None)
    summaries = get_or_build_summaries(student.pk, full_context)
    for key, text in summaries.items():
        InterviewContextSummary.objects.update_or_create(
            student_profile=student,
            summary_key=key,
            defaults={'summary_text': text, 'source_hash': str(abs(hash(text))), 'metadata_json': {}},
        )
    report = get_active_report(student)
    return {
        'profile_summary': summaries.get('profile', ''),
        'cv_summary': summaries.get('cv', ''),
        'skills_summary': ', '.join((full_context.get('profile') or {}).get('skills') or []),
        'offer_summary': json.dumps(offer or {}, ensure_ascii=False)[:1500] if offer else '',
        'cv_analysis_summary': json.dumps((report.dashboard_json or {}).get('meta') if report else {}, ensure_ascii=False)[:800],
        'previous_interview_summary': summaries.get('interview', ''),
    }


def _clamp_external_offer_url(url: str, *, max_length: int = 2048) -> str:
    cleaned = str(url or '').strip()
    if len(cleaned) <= max_length:
        return cleaned
    return cleaned[:max_length]


def _normalize_extracted_offer(extracted: dict[str, Any], url: str = '') -> dict[str, Any]:
    responsibilities = str(
        extracted.get('responsibilities') or extracted.get('description') or '',
    ).strip()
    requirements = str(extracted.get('requirements') or '').strip()
    if not requirements and responsibilities:
        requirements = responsibilities[:800]

    skills = extracted.get('required_skills') or []
    if isinstance(skills, str):
        skills = [part.strip() for part in skills.split(',') if part.strip()]

    return {
        'company': str(extracted.get('company') or extracted.get('company_name') or '').strip(),
        'internship_title': str(
            extracted.get('internship_title') or extracted.get('title') or '',
        ).strip(),
        'responsibilities': responsibilities,
        'requirements': requirements,
        'required_skills': skills,
        'education': extracted.get('education') or '',
        'languages': extracted.get('languages') or [],
        'internship_type': extracted.get('internship_type') or '',
        'location': str(extracted.get('location') or extracted.get('location_city') or '').strip(),
        'url': str(extracted.get('url') or extracted.get('source_url') or url or '').strip(),
    }


def _critical_missing_offer_fields(normalized: dict[str, Any]) -> list[str]:
    missing: list[str] = []
    if not normalized.get('company'):
        missing.append('company')
    if not normalized.get('internship_title'):
        missing.append('internship_title')
    if not (normalized.get('responsibilities') or normalized.get('requirements')):
        missing.append('responsibilities')
    return missing


def _validate_external_offer(url: str) -> OfferBundle:
    extracted = preview_offer_from_url(url)
    normalized = _normalize_extracted_offer(extracted, url)
    missing = _critical_missing_offer_fields(normalized)
    return OfferBundle(data=normalized, missing_fields=missing)


def _avg_eval_field(evals: list[InterviewEvaluation], field: str) -> int:
    vals = [int(getattr(ev, field) or 0) for ev in evals if int(getattr(ev, field) or 0) > 0]
    return round(mean(vals)) if vals else 0


def _is_skip_answer(text: str) -> bool:
    lower = (text or '').lower().strip()
    skip_markers = (
        'je préfère passer',
        'je prefere passer',
        'i prefer to skip',
        'passer cette question',
        'skip this question',
    )
    return any(marker in lower for marker in skip_markers)


def _answer_quality_tier(answer: str) -> str:
    text = (answer or '').strip()
    if _is_skip_answer(text):
        return 'skipped'
    word_count = len([w for w in text.split() if w.strip()])
    if word_count < 5:
        return 'minimal'
    if word_count < 15:
        return 'weak'
    if word_count < 35:
        return 'moderate'
    return 'strong'


def _turn_overall_from_metrics(metrics: dict[str, int]) -> int:
    keys = (
        'communication_score',
        'technical_score',
        'confidence_score',
        'problem_solving_score',
        'relevance_score',
        'professionalism_score',
    )
    vals = [int(metrics.get(key) or 0) for key in keys]
    if not vals:
        return 0
    return int(round(mean(vals)))


def _clamp_evaluation_scores(eval_raw: dict[str, Any], answer: str) -> dict[str, Any]:
    tier = _answer_quality_tier(answer)
    caps = {
        'skipped': 22,
        'minimal': 32,
        'weak': 48,
        'moderate': 72,
        'strong': 100,
    }
    max_cap = caps[tier]
    result = dict(eval_raw)
    for field in (
        'communication',
        'confidence',
        'technical_knowledge',
        'problem_solving',
        'professionalism',
        'soft_skills',
        'language_quality',
        'answer_relevance',
    ):
        val = int(result.get(field) or 0)
        result[field] = min(val, max_cap)
    return result


def _count_analyzed_answers(turns: list[dict[str, Any]]) -> int:
    return len([
        t for t in turns
        if str(t.get('answer') or '').strip() and not _is_skip_answer(str(t.get('answer') or ''))
    ])


def _empty_final_eval(lang: str = 'fr') -> dict[str, Any]:
    if lang == 'fr':
        weakness = 'Aucune réponse fournie — score non calculé.'
        recommendation = 'Relancez une simulation et répondez aux questions pour obtenir une analyse IA.'
    else:
        weakness = 'No answers provided — score not calculated.'
        recommendation = 'Start a new simulation and answer the questions to get an AI analysis.'
    return {
        'overall_score': 0,
        'communication_score': 0,
        'technical_score': 0,
        'confidence_score': 0,
        'professionalism_score': 0,
        'problem_solving_score': 0,
        'strengths': [],
        'weaknesses': [weakness],
        'missing_skills': [],
        'ideal_answers': [],
        'improvement_recommendations': [recommendation],
        'interview_readiness': 'insufficient_data',
        'model': 'rule-based',
    }


def _readiness_from_score(score: int, lang: str = 'fr') -> tuple[str, str]:
    if score >= 85:
        return 'excellent', 'Excellent'
    if score >= 70:
        return 'good', 'Bon' if lang == 'fr' else 'Good'
    if score >= 55:
        return 'needs_review', 'À REVOIR' if lang == 'fr' else 'Needs review'
    return 'low', 'À améliorer' if lang == 'fr' else 'Needs work'


def _metric_assessment(score: int, lang: str = 'fr') -> tuple[str, str]:
    if score >= 75:
        return 'up', 'Très bon' if lang == 'fr' else 'Very good'
    if score >= 55:
        return 'neutral', 'Correct' if lang == 'fr' else 'Fair'
    return 'down', 'À améliorer' if lang == 'fr' else 'Needs work'


def _words_per_minute(turns: list[dict[str, Any]], duration_seconds: int) -> int:
    total_words = sum(len(str(t.get('answer') or '').split()) for t in turns)
    minutes = max(duration_seconds / 60, 0.5)
    return round(total_words / minutes)


def _pace_detail(wpm: int, lang: str = 'fr') -> str:
    if wpm < 80:
        pace_label = 'lent' if lang == 'fr' else 'slow'
    elif wpm > 140:
        pace_label = 'rapide' if lang == 'fr' else 'fast'
    else:
        pace_label = 'normal'
    if lang == 'fr':
        return f'{wpm} mots/min — {pace_label}'
    return f'{wpm} wpm — {pace_label}'


def _collect_turn_insights(evals: list[InterviewEvaluation]) -> tuple[list[str], list[str], list[str]]:
    strengths: list[str] = []
    weaknesses: list[str] = []
    missing: list[str] = []
    for ev in evals:
        for item in ev.strengths_json or []:
            if item and item not in strengths:
                strengths.append(str(item))
        for item in ev.weaknesses_json or []:
            if item and item not in weaknesses:
                weaknesses.append(str(item))
        for item in ev.missing_skills_json or []:
            if item and item not in missing:
                missing.append(str(item))
    return strengths[:6], weaknesses[:6], missing[:8]


def _evaluation_aggregates(evals: list[InterviewEvaluation]) -> dict[str, int]:
    return {
        'communication_score': _avg_eval_field(evals, 'communication_score'),
        'confidence_score': _avg_eval_field(evals, 'confidence_score'),
        'technical_score': _avg_eval_field(evals, 'technical_score'),
        'problem_solving_score': _avg_eval_field(evals, 'problem_solving_score'),
        'professionalism_score': _avg_eval_field(evals, 'professionalism_score'),
        'soft_skills_score': _avg_eval_field(evals, 'soft_skills_score'),
        'language_quality_score': _avg_eval_field(evals, 'language_quality_score'),
        'relevance_score': _avg_eval_field(evals, 'relevance_score'),
        'overall_score': _avg_eval_field(evals, 'overall_score'),
    }


def _build_role_label(session: InterviewSession, offer_context: dict[str, Any] | None) -> str:
    cfg_meta = dict(session.configuration.metadata_json or {})
    custom_title = str(cfg_meta.get('custom_job_title') or cfg_meta.get('role') or '').strip()
    custom_company = str(cfg_meta.get('custom_company') or cfg_meta.get('company') or '').strip()
    offer = offer_context or {}
    title = str(offer.get('internship_title') or offer.get('title') or custom_title).strip()
    company = str(offer.get('company') or custom_company).strip()
    if title and company:
        return f'{title} • {company}'
    if title:
        return title
    if company:
        return company
    return 'Simulation entretien' if session.language == 'fr' else 'Interview simulation'


def _build_interview_report(
    *,
    session: InterviewSession,
    final_eval: dict[str, Any],
    turn_evals: list[InterviewEvaluation],
    offer_context: dict[str, Any] | None,
) -> dict[str, Any]:
    lang = str(session.language or 'fr')
    turns = _session_to_dict(session).get('turns', [])
    answers_analyzed = _count_analyzed_answers(turns)

    if answers_analyzed == 0:
        readiness_key = 'insufficient_data'
        readiness_text = 'Non évalué' if lang == 'fr' else 'Not evaluated'
        no_answer_detail = (
            'Aucune réponse enregistrée'
            if lang == 'fr'
            else 'No answers recorded'
        )
        return {
            'overall_score': 0,
            'readiness_key': readiness_key,
            'readiness_text': readiness_text,
            'role_label': _build_role_label(session, offer_context),
            'categories': [
                {
                    'id': 'communication',
                    'label': 'Communication' if lang == 'fr' else 'Communication',
                    'score': 0,
                    'delta': 0,
                },
                {
                    'id': 'preparation',
                    'label': 'Préparation' if lang == 'fr' else 'Preparation',
                    'score': 0,
                    'delta': 0,
                },
                {
                    'id': 'motivation',
                    'label': 'Motivation' if lang == 'fr' else 'Motivation',
                    'score': 0,
                    'delta': 0,
                },
                {
                    'id': 'technical',
                    'label': 'Technique' if lang == 'fr' else 'Technical',
                    'score': 0,
                    'delta': 0,
                },
            ],
            'speech_metrics': [
                {
                    'id': 'eloquence',
                    'label': 'Éloquence' if lang == 'fr' else 'Eloquence',
                    'score': 0,
                    'assessment': '—',
                    'trend': 'neutral',
                },
                {
                    'id': 'pace',
                    'label': 'Débit' if lang == 'fr' else 'Pace',
                    'score': 0,
                    'detail': no_answer_detail,
                },
                {
                    'id': 'fluency',
                    'label': 'Fluidité' if lang == 'fr' else 'Fluency',
                    'score': 0,
                    'assessment': '—',
                    'trend': 'neutral',
                },
            ],
            'strengths': [],
            'weaknesses': list(final_eval.get('weaknesses') or []),
            'missing_skills': [],
            'recommendations': list(final_eval.get('improvement_recommendations') or []),
            'timeline': [
                {
                    'order': turn.get('order'),
                    'question': turn.get('question'),
                    'answer': turn.get('answer'),
                    'score': None,
                    'strengths': [],
                    'weaknesses': [],
                    'ideal_answer': '',
                }
                for turn in turns
            ],
            'communication_score': 0,
            'technical_score': 0,
            'confidence_score': 0,
            'professionalism_score': 0,
            'problem_solving_score': 0,
            'llm_provider': str(final_eval.get('model') or session.llm_provider or ''),
            'answers_analyzed': 0,
            'insufficient_data': True,
        }

    agg = _evaluation_aggregates(turn_evals)

    communication = agg['communication_score'] or int(final_eval.get('communication_score') or 0)
    technical = agg['technical_score'] or int(final_eval.get('technical_score') or 0)
    confidence = agg['confidence_score'] or int(final_eval.get('confidence_score') or 0)
    professionalism = agg['professionalism_score'] or int(final_eval.get('professionalism_score') or 0)
    problem_solving = agg['problem_solving_score'] or int(final_eval.get('problem_solving_score') or 0)
    relevance = agg['relevance_score'] or 0
    language_quality = agg['language_quality_score'] or 0
    soft_skills = agg['soft_skills_score'] or 0

    overall = int(final_eval.get('overall_score') or 0)
    if not overall and turn_evals:
        overall = agg['overall_score'] or round(
            mean([communication, technical, confidence, professionalism, problem_solving, relevance, language_quality]),
        )

    prev_final = (
        InterviewEvaluation.objects.filter(
            session__student_profile=session.student_profile,
            is_final=True,
            session__status=InterviewSession.Status.COMPLETED,
        )
        .exclude(session=session)
        .order_by('-created_at')
        .first()
    )
    prev_report = (prev_final.metadata_json or {}).get('report', {}) if prev_final else {}
    prev_categories = {
        str(item.get('id')): int(item.get('score') or 0)
        for item in (prev_report.get('categories') or [])
        if item.get('id')
    }

    def _delta(cat_id: str, score: int) -> int:
        prev_score = prev_categories.get(cat_id)
        if prev_score is None:
            return 0
        return score - prev_score

    preparation = round((professionalism + problem_solving) / 2) if (professionalism or problem_solving) else confidence
    motivation = relevance or round((communication + confidence) / 2) if (communication or confidence) else 0

    categories = [
        {
            'id': 'communication',
            'label': 'Communication' if lang == 'fr' else 'Communication',
            'score': communication,
            'delta': _delta('communication', communication),
        },
        {
            'id': 'preparation',
            'label': 'Préparation' if lang == 'fr' else 'Preparation',
            'score': preparation,
            'delta': _delta('preparation', preparation),
        },
        {
            'id': 'motivation',
            'label': 'Motivation' if lang == 'fr' else 'Motivation',
            'score': motivation,
            'delta': _delta('motivation', motivation),
        },
        {
            'id': 'technical',
            'label': 'Technique' if lang == 'fr' else 'Technical',
            'score': technical,
            'delta': _delta('technical', technical),
        },
    ]

    duration_seconds = int(session.duration_seconds or 0)
    if not duration_seconds and session.completed_at and session.started_at:
        duration_seconds = int((session.completed_at - session.started_at).total_seconds())
    wpm = _words_per_minute(turns, max(duration_seconds, 60))
    eloquence = language_quality or round((communication + confidence) / 2) if (communication or confidence) else 0
    fluency = round((communication + soft_skills) / 2) if (communication or soft_skills) else communication
    eloquence_trend, eloquence_label = _metric_assessment(eloquence, lang)
    fluency_trend, fluency_label = _metric_assessment(fluency, lang)
    pace_score = 100 if 80 <= wpm <= 140 else max(45, min(95, 100 - abs(wpm - 110)))

    speech_metrics = [
        {
            'id': 'eloquence',
            'label': 'Éloquence' if lang == 'fr' else 'Eloquence',
            'score': eloquence,
            'assessment': eloquence_label,
            'trend': eloquence_trend,
        },
        {
            'id': 'pace',
            'label': 'Débit' if lang == 'fr' else 'Pace',
            'score': pace_score,
            'detail': _pace_detail(wpm, lang),
        },
        {
            'id': 'fluency',
            'label': 'Fluidité' if lang == 'fr' else 'Fluency',
            'score': fluency,
            'assessment': fluency_label,
            'trend': fluency_trend,
        },
    ]

    eval_by_question_uuid: dict[str, InterviewEvaluation] = {}
    for ev in turn_evals:
        if ev.question_id and ev.question:
            eval_by_question_uuid[str(ev.question.uuid)] = ev

    timeline: list[dict[str, Any]] = []
    for turn in turns:
        ev = eval_by_question_uuid.get(str(turn.get('question_uuid') or ''))
        timeline.append(
            {
                'order': turn.get('order'),
                'question': turn.get('question'),
                'answer': turn.get('answer'),
                'score': ev.overall_score if ev else None,
                'strengths': list(ev.strengths_json or []) if ev else [],
                'weaknesses': list(ev.weaknesses_json or []) if ev else [],
                'ideal_answer': str(ev.ideal_answer or '') if ev else '',
            },
        )

    strengths, weaknesses, missing = _collect_turn_insights(turn_evals)
    if not strengths:
        strengths = list(final_eval.get('strengths') or [])
    if not weaknesses:
        weaknesses = list(final_eval.get('weaknesses') or [])
    if not missing:
        missing = list(final_eval.get('missing_skills') or [])

    recommendations = list(final_eval.get('improvement_recommendations') or [])
    readiness_key, readiness_text = _readiness_from_score(overall, lang)

    return {
        'overall_score': overall,
        'readiness_key': readiness_key,
        'readiness_text': readiness_text,
        'role_label': _build_role_label(session, offer_context),
        'categories': categories,
        'speech_metrics': speech_metrics,
        'strengths': strengths,
        'weaknesses': weaknesses,
        'missing_skills': missing,
        'recommendations': recommendations,
        'timeline': timeline,
        'communication_score': communication,
        'technical_score': technical,
        'confidence_score': confidence,
        'professionalism_score': professionalism,
        'problem_solving_score': problem_solving,
        'llm_provider': str(final_eval.get('model') or session.llm_provider or ''),
        'answers_analyzed': answers_analyzed,
        'insufficient_data': False,
    }


def _session_to_dict(session: InterviewSession) -> dict[str, Any]:
    cfg = session.configuration
    questions = session.questions.order_by('order_index')
    eval_by_question_id: dict[int, InterviewEvaluation] = {}
    for ev in session.evaluations.filter(is_final=False).select_related('question'):
        if ev.question_id:
            eval_by_question_id[ev.question_id] = ev
    turns: list[dict[str, Any]] = []
    for q in questions:
        ans = getattr(q, 'answer', None)
        ev = eval_by_question_id.get(q.id)
        turns.append(
            {
                'question_uuid': str(q.uuid),
                'order': q.order_index,
                'question': q.question_text,
                'category': q.category,
                'is_follow_up': q.is_follow_up,
                'answer': ans.answer_text if ans else '',
                'score': ev.overall_score if ev else None,
                'strengths': list(ev.strengths_json or []) if ev else [],
                'weaknesses': list(ev.weaknesses_json or []) if ev else [],
                'ideal_answer': str(ev.ideal_answer or '') if ev else '',
            },
        )
    return {
        'session_uuid': str(session.uuid),
        'status': session.status,
        'mode': session.mode,
        'offer_uuid': str(session.offer_uuid) if session.offer_uuid else None,
        'external_offer_url': session.external_offer_url,
        'language': session.language,
        'duration_seconds': session.duration_seconds,
        'configuration': {
            'difficulty': cfg.difficulty,
            'duration_minutes': cfg.duration_minutes,
            'communication_mode': cfg.communication_mode,
            'interview_type': cfg.interview_type,
            'recruiter_profile': cfg.recruiter_profile,
        },
        'turns': turns,
        'created_at': session.created_at.isoformat(),
    }


@transaction.atomic
def start_session(
    *,
    student: StudentProfile,
    payload: dict[str, Any],
) -> dict[str, Any]:
    expire_stale_interview_sessions(student=student)
    mode = payload.get('mode', InterviewSession.Mode.PROFILE)
    language = str(payload.get('language') or 'fr')[:8]
    offer_data: dict[str, Any] | None = None
    offer_uuid = None
    external_url = ''

    if mode == InterviewSession.Mode.OFFER:
        if payload.get('offer_uuid'):
            offer = InternshipOffer.objects.filter(uuid=payload['offer_uuid']).first()
            if not offer:
                raise ValueError('Offer not found.')
            offer_uuid = offer.uuid
            offer_data = _serialize_offer_context(offer)
            offer_data['profile_match'] = get_match_for_offer(student, offer)
        else:
            external_url = str(payload.get('external_offer_url') or '').strip()
            client_offer = payload.get('external_offer')
            if isinstance(client_offer, dict) and client_offer:
                normalized = _normalize_extracted_offer(client_offer, external_url)
                missing = _critical_missing_offer_fields(normalized)
                if missing:
                    return {
                        'requires_missing_fields': True,
                        'missing_fields': missing,
                        'extracted_offer': normalized,
                    }
                offer_data = normalized
                external_url = external_url or str(normalized.get('url') or '')
            else:
                if not external_url:
                    raise ValueError('Offer mode requires offer_uuid or external_offer_url.')
                extracted = _validate_external_offer(external_url)
                if extracted.missing_fields:
                    return {
                        'requires_missing_fields': True,
                        'missing_fields': extracted.missing_fields,
                        'extracted_offer': extracted.data,
                    }
                offer_data = extracted.data

    session = InterviewSession.objects.create(
        student_profile=student,
        mode=mode,
        status=InterviewSession.Status.IN_PROGRESS,
        language=language,
        offer_uuid=offer_uuid,
        external_offer_url=_clamp_external_offer_url(external_url),
        started_at=timezone.now(),
        last_activity_at=timezone.now(),
    )
    InterviewConfiguration.objects.create(
        session=session,
        difficulty=payload.get('difficulty') or InterviewConfiguration.Difficulty.MEDIUM,
        duration_minutes=max(5, int(payload.get('duration_minutes') or 20)),
        communication_mode=payload.get('communication_mode') or InterviewConfiguration.CommunicationMode.TEXT,
        interview_type=payload.get('interview_type') or InterviewConfiguration.InterviewType.MIXED,
        recruiter_profile=str(payload.get('recruiter_profile') or ''),
        metadata_json={'requested': json.loads(json.dumps(payload, default=str))},
    )
    InterviewTranscript.objects.create(session=session, transcript_text='', transcript_json=[])

    compact_context = _compact_student_context(student, offer_data)
    cfg = session.configuration
    interview_type = str(payload.get('interview_type') or InterviewConfiguration.InterviewType.MIXED).lower()
    prior_asked = _recent_questions_for_student(student, interview_type=interview_type)
    cfg_meta = dict(cfg.metadata_json or {})
    cfg_meta['compact_context'] = compact_context
    cfg_meta['interview_type'] = interview_type
    cfg_meta['asked_questions'] = list(prior_asked)
    cfg.metadata_json = cfg_meta
    cfg.save(update_fields=['metadata_json', 'updated_at'])
    provider = get_interview_provider()
    first = provider.generate_first_question(
        context=compact_context,
        session_cfg=cfg.metadata_json,
        asked_questions=prior_asked,
    )
    model = str(first.get('model') or '')
    session.llm_provider = 'ollama' if model != 'rule-based' else 'rule-based'
    session.llm_model = model
    session.save(update_fields=['llm_provider', 'llm_model', 'updated_at'])
    q = first.get('question') or {}
    question_text = str(q.get('text') or '').strip() or 'Présentez votre parcours.'
    asked_now = list(prior_asked)
    if not _is_duplicate_question(question_text, asked_now):
        asked_now.append(question_text)
    cfg_meta['asked_questions'] = asked_now[-80:]
    cfg.metadata_json = cfg_meta
    cfg.save(update_fields=['metadata_json', 'updated_at'])
    InterviewQuestion.objects.create(
        session=session,
        order_index=1,
        question_text=question_text,
        category=str(q.get('category') or 'intro'),
        rationale=str(q.get('rationale') or ''),
        is_follow_up=False,
    )
    return {'requires_missing_fields': False, **_session_to_dict(session)}


@transaction.atomic
def submit_answer(*, student: StudentProfile, session_uuid: str, payload: dict[str, Any]) -> dict[str, Any]:
    session = InterviewSession.objects.select_related('configuration').filter(
        uuid=session_uuid,
        student_profile=student,
    ).first()
    if not session:
        raise ValueError('Interview session not found.')
    if _is_session_stale(session):
        _finalize_abandoned_session(session)
        raise ValueError('Interview session expired due to inactivity. Please start a new simulation.')
    if session.status != InterviewSession.Status.IN_PROGRESS:
        raise ValueError('Interview is not active.')

    question_uuid = payload.get('question_uuid')
    answer_text = str(payload.get('answer') or '').strip()
    if not answer_text:
        raise ValueError('Answer is required.')

    question = InterviewQuestion.objects.filter(session=session, uuid=question_uuid).first()
    if not question:
        question = session.questions.order_by('-order_index').first()
    if not question:
        raise ValueError('No question available in this session.')

    InterviewAnswer.objects.update_or_create(
        question=question,
        defaults={
            'answer_text': answer_text,
            'answered_at': timezone.now(),
            'answer_language': session.language,
        },
    )

    transcript = list(session.questions.order_by('order_index').values('question_text', 'category', 'answer__answer_text'))
    cfg_meta = dict(session.configuration.metadata_json or {})
    cached_context = cfg_meta.get('compact_context')
    compact_context = cached_context if isinstance(cached_context, dict) else _compact_student_context(student, _offer_context_from_session(session))
    asked_questions = list(cfg_meta.get('asked_questions') or [])
    if not asked_questions:
        asked_questions = [q.question_text for q in session.questions.order_by('order_index')]
    provider = get_interview_provider()
    turn = provider.generate_next_turn(
        context=compact_context,
        session_cfg=session.configuration.metadata_json,
        previous_question=question.question_text,
        answer=answer_text,
        transcript=[
            {
                'question': item.get('question_text', ''),
                'answer': item.get('answer__answer_text', ''),
                'category': item.get('category', ''),
            }
            for item in transcript
        ],
        asked_questions=asked_questions,
    )

    eval_raw = turn.get('evaluation') or {}
    eval_raw = _clamp_evaluation_scores(eval_raw, answer_text)
    metrics = {
        'communication_score': int(eval_raw.get('communication') or 0),
        'confidence_score': int(eval_raw.get('confidence') or 0),
        'technical_score': int(eval_raw.get('technical_knowledge') or 0),
        'problem_solving_score': int(eval_raw.get('problem_solving') or 0),
        'professionalism_score': int(eval_raw.get('professionalism') or 0),
        'soft_skills_score': int(eval_raw.get('soft_skills') or 0),
        'language_quality_score': int(eval_raw.get('language_quality') or 0),
        'relevance_score': int(eval_raw.get('answer_relevance') or 0),
    }
    overall = _turn_overall_from_metrics(metrics)
    InterviewEvaluation.objects.create(
        session=session,
        question=question,
        overall_score=overall,
        strengths_json=list(eval_raw.get('strengths') or []),
        weaknesses_json=list(eval_raw.get('weaknesses') or []),
        missing_skills_json=list(eval_raw.get('missing_skills') or []),
        ideal_answer=str(eval_raw.get('ideal_answer') or ''),
        improvement_tips_json=list(eval_raw.get('improvement_tips') or []),
        readiness_label=str(eval_raw.get('readiness') or ''),
        metadata_json={'follow_up': turn.get('follow_up') or {}},
        **metrics,
    )

    next_question_payload = turn.get('next_question') or {}
    next_question_uuid = None
    if next_question_payload.get('text'):
        next_index = (session.questions.order_by('-order_index').values_list('order_index', flat=True).first() or 0) + 1
        next_text = str(next_question_payload.get('text'))
        next_question = InterviewQuestion.objects.create(
            session=session,
            order_index=next_index,
            question_text=next_text,
            category=str(next_question_payload.get('category') or 'follow_up'),
            rationale=str(next_question_payload.get('rationale') or ''),
            is_follow_up=bool((turn.get('follow_up') or {}).get('needed')),
        )
        next_question_uuid = str(next_question.uuid)
        asked_questions.append(next_text)
        cfg_meta['asked_questions'] = asked_questions[-80:]
        session.configuration.metadata_json = cfg_meta
        session.configuration.save(update_fields=['metadata_json', 'updated_at'])

    transcript_obj = session.transcript
    turns = _session_to_dict(session).get('turns', [])
    transcript_obj.transcript_json = turns
    transcript_obj.transcript_text = '\n'.join(
        [f"Q{t['order']}: {t['question']}\nA{t['order']}: {t.get('answer', '')}" for t in turns],
    )
    transcript_obj.save(update_fields=['transcript_json', 'transcript_text', 'updated_at'])

    session.last_activity_at = timezone.now()
    session.save(update_fields=['last_activity_at', 'updated_at'])
    return {
        **_session_to_dict(session),
        'latest_evaluation': {
            'overall_score': overall,
            'communication': metrics['communication_score'],
            'confidence': metrics['confidence_score'],
            'technical_knowledge': metrics['technical_score'],
            'problem_solving': metrics['problem_solving_score'],
            'professionalism': metrics['professionalism_score'],
            'soft_skills': metrics['soft_skills_score'],
            'language_quality': metrics['language_quality_score'],
            'answer_relevance': metrics['relevance_score'],
            'strengths': list(eval_raw.get('strengths') or []),
            'weaknesses': list(eval_raw.get('weaknesses') or []),
            'missing_skills': list(eval_raw.get('missing_skills') or []),
            'ideal_answer': str(eval_raw.get('ideal_answer') or ''),
            'improvement_tips': list(eval_raw.get('improvement_tips') or []),
            'readiness': str(eval_raw.get('readiness') or ''),
        },
        'next_question_uuid': next_question_uuid,
    }


@transaction.atomic
def complete_session(*, student: StudentProfile, session_uuid: str) -> dict[str, Any]:
    session = InterviewSession.objects.select_related('configuration').filter(
        uuid=session_uuid,
        student_profile=student,
    ).first()
    if not session:
        raise ValueError('Interview session not found.')
    if _is_session_stale(session):
        _finalize_abandoned_session(session)
        raise ValueError('Interview session expired due to inactivity. Please start a new simulation.')
    if session.status != InterviewSession.Status.IN_PROGRESS:
        raise ValueError('Interview is not active.')

    session.completed_at = timezone.now()
    session.duration_seconds = int((session.completed_at - session.started_at).total_seconds())

    turns = _session_to_dict(session).get('turns', [])
    answers_analyzed = _count_analyzed_answers(turns)
    turn_evals = list(session.evaluations.filter(is_final=False).order_by('created_at'))
    aggregates = _evaluation_aggregates(turn_evals)
    offer_context = _offer_context_from_session(session)
    lang = str(session.language or 'fr')

    if answers_analyzed == 0:
        final = _empty_final_eval('fr' if lang.startswith('fr') else 'en')
    else:
        provider = get_interview_provider()
        final = provider.evaluate_final(
            context=_compact_student_context(student, offer_context),
            transcript=[{'question': t.get('question', ''), 'answer': t.get('answer', '')} for t in turns],
            aggregates=aggregates,
        )
    report = _build_interview_report(
        session=session,
        final_eval=final,
        turn_evals=turn_evals,
        offer_context=offer_context,
    )
    InterviewEvaluation.objects.create(
        session=session,
        is_final=True,
        overall_score=int(final.get('overall_score') or report['overall_score'] or 0),
        communication_score=int(final.get('communication_score') or report['communication_score'] or 0),
        technical_score=int(final.get('technical_score') or report['technical_score'] or 0),
        confidence_score=int(final.get('confidence_score') or report['confidence_score'] or 0),
        professionalism_score=int(final.get('professionalism_score') or report['professionalism_score'] or 0),
        problem_solving_score=int(final.get('problem_solving_score') or report['problem_solving_score'] or 0),
        soft_skills_score=aggregates.get('soft_skills_score', 0),
        language_quality_score=aggregates.get('language_quality_score', 0),
        relevance_score=aggregates.get('relevance_score', 0),
        strengths_json=list(report.get('strengths') or final.get('strengths') or []),
        weaknesses_json=list(report.get('weaknesses') or final.get('weaknesses') or []),
        missing_skills_json=list(report.get('missing_skills') or final.get('missing_skills') or []),
        ideal_answer='\n'.join(final.get('ideal_answers') or []),
        improvement_tips_json=list(report.get('recommendations') or final.get('improvement_recommendations') or []),
        readiness_label=str(report.get('readiness_key') or final.get('interview_readiness') or ''),
        metadata_json={'report': report, 'model': final.get('model', '')},
    )
    InterviewFeedback.objects.update_or_create(
        session=session,
        defaults={
            'strengths': '\n'.join(report.get('strengths') or []),
            'weaknesses': '\n'.join(report.get('weaknesses') or []),
            'missing_skills': '\n'.join(report.get('missing_skills') or []),
            'improvement_recommendations': '\n'.join(report.get('recommendations') or []),
            'interview_readiness': str(report.get('readiness_text') or ''),
            'offer_comparison_json': _build_offer_comparison(session),
            'metadata_json': {'report': report},
        },
    )

    session.status = (
        InterviewSession.Status.ABANDONED
        if answers_analyzed == 0
        else InterviewSession.Status.COMPLETED
    )
    session.save(update_fields=['status', 'completed_at', 'duration_seconds', 'updated_at'])

    if answers_analyzed == 0:
        emit_event(
            event_code='interview.simulation.completed',
            source_app='cv_intelligence',
            entity_type='interview_session',
            entity_id=session.pk,
            payload={
                'user_id': session.student_profile.user_id,
                'title': 'Simulation terminée sans réponse' if lang.startswith('fr') else 'Simulation ended without answers',
                'body': (
                    'Répondez aux questions pour obtenir un score et un rapport IA.'
                    if lang.startswith('fr')
                    else 'Answer the questions to receive a score and AI report.'
                ),
                'session_uuid': str(session.uuid),
                'action_url': '/student/internship-offers/interview-simulator',
            },
            idempotency_key=f'interview-complete-{session.uuid}',
        )
        return {'session': _session_to_dict(session), 'final_evaluation': final, 'report': report}

    emit_event(
        event_code='interview.simulation.completed',
        source_app='cv_intelligence',
        entity_type='interview_session',
        entity_id=session.pk,
        payload={
            'user_id': session.student_profile.user_id,
            'title': 'Interview terminé',
            'body': f"Votre score global est {final.get('overall_score', 0)}/100.",
            'session_uuid': str(session.uuid),
            'score': int(final.get('overall_score') or 0),
            'action_url': '/student/internship-offers/interview-simulator',
        },
        idempotency_key=f'interview-complete-{session.uuid}',
    )
    previous_best = (
        InterviewEvaluation.objects.filter(
            session__student_profile=session.student_profile,
            is_final=True,
            session__status=InterviewSession.Status.COMPLETED,
        )
        .exclude(session=session)
        .order_by('-overall_score')
        .first()
    )
    final_score = int(final.get('overall_score') or 0)
    if previous_best and final_score > previous_best.overall_score:
        emit_event(
            event_code='interview.simulation.score_improved',
            source_app='cv_intelligence',
            entity_type='interview_session',
            entity_id=session.pk,
            payload={
                'user_id': session.student_profile.user_id,
                'title': 'Score entretien amélioré',
                'body': f'Bravo, vous passez de {previous_best.overall_score} à {final_score}.',
                'session_uuid': str(session.uuid),
            },
            idempotency_key=f'interview-score-improved-{session.uuid}',
        )
    elif final_score < 55:
        emit_event(
            event_code='interview.simulation.retry_recommended',
            source_app='cv_intelligence',
            entity_type='interview_session',
            entity_id=session.pk,
            payload={
                'user_id': session.student_profile.user_id,
                'title': 'Nouvelle simulation recommandée',
                'body': 'Refaites une simulation ciblée pour améliorer vos réponses faibles.',
                'session_uuid': str(session.uuid),
            },
            idempotency_key=f'interview-retry-recommend-{session.uuid}',
        )
    emit_event(
        event_code='interview.simulation.report_available',
        source_app='cv_intelligence',
        entity_type='interview_session',
        entity_id=session.pk,
        payload={
            'user_id': session.student_profile.user_id,
            'title': 'Rapport entretien disponible',
            'body': 'Votre rapport détaillé est prêt.',
            'session_uuid': str(session.uuid),
        },
        idempotency_key=f'interview-report-{session.uuid}',
    )
    return {'session': _session_to_dict(session), 'final_evaluation': final, 'report': report}


def _stale_session_seconds() -> int:
    return max(60, int(getattr(settings, 'INTERVIEW_STALE_SESSION_SECONDS', 3600)))


_expire_lock = threading.Lock()
_last_expire_by_student: dict[int, float] = {}
EXPIRE_THROTTLE_SECONDS = 15
EXPIRE_BATCH_LIMIT = 40


def _is_session_stale(session: InterviewSession) -> bool:
    if session.status != InterviewSession.Status.IN_PROGRESS:
        return False
    reference = session.last_activity_at or session.started_at
    elapsed = (timezone.now() - reference).total_seconds()
    return elapsed >= _stale_session_seconds()


@transaction.atomic
def _finalize_abandoned_session(session: InterviewSession) -> None:
    if session.status != InterviewSession.Status.IN_PROGRESS:
        return

    end_at = session.last_activity_at or timezone.now()
    session.status = InterviewSession.Status.ABANDONED
    session.completed_at = end_at
    if not session.duration_seconds:
        session.duration_seconds = max(0, int((end_at - session.started_at).total_seconds()))
    session.save(update_fields=['status', 'completed_at', 'duration_seconds', 'updated_at'])

    if session.evaluations.filter(is_final=True).exists():
        return

    turn_evals = list(session.evaluations.filter(is_final=False).order_by('created_at'))
    if not turn_evals:
        return

    agg = _evaluation_aggregates(turn_evals)
    overall = int(agg.get('overall_score') or 0)
    if overall <= 0:
        return

    InterviewEvaluation.objects.create(
        session=session,
        is_final=True,
        overall_score=overall,
        communication_score=int(agg.get('communication_score') or 0),
        technical_score=int(agg.get('technical_score') or 0),
        confidence_score=int(agg.get('confidence_score') or 0),
        professionalism_score=int(agg.get('professionalism_score') or 0),
        problem_solving_score=int(agg.get('problem_solving_score') or 0),
        soft_skills_score=int(agg.get('soft_skills_score') or 0),
        language_quality_score=int(agg.get('language_quality_score') or 0),
        relevance_score=int(agg.get('relevance_score') or 0),
        strengths_json=[],
        weaknesses_json=[],
        missing_skills_json=[],
        ideal_answer='',
        improvement_tips_json=[],
        readiness_label='abandoned',
        metadata_json={'auto_abandoned': True, 'partial': True},
    )


def expire_stale_interview_sessions(*, student: StudentProfile | None = None) -> int:
    student_id = student.pk if student is not None else 0
    now_ts = timezone.now().timestamp()
    with _expire_lock:
        last = _last_expire_by_student.get(student_id, 0.0)
        if now_ts - last < EXPIRE_THROTTLE_SECONDS:
            return 0
        _last_expire_by_student[student_id] = now_ts

    cutoff = timezone.now() - timedelta(seconds=_stale_session_seconds())
    qs = InterviewSession.objects.filter(
        status=InterviewSession.Status.IN_PROGRESS,
        last_activity_at__lt=cutoff,
    ).select_related('configuration').order_by('last_activity_at')
    if student is not None:
        qs = qs.filter(student_profile=student)

    stale_sessions = list(qs[:EXPIRE_BATCH_LIMIT])
    if not stale_sessions:
        return 0

    abandoned = 0
    for session in stale_sessions:
        try:
            _finalize_abandoned_session(session)
            abandoned += 1
        except Exception:
            continue
    return abandoned


def list_sessions(*, student: StudentProfile) -> list[dict[str, Any]]:
    expire_stale_interview_sessions(student=student)
    final_eval_qs = InterviewEvaluation.objects.filter(is_final=True).order_by('-created_at')
    sessions = (
        InterviewSession.objects.filter(student_profile=student)
        .select_related('configuration')
        .prefetch_related(
            Prefetch('evaluations', queryset=final_eval_qs, to_attr='_final_evaluations'),
            'feedback',
        )
        .order_by('-created_at')[:30]
    )
    rows: list[dict[str, Any]] = []
    for s in sessions:
        cfg = s.configuration
        final_evals = getattr(s, '_final_evaluations', None) or []
        final_eval = final_evals[0] if final_evals else None
        report = (final_eval.metadata_json or {}).get('report', {}) if final_eval else {}
        if not report:
            try:
                report = (s.feedback.metadata_json or {}).get('report', {})
            except InterviewFeedback.DoesNotExist:
                report = {}
        answered_count = s.questions.filter(answer__isnull=False).count()
        rows.append(
            {
                'session_uuid': str(s.uuid),
                'mode': s.mode,
                'status': s.status,
                'score': final_eval.overall_score if final_eval else None,
                'language': s.language,
                'created_at': s.created_at.isoformat(),
                'completed_at': s.completed_at.isoformat() if s.completed_at else None,
                'duration_seconds': s.duration_seconds,
                'difficulty': cfg.difficulty,
                'interview_type': cfg.interview_type,
                'role_label': str(report.get('role_label') or ''),
                'readiness_text': str(report.get('readiness_text') or ''),
                'has_report': bool(report),
                'answers_count': answered_count,
            },
        )
    return rows


def get_hub_stats(*, student: StudentProfile) -> dict[str, Any]:
    expire_stale_interview_sessions(student=student)
    sessions_qs = InterviewSession.objects.filter(student_profile=student).order_by('created_at')
    total = sessions_qs.count()
    completed_sessions = list(
        sessions_qs.filter(status=InterviewSession.Status.COMPLETED).order_by('completed_at'),
    )
    completed_count = len(completed_sessions)

    final_evals: list[InterviewEvaluation] = []
    for session in completed_sessions:
        final_eval = session.evaluations.filter(is_final=True).order_by('-created_at').first()
        if final_eval:
            final_evals.append(final_eval)

    def _avg_field(field: str) -> int:
        vals = [int(getattr(ev, field) or 0) for ev in final_evals if int(getattr(ev, field) or 0) > 0]
        return round(mean(vals)) if vals else 0

    last_evals = final_evals[-7:]
    avg_score_trend = [int(ev.overall_score or 0) for ev in last_evals]
    confidence_trend = [int(ev.confidence_score or 0) for ev in last_evals]
    technical_trend = [int(ev.technical_score or 0) for ev in last_evals]

    prep_scores: list[int] = []
    for ev in final_evals:
        report = (ev.metadata_json or {}).get('report', {})
        prep_cat = next(
            (int(c.get('score') or 0) for c in (report.get('categories') or []) if c.get('id') == 'preparation'),
            0,
        )
        if prep_cat > 0:
            prep_scores.append(prep_cat)
        elif int(ev.professionalism_score or 0) or int(ev.problem_solving_score or 0):
            prep_scores.append(
                round((int(ev.professionalism_score or 0) + int(ev.problem_solving_score or 0)) / 2),
            )
    avg_preparation = round(mean(prep_scores)) if prep_scores else _avg_field('professionalism_score')

    completion_trend: list[int] = []
    completed_so_far = 0
    for index, session in enumerate(sessions_qs, start=1):
        if session.status == InterviewSession.Status.COMPLETED:
            completed_so_far += 1
        completion_trend.append(round(completed_so_far / index * 100))
    completion_trend = completion_trend[-7:]

    return {
        'avg_overall_score': _avg_field('overall_score'),
        'avg_preparation_score': avg_preparation,
        'avg_communication_score': _avg_field('communication_score'),
        'avg_technical_score': _avg_field('technical_score'),
        'avg_confidence_score': _avg_field('confidence_score'),
        'completion_rate': round(completed_count / max(total, 1) * 100),
        'session_count': total,
        'completed_count': completed_count,
        'analytics': {
            'avg_score': avg_score_trend,
            'confidence': confidence_trend,
            'technical': technical_trend,
            'completion': completion_trend,
        },
    }


def get_session_detail(*, student: StudentProfile, session_uuid: str) -> dict[str, Any]:
    session = InterviewSession.objects.select_related('configuration').filter(
        student_profile=student,
        uuid=session_uuid,
    ).first()
    if not session:
        raise ValueError('Interview session not found.')
    if _is_session_stale(session):
        _finalize_abandoned_session(session)
        session.refresh_from_db()
    final_eval = session.evaluations.filter(is_final=True).order_by('-created_at').first()
    report = (final_eval.metadata_json or {}).get('report', {}) if final_eval else {}
    if not report:
        try:
            report = (session.feedback.metadata_json or {}).get('report', {})
        except InterviewFeedback.DoesNotExist:
            report = {}
    return {
        **_session_to_dict(session),
        'report': report,
        'final_evaluation': {
            'overall_score': final_eval.overall_score,
            'communication_score': final_eval.communication_score,
            'technical_score': final_eval.technical_score,
            'confidence_score': final_eval.confidence_score,
            'professionalism_score': final_eval.professionalism_score,
            'problem_solving_score': final_eval.problem_solving_score,
            'strengths': final_eval.strengths_json,
            'weaknesses': final_eval.weaknesses_json,
            'missing_skills': final_eval.missing_skills_json,
            'ideal_answers': final_eval.ideal_answer.splitlines() if final_eval.ideal_answer else [],
            'improvement_recommendations': final_eval.improvement_tips_json,
            'interview_readiness': final_eval.readiness_label,
        } if final_eval else {},
    }


def _offer_context_from_session(session: InterviewSession) -> dict[str, Any] | None:
    if session.offer_uuid:
        offer = InternshipOffer.objects.filter(uuid=session.offer_uuid).first()
        if offer:
            return _serialize_offer_context(offer)
    if session.external_offer_url:
        return {'url': session.external_offer_url}
    return None


def _build_offer_comparison(session: InterviewSession) -> dict[str, Any]:
    if not session.offer_uuid:
        return {}
    offer = InternshipOffer.objects.filter(uuid=session.offer_uuid).first()
    if not offer:
        return {}
    match = get_match_for_offer(session.student_profile, offer)
    evaluations = session.evaluations.filter(is_final=False)
    weak_answers = []
    for ev in evaluations:
        if ev.overall_score < 60 and ev.question_id:
            weak_answers.append(str(ev.question.question_text)[:160])
    return {
        'matched_skills': match.get('matched_skills') or [],
        'missing_skills': match.get('missing_skills') or [],
        'weak_answers': weak_answers[:5],
        'estimated_readiness': int(match.get('score') or 0),
    }
