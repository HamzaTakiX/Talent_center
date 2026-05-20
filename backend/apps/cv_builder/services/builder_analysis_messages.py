"""Localized recruiter messages for rule-based CV analysis (fr / en / ar)."""

from __future__ import annotations

from typing import Any, Dict

SUPPORTED_LANGS = ('fr', 'en', 'ar')


def normalize_lang(lang: str) -> str:
    code = (lang or 'fr')[:2].lower()
    return code if code in SUPPORTED_LANGS else 'fr'


def msg(lang: str, key: str, **kwargs: Any) -> str:
    code = normalize_lang(lang)
    template = _MESSAGES.get(key, {}).get(code) or _MESSAGES.get(key, {}).get('en', key)
    try:
        return template.format(**kwargs)
    except KeyError:
        return template


from .builder_career_messages import CAREER_MESSAGES

_MESSAGES: Dict[str, Dict[str, str]] = {
    'profile_summary_success_align': {
        'fr': 'Votre résumé correspond bien aux attentes stage {program} ({internship}).',
        'en': 'Your summary aligns well with {program} {internship} expectations.',
        'ar': 'ملخصك يتوافق جيداً مع توقعات تدريب {program} ({internship}).',
    },
    'profile_summary_warning_expand': {
        'fr': 'Renforcez le résumé : intention de poste et au moins un résultat mesurable.',
        'en': 'Strengthen your summary with role intent and one measurable outcome.',
        'ar': 'عزّز الملخص: هدف الوظيفة ونتيجة واحدة قابلة للقياس.',
    },
    'profile_summary_warning_missing': {
        'fr': 'Résumé professionnel ciblé manquant — les recruteurs le lisent en premier.',
        'en': 'A targeted professional summary is missing — recruiters scan this first.',
        'ar': 'الملخص المهني المستهدف مفقود — المُوظّفون يقرؤونه أولاً.',
    },
    'experience_success_metrics': {
        'fr': 'Expériences avec impact chiffré — signal recruteur fort.',
        'en': 'Experience bullets show measurable impact — strong recruiter signal.',
        'ar': 'خبرات بأثر قابل للقياس — إشارة قوية للمُوظّف.',
    },
    'experience_warning_quantified': {
        'fr': "Manque de réalisations quantifiées (%, KPI, volume, temps gagné).",
        'en': 'Experience lacks quantified achievements (%, KPIs, volume, time saved).',
        'ar': 'الخبرة تفتقد إنجازات مُقاسة (٪، مؤشرات، حجم، وقت موفّر).',
    },
    'experience_warning_none': {
        'fr': 'Peu d\'expérience pertinente pour un stage {program} compétitif.',
        'en': 'No relevant experience for a competitive {program} internship.',
        'ar': 'خبرة محدودة لالتقاط تدريب {program} تنافسي.',
    },
    'education_success_ats': {
        'fr': 'Parcours académique structuré pour le parsing ATS.',
        'en': 'Education credentials are clearly structured for ATS parsing.',
        'ar': 'المسار الأكاديمي منظم لقراءة ATS.',
    },
    'skills_success_fit': {
        'fr': 'Compétences alignées sur {program} — bonne adéquation filière.',
        'en': 'Skills reflect {program} tooling — good specialization fit.',
        'ar': 'المهارات متوافقة مع {program} — ملاءمة جيدة للتخصص.',
    },
    'skills_warning_generic': {
        'fr': 'Compétences trop génériques pour {program} — ajoutez outils métier.',
        'en': 'Skills read too generic for {program} — add domain tools and methods.',
        'ar': 'مهارات عامة جداً لـ {program} — أضف أدوات المجال.',
    },
    'languages_success_multi': {
        'fr': 'Profil multilingue — atout pour recruteurs internationaux.',
        'en': 'Multilingual profile supports international recruiter pipelines.',
        'ar': 'ملف متعدد اللغات — ميزة للمُوظّفين الدوليين.',
    },
    'projects_success_depth': {
        'fr': 'Projets démontrent une profondeur technique au-delà des cours.',
        'en': 'Projects substantiate technical depth beyond coursework.',
        'ar': 'المشاريع تُظهر عمقاً تقنياً يتجاوز الدروس.',
    },
    'projects_warning_portfolio': {
        'fr': 'Ajoutez un projet portfolio si l\'expérience est limitée.',
        'en': 'Consider one portfolio project to compensate for limited experience.',
        'ar': 'أضف مشروعاً في المحفظة إذا كانت الخبرة محدودة.',
    },
    'readiness_high': {
        'fr': 'Profil compétitif pour candidatures stage ciblées.',
        'en': 'Profile competitive for targeted internship applications.',
        'ar': 'ملف تنافسي لطلبات التدريب المستهدفة.',
    },
    'readiness_low': {
        'fr': 'Renforcez les sections faibles avant envois massifs.',
        'en': 'Strengthen weak sections before high-volume applications.',
        'ar': 'عزّز الأقسام الضعيفة قبل الإرسال الجماعي.',
    },
    'attract_high': {
        'fr': 'Profil différenciant pour la présélection.',
        'en': 'Differentiated student profile for shortlisting.',
        'ar': 'ملف مميز للقائمة المختصرة.',
    },
    'attract_low': {
        'fr': 'Narratif d\'impact et mots-clés à affiner.',
        'en': 'Needs sharper impact narrative and keywords.',
        'ar': 'يحتاج سرد أثر أوضح وكلمات مفتاحية.',
    },
    'keyword_low': {
        'fr': 'Mots-clés {program} à densifier (résumé et compétences).',
        'en': 'Specialization keywords for {program} could be denser in summary and skills.',
        'ar': 'كلمات مفتاحية {program} تحتاج تعزيزاً في الملخص والمهارات.',
    },
    'keyword_ok': {
        'fr': 'Bonne couverture mots-clés pour stages {program}.',
        'en': 'Solid keyword alignment with {program} internship postings.',
        'ar': 'تغطية جيدة لكلمات تدريب {program}.',
    },
    'rec_measurable': {
        'fr': 'Ajoutez des résultats mesurables (%, €, utilisateurs) à chaque puce.',
        'en': 'Add measurable outcomes (%, €, users, time) to each experience bullet.',
        'ar': 'أضف نتائج قابلة للقياس (٪، €، مستخدمين) لكل نقطة خبرة.',
    },
    'rec_keywords': {
        'fr': 'Reprenez les mots-clés des offres stage {program} dans résumé et skills.',
        'en': 'Mirror {program} internship keywords in summary and skills.',
        'ar': 'انسخ كلمات عروض {program} في الملخص والمهارات.',
    },
    'rec_verbs': {
        'fr': 'Verbes d\'action + résultats lisibles en 6 secondes.',
        'en': 'Lead with action verbs and outcomes recruiters can scan in 6 seconds.',
        'ar': 'أفعال قوية + نتائج يقرأها المُوظّف في 6 ثوانٍ.',
    },
}

_MESSAGES.update(CAREER_MESSAGES)
