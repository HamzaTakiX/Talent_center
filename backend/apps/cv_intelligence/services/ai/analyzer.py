"""AI-powered semantic analysis using Ollama."""

from __future__ import annotations

import json
import logging
from typing import Any

from django.conf import settings

from .ollama_client import OllamaClient, get_ollama_client
from .prompts import (
    INTERVIEW_ANSWER_EVAL_SCHEMA,
    INTERVIEW_ANSWER_EVAL_SYSTEM,
    INTERVIEW_PREP_SCHEMA,
    INTERVIEW_PREP_SYSTEM,
    OFFER_COMPARISON_SCHEMA,
    OFFER_COMPARISON_SYSTEM,
    OFFER_INTERVIEW_SCHEMA,
    OFFER_INTERVIEW_SYSTEM,
    ROADMAP_SCHEMA,
    ROADMAP_SYSTEM,
    SCORE_EXPLANATIONS_SCHEMA,
    SCORE_EXPLANATIONS_SYSTEM,
    SEMANTIC_PROFILE_SCHEMA,
    SEMANTIC_PROFILE_SYSTEM,
    SWOT_SCHEMA,
    SWOT_SYSTEM,
)

logger = logging.getLogger(__name__)


def _should_use_ai() -> bool:
    provider = getattr(settings, 'CV_INTELLIGENCE_PROVIDER', 'ollama')
    if provider == 'rule-based':
        return False
    return get_ollama_client().is_available()


def _build_context(
    structured: dict[str, Any],
    student_context: dict[str, Any],
    languages: list[str],
    *,
    max_chars: int = 6000,
) -> str:
    payload = json.dumps(
        {
            'detected_languages': languages,
            'student_context': student_context,
            'cv_structured': structured,
        },
        ensure_ascii=False,
        separators=(',', ':'),
    )
    if len(payload) > max_chars:
        payload = payload[:max_chars] + '…'
    return payload


def analyze_semantic_profile(
    structured: dict[str, Any],
    student_context: dict[str, Any],
    languages: list[str],
    lang: str = 'fr',
    client: OllamaClient | None = None,
    *,
    ai_enabled: bool | None = None,
) -> tuple[dict[str, Any], str]:
    if ai_enabled is False or (ai_enabled is None and not _should_use_ai()):
        return _rule_based_semantic_profile(structured, student_context), 'rule-based'
    client = client or get_ollama_client()
    user_prompt = (
        f'Response language: {lang}\n'
        f'Schema:\n{SEMANTIC_PROFILE_SCHEMA}\n\n'
        f'CV data:\n{_build_context(structured, student_context, languages)}'
    )
    try:
        result, model = client.chat_json(SEMANTIC_PROFILE_SYSTEM, user_prompt, max_tokens=1200)
        return result, model
    except Exception as exc:
        logger.warning('Ollama semantic profile failed: %s', exc)
        return _rule_based_semantic_profile(structured, student_context), 'rule-based'


def analyze_swot(
    structured: dict[str, Any],
    student_context: dict[str, Any],
    languages: list[str],
    lang: str = 'fr',
    client: OllamaClient | None = None,
    *,
    ai_enabled: bool | None = None,
) -> tuple[dict[str, Any], str]:
    if ai_enabled is False or (ai_enabled is None and not _should_use_ai()):
        return _rule_based_swot(structured), 'rule-based'
    client = client or get_ollama_client()
    user_prompt = (
        f'Response language: {lang}\n'
        f'Schema:\n{SWOT_SCHEMA}\n\n'
        f'CV data:\n{_build_context(structured, student_context, languages)}'
    )
    try:
        result, model = client.chat_json(SWOT_SYSTEM, user_prompt, max_tokens=1200)
        return result, model
    except Exception as exc:
        logger.warning('Ollama SWOT failed: %s', exc)
        return _rule_based_swot(structured), 'rule-based'


def generate_score_explanations(
    structured: dict[str, Any],
    scores: dict[str, int],
    ats_analysis: dict[str, Any],
    lang: str = 'fr',
    client: OllamaClient | None = None,
    *,
    ai_enabled: bool | None = None,
) -> tuple[dict[str, Any], str]:
    if ai_enabled is False or (ai_enabled is None and not _should_use_ai()):
        return _rule_based_explanations(scores, ats_analysis, structured), 'rule-based'
    client = client or get_ollama_client()
    user_prompt = (
        f'Response language: {lang}\n'
        f'Schema:\n{SCORE_EXPLANATIONS_SCHEMA}\n\n'
        f'Scores: {json.dumps(scores)}\n'
        f'ATS analysis: {json.dumps(ats_analysis, ensure_ascii=False)}\n'
        f'CV: {json.dumps(structured, ensure_ascii=False)[:4000]}'
    )
    try:
        result, model = client.chat_json(SCORE_EXPLANATIONS_SYSTEM, user_prompt, max_tokens=900)
        return result, model
    except Exception as exc:
        logger.warning('Ollama score explanations failed: %s', exc)
        return _rule_based_explanations(scores, ats_analysis, structured), 'rule-based'


def generate_roadmap(
    structured: dict[str, Any],
    swot: dict[str, Any],
    scores: dict[str, int],
    lang: str = 'fr',
    client: OllamaClient | None = None,
    *,
    ai_enabled: bool | None = None,
) -> tuple[list[dict[str, Any]], str]:
    if ai_enabled is False or (ai_enabled is None and not _should_use_ai()):
        return _rule_based_roadmap(swot, scores, structured), 'rule-based'
    client = client or get_ollama_client()
    user_prompt = (
        f'Response language: {lang}\n'
        f'Schema:\n{ROADMAP_SCHEMA}\n\n'
        f'SWOT: {json.dumps(swot, ensure_ascii=False)}\n'
        f'Scores: {json.dumps(scores)}\n'
        f'CV: {json.dumps(structured, ensure_ascii=False)[:4000]}'
    )
    try:
        result, model = client.chat_json(ROADMAP_SYSTEM, user_prompt, max_tokens=900)
        return list(result.get('steps') or []), model
    except Exception as exc:
        logger.warning('Ollama roadmap failed: %s', exc)
        return _rule_based_roadmap(swot, scores, structured), 'rule-based'


def generate_interview_prep(
    structured: dict[str, Any],
    semantic_profile: dict[str, Any],
    matches: list[dict[str, Any]],
    lang: str = 'fr',
    client: OllamaClient | None = None,
    *,
    ai_enabled: bool | None = None,
) -> tuple[list[dict[str, Any]], str]:
    if ai_enabled is False or (ai_enabled is None and not _should_use_ai()):
        return _rule_based_interview_prep(semantic_profile, matches, structured), 'rule-based'
    client = client or get_ollama_client()
    user_prompt = (
        f'Response language: {lang}\n'
        f'Schema:\n{INTERVIEW_PREP_SCHEMA}\n\n'
        f'Profile: {json.dumps(semantic_profile, ensure_ascii=False)}\n'
        f'Top matches: {json.dumps(matches[:5], ensure_ascii=False)}\n'
        f'CV skills: {json.dumps(structured.get("skills") or [], ensure_ascii=False)}'
    )
    try:
        result, model = client.chat_json(INTERVIEW_PREP_SYSTEM, user_prompt, max_tokens=800)
        return list(result.get('recommendations') or []), model
    except Exception as exc:
        logger.warning('Ollama interview prep failed: %s', exc)
        return _rule_based_interview_prep(semantic_profile, matches, structured), 'rule-based'


def _rule_based_semantic_profile(
    structured: dict[str, Any],
    student_context: dict[str, Any],
) -> dict[str, Any]:
    skills = structured.get('skills') or []
    tech_keywords = {'python', 'java', 'react', 'javascript', 'sql', 'docker', 'aws', 'node', 'typescript'}
    tech = [s for s in skills if any(k in s.lower() for k in tech_keywords)]
    business = [s for s in skills if s not in tech][:8]

    filiere = student_context.get('filiere') or student_context.get('program') or ''
    career = student_context.get('career_objective') or structured.get('professional_summary') or ''

    if tech:
        profile = 'Technical Profile'
    elif filiere:
        profile = f'{filiere} Student'
    else:
        profile = 'General Business Student'

    return {
        'professional_profile': profile,
        'career_direction': career[:200] if career else profile,
        'technical_skills': tech[:15],
        'business_skills': business[:10],
        'soft_skills': _infer_soft_skills(structured),
        'academic_background': '; '.join(structured.get('education') or [])[:300],
        'internship_readiness': _readiness_label(structured),
        'professional_maturity': _maturity_label(structured),
    }


def _rule_based_swot(structured: dict[str, Any]) -> dict[str, Any]:
    strengths: list[str] = []
    weaknesses: list[str] = []
    opportunities: list[str] = []
    risks: list[str] = []

    skills = structured.get('skills') or []
    if skills:
        strengths.append(f'Skills portfolio: {", ".join(skills[:5])}')
    if structured.get('experience'):
        strengths.append(f'{len(structured["experience"])} experience entries documented')
    if structured.get('projects'):
        strengths.append(f'{len(structured["projects"])} projects listed')
    if len(structured.get('languages') or []) > 1:
        strengths.append('Multilingual profile')

    if not structured.get('github'):
        weaknesses.append('No GitHub portfolio link')
    if not structured.get('linkedin'):
        weaknesses.append('LinkedIn profile not listed')
    if not structured.get('professional_summary'):
        weaknesses.append('Missing professional summary')
    if len(skills) < 5:
        weaknesses.append('Limited skills section')

    if not structured.get('certifications'):
        opportunities.append('Add relevant certifications')
    if not structured.get('projects'):
        opportunities.append('Add personal or academic projects')
    if not structured.get('achievements'):
        opportunities.append('Add quantified achievements')

    if len(skills) < 3:
        risks.append('Low keyword coverage for ATS systems')
    if not structured.get('experience') and not structured.get('internship_history'):
        risks.append('No internship or work experience documented')

    return {
        'strengths': strengths[:5],
        'weaknesses': weaknesses[:5],
        'opportunities': opportunities[:4],
        'risks': risks[:3],
    }


def _rule_based_explanations(
    scores: dict[str, int],
    ats_analysis: dict[str, Any],
    structured: dict[str, Any],
) -> dict[str, Any]:
    skill_count = len(structured.get('skills') or [])
    exp_count = len(structured.get('experience') or [])
    edu_count = len(structured.get('education') or [])
    return {
        'global': f'Score global {scores.get("global", 0)}/100 basé sur {skill_count} compétences, {exp_count} expériences et {edu_count} formations.',
        'skills': f'Score compétences {scores.get("skills", 0)}/100 — {skill_count} compétences identifiées dans le CV.',
        'experience': f'Score expérience {scores.get("experience", 0)}/100 — {exp_count} entrées d\'expérience.',
        'education': f'Score formation {scores.get("education", 0)}/100 — {edu_count} entrées de formation.',
        'formatting': f'Score mise en forme {scores.get("formatting", 0)}/100 — sections contact et structure évaluées.',
        'ats': ats_analysis.get('summary') or f'Score ATS {scores.get("ats", 0)}/100.',
        'readiness': f'Score préparation stage {scores.get("readiness", 0)}/100.',
    }


def _rule_based_roadmap(
    swot: dict[str, Any],
    scores: dict[str, int],
    structured: dict[str, Any],
) -> list[dict[str, Any]]:
    steps: list[dict[str, Any]] = []
    step_num = 1
    if not structured.get('professional_summary'):
        steps.append({'step': step_num, 'title': 'Ajouter un résumé professionnel', 'description': 'Rédigez 3-4 lignes décrivant votre profil et objectif.', 'impact': 'high'})
        step_num += 1
    if not structured.get('github'):
        steps.append({'step': step_num, 'title': 'Ajouter un portfolio GitHub', 'description': 'Liez vos projets techniques à un profil GitHub actif.', 'impact': 'high'})
        step_num += 1
    for weakness in (swot.get('weaknesses') or [])[:2]:
        steps.append({'step': step_num, 'title': f'Corriger : {weakness[:60]}', 'description': weakness, 'impact': 'medium'})
        step_num += 1
    if scores.get('ats', 100) < 70:
        steps.append({'step': step_num, 'title': 'Optimiser les mots-clés ATS', 'description': 'Alignez vos compétences avec les offres ciblées.', 'impact': 'high'})
        step_num += 1
    steps.append({'step': step_num, 'title': 'Postuler aux offres correspondantes', 'description': 'Ciblez les offres avec le meilleur match.', 'impact': 'medium'})
    return steps


def _rule_based_interview_prep(
    semantic_profile: dict[str, Any],
    matches: list[dict[str, Any]],
    structured: dict[str, Any],
) -> list[dict[str, Any]]:
    recs: list[dict[str, Any]] = []
    profile = semantic_profile.get('professional_profile') or 'General'
    recs.append({
        'type': 'general',
        'title': f'Entretien {profile}',
        'reason': f'Préparation basée sur votre profil : {profile}',
        'priority': 'high',
    })
    tech_skills = semantic_profile.get('technical_skills') or structured.get('skills') or []
    if any('react' in s.lower() for s in tech_skills):
        recs.append({'type': 'react', 'title': 'Entretien React', 'reason': 'React détecté dans vos compétences', 'priority': 'high'})
    if any('python' in s.lower() or 'data' in s.lower() for s in tech_skills):
        recs.append({'type': 'data_analyst', 'title': 'Entretien Data Analyst', 'reason': 'Compétences data détectées', 'priority': 'medium'})
    for match in matches[:2]:
        recs.append({
            'type': 'offer_specific',
            'title': f'Entretien {match.get("title", "Offre")}',
            'reason': match.get('explanation') or f'Match {match.get("match_percent", 0)}%',
            'priority': 'high',
            'offer_id': match.get('id'),
        })
    return recs[:6]


def generate_offer_comparison(
    *,
    student_context: dict[str, Any],
    structured: dict[str, Any],
    offer: dict[str, Any],
    profile_match: dict[str, Any],
    cv_match: dict[str, Any] | None,
    lang: str = 'fr',
    client: OllamaClient | None = None,
) -> tuple[dict[str, Any], str]:
    offer_ai_enabled = getattr(settings, 'CV_INTELLIGENCE_OFFER_AI_ENABLED', False)
    if not offer_ai_enabled or not _should_use_ai():
        return _rule_based_offer_comparison(
            student_context, structured, offer, profile_match, cv_match,
        ), 'rule-based'
    client = client or get_ollama_client()
    user_prompt = (
        f'Response language: {lang}\n'
        f'Schema:\n{OFFER_COMPARISON_SCHEMA}\n\n'
        f'Student profile:\n{json.dumps(student_context, ensure_ascii=False)}\n'
        f'CV structured:\n{json.dumps(structured, ensure_ascii=False)[:6000]}\n'
        f'Offer:\n{json.dumps(offer, ensure_ascii=False)}\n'
        f'Profile match score: {profile_match.get("score")}\n'
        f'CV match: {json.dumps(cv_match or {}, ensure_ascii=False)[:2000]}'
    )
    try:
        result, model = client.chat_json(
            OFFER_COMPARISON_SYSTEM,
            user_prompt,
            max_tokens=getattr(settings, 'CV_INTELLIGENCE_OFFER_MAX_TOKENS', 220),
        )
        return result, model
    except Exception as exc:
        logger.warning('Ollama offer comparison failed: %s', exc)
        return _rule_based_offer_comparison(
            student_context, structured, offer, profile_match, cv_match,
        ), 'rule-based'


def generate_offer_interview_questions(
    *,
    student_context: dict[str, Any],
    structured: dict[str, Any],
    offer: dict[str, Any],
    lang: str = 'fr',
    question_count: int = 5,
    client: OllamaClient | None = None,
) -> tuple[list[dict[str, Any]], str]:
    if not _should_use_ai():
        return _rule_based_offer_interview_questions(offer, question_count), 'rule-based'
    client = client or get_ollama_client()
    user_prompt = (
        f'Response language: {lang}\n'
        f'Generate exactly {question_count} questions.\n'
        f'Schema:\n{OFFER_INTERVIEW_SCHEMA}\n\n'
        f'Offer:\n{json.dumps(offer, ensure_ascii=False)}\n'
        f'Student context:\n{json.dumps(student_context, ensure_ascii=False)}\n'
        f'CV skills: {json.dumps(structured.get("skills") or [], ensure_ascii=False)}'
    )
    try:
        result, model = client.chat_json(OFFER_INTERVIEW_SYSTEM, user_prompt)
        questions = list(result.get('questions') or [])
        for i, q in enumerate(questions):
            if not q.get('id'):
                q['id'] = f'q{i + 1}'
        return questions[:question_count], model
    except Exception as exc:
        logger.warning('Ollama offer interview failed: %s', exc)
        return _rule_based_offer_interview_questions(offer, question_count), 'rule-based'


def evaluate_interview_answer(
    *,
    student_context: dict[str, Any],
    structured: dict[str, Any],
    offer: dict[str, Any],
    question: dict[str, Any],
    answer: str,
    lang: str = 'fr',
    client: OllamaClient | None = None,
) -> tuple[dict[str, Any], str]:
    if not _should_use_ai():
        return _rule_based_answer_evaluation(question, answer), 'rule-based'
    client = client or get_ollama_client()
    user_prompt = (
        f'Response language: {lang}\n'
        f'Schema:\n{INTERVIEW_ANSWER_EVAL_SCHEMA}\n\n'
        f'Offer:\n{json.dumps(offer, ensure_ascii=False)[:2000]}\n'
        f'Question: {json.dumps(question, ensure_ascii=False)}\n'
        f'Student answer: {answer[:3000]}\n'
        f'Student context:\n{json.dumps(student_context, ensure_ascii=False)[:1500]}'
    )
    try:
        result, model = client.chat_json(INTERVIEW_ANSWER_EVAL_SYSTEM, user_prompt)
        return _normalize_answer_feedback(result), model
    except Exception as exc:
        logger.warning('Ollama answer evaluation failed: %s', exc)
        return _rule_based_answer_evaluation(question, answer), 'rule-based'


def _rule_based_offer_comparison(
    student_context: dict[str, Any],
    structured: dict[str, Any],
    offer: dict[str, Any],
    profile_match: dict[str, Any],
    cv_match: dict[str, Any] | None,
) -> dict[str, Any]:
    title = offer.get('title') or 'cette offre'
    company = offer.get('company') or "l'entreprise"
    matched = (cv_match or {}).get('matchedSkills') or []
    missing = (cv_match or {}).get('missingSkills') or profile_match.get('missing_skills') or []
    score = (cv_match or {}).get('matchPercent') or int(profile_match.get('score') or 0)

    strengths = [f'Compétence alignée : {s}' for s in matched[:4]]
    if student_context.get('filiere'):
        strengths.append(f"Filière : {student_context['filiere']}")
    if structured.get('experience'):
        strengths.append(f"{len(structured['experience'])} expérience(s) documentée(s)")

    gaps = [f'À renforcer : {s}' for s in missing[:4]]
    if not structured:
        gaps.append('Aucune analyse CV — lancez l\'outil d\'analyse CV pour un score précis')

    recommendations = []
    if missing:
        recommendations.append(f"Mettez en avant {', '.join(missing[:3])} dans votre CV et lettre.")
    recommendations.append(f"Reliez votre motivation à la mission « {title} » chez {company}.")
    recommendations.append('Préparez des exemples concrets (projets, stages) liés aux compétences demandées.')

    summary = (cv_match or {}).get('explanation') or (
        f"Compatibilité estimée à {score}% avec {title} chez {company}."
    )
    return {
        'summary': summary,
        'strengths': strengths[:5],
        'gaps': gaps[:5],
        'recommendations': recommendations[:5],
    }


def _rule_based_offer_interview_questions(
    offer: dict[str, Any],
    question_count: int,
) -> list[dict[str, Any]]:
    title = offer.get('title') or 'ce poste'
    company = offer.get('company') or 'notre entreprise'
    skills = offer.get('required_skills') or []

    templates = [
        {
            'id': 'q1',
            'text': f'Pourquoi souhaitez-vous rejoindre {company} pour le poste « {title} » ?',
            'category': 'motivation',
            'hint': 'Montrez que vous connaissez l\'entreprise et la mission du stage.',
        },
        {
            'id': 'q2',
            'text': 'Parlez-moi d\'un projet ou d\'une expérience qui démontre vos compétences pertinentes.',
            'category': 'behavioral',
            'hint': 'Utilisez la méthode STAR : Situation, Tâche, Action, Résultat.',
        },
        {
            'id': 'q3',
            'text': f'Comment vos études vous préparent-elles pour {title} ?',
            'category': 'offer',
            'hint': 'Liez votre formation aux exigences de l\'offre.',
        },
    ]
    if skills:
        templates.append({
            'id': 'q4',
            'text': f'Quelle est votre expérience avec {skills[0]} ?',
            'category': 'technical',
            'hint': 'Donnez un exemple concret, même académique ou personnel.',
        })
    templates.append({
        'id': 'q5',
        'text': 'Où vous voyez-vous à la fin de ce stage ?',
        'category': 'motivation',
        'hint': 'Montrez votre ambition tout en restant réaliste.',
    })
    return templates[:question_count]


def _rule_based_answer_evaluation(
    question: dict[str, Any],
    answer: str,
) -> dict[str, Any]:
    text = (answer or '').strip()
    word_count = len(text.split())
    score = 40
    went_well: list[str] = []
    needs: list[str] = []

    if word_count >= 40:
        score += 25
        went_well.append('Réponse suffisamment détaillée')
    else:
        needs.append('Développez davantage avec des exemples concrets')

    if any(k in text.lower() for k in ('projet', 'stage', 'expérience', 'équipe')):
        score += 15
        went_well.append('Exemples ou contexte mentionnés')
    else:
        needs.append('Ajoutez un exemple de projet ou d\'expérience')

    if word_count >= 80:
        score += 10

    score = min(95, score)
    return _normalize_answer_feedback({
        'score': score,
        'went_well': went_well or ['Vous avez tenté de répondre à la question'],
        'needs_improvement': needs or ['Structurez votre réponse (contexte → action → résultat)'],
        'suggested_answer': (
            f"Pour « {question.get('text', '')} », commencez par le contexte, "
            'décrivez votre rôle, les actions prises et le résultat obtenu.'
        ),
        'tips': [question.get('hint') or 'Soyez précis et liez votre réponse à l\'offre'],
    })


def _normalize_answer_feedback(raw: dict[str, Any]) -> dict[str, Any]:
    return {
        'score': int(raw.get('score') or 0),
        'wentWell': list(raw.get('went_well') or raw.get('wentWell') or [])[:3],
        'needsImprovement': list(raw.get('needs_improvement') or raw.get('needsImprovement') or [])[:3],
        'suggestedAnswer': str(raw.get('suggested_answer') or raw.get('suggestedAnswer') or ''),
        'tips': list(raw.get('tips') or [])[:2],
    }


def _infer_soft_skills(structured: dict[str, Any]) -> list[str]:
    text = json.dumps(structured, ensure_ascii=False).lower()
    found: list[str] = []
    markers = {
        'communication': 'Communication',
        'leadership': 'Leadership',
        'team': 'Travail en équipe',
        'autonom': 'Autonomie',
        'organis': 'Organisation',
    }
    for key, label in markers.items():
        if key in text:
            found.append(label)
    return found[:6]


def _readiness_label(structured: dict[str, Any]) -> str:
    score = 0
    if structured.get('skills'):
        score += 25
    if structured.get('experience') or structured.get('internship_history'):
        score += 30
    if structured.get('education'):
        score += 25
    if structured.get('professional_summary'):
        score += 10
    if structured.get('projects'):
        score += 10
    if score >= 75:
        return 'Ready — CV meets core internship requirements'
    if score >= 50:
        return 'Partially ready — some gaps remain'
    return 'Needs improvement before applying'


def _maturity_label(structured: dict[str, Any]) -> str:
    exp = len(structured.get('experience') or []) + len(structured.get('internship_history') or [])
    if exp >= 2:
        return 'Experienced student profile'
    if exp == 1:
        return 'Emerging professional profile'
    return 'Early-stage student profile'
