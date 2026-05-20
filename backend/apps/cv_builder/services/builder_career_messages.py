"""Localized career-coach copy (fr / en / ar) — merged into builder_analysis_messages."""

from __future__ import annotations

from typing import Dict

CAREER_MESSAGES: Dict[str, Dict[str, str]] = {
    'label_internship_default': {
        'fr': 'stage',
        'en': 'internship',
        'ar': 'التدريب',
    },
    'label_program_fallback': {
        'fr': 'votre filière',
        'en': 'your program',
        'ar': 'تخصصك',
    },
    # Profile summary
    'coach_summary_internship_aligned': {
        'fr': 'Votre résumé cible clairement le stage {internship} en {program} — bonne orientation.',
        'en': 'Your summary clearly targets a {internship} in {program} — strong career orientation.',
        'ar': 'ملخصك يستهدف بوضوح تدريب {internship} في {program} — توجه مهني جيد.',
    },
    'coach_summary_add_internship_intent': {
        'fr': 'Précisez dans le résumé votre objectif de stage ({internship}) et votre filière {program}.',
        'en': 'State your {internship} goal and {program} orientation explicitly in the summary.',
        'ar': 'اذكر في الملخص هدف التدريب ({internship}) وتخصصك {program} بوضوح.',
    },
    'coach_summary_missing': {
        'fr': 'Ajoutez un résumé professionnel orienté stage — c’est la première lecture recruteur.',
        'en': 'Add a internship-oriented professional summary — recruiters read it first.',
        'ar': 'أضف ملخصاً مهنياً موجهاً للتدريب — المُوظّف يقرأه أولاً.',
    },
    'coach_summary_theory_heavy': {
        'fr': 'Le résumé paraît très théorique — montrez davantage de travaux pratiques liés à {program}.',
        'en': 'The summary feels theory-heavy — show more hands-on work related to {program}.',
        'ar': 'الملخص يبدو نظرياً جداً — أظهر أعمالاً تطبيقية أكثر في {program}.',
    },
    # Experience
    'coach_exp_practical_exposure': {
        'fr': 'Vos expériences montrent une exposition pratique crédible pour {program}.',
        'en': 'Your experience shows credible practical exposure for {program}.',
        'ar': 'خبرتك تُظهر تعرضاً عملياً مقنعاً لـ {program}.',
    },
    'coach_exp_weak_internship_fit': {
        'fr': 'L’expérience ne reflète pas encore assez votre stage cible ({internship}).',
        'en': 'Experience does not yet reflect your target internship ({internship}).',
        'ar': 'الخبرة لا تعكس بعد التدريب المستهدف ({internship}).',
    },
    'coach_exp_none_suggest_extracurricular': {
        'fr': 'Peu d’expérience pro : valorisez clubs ESCA, simulations, bénévolat ou projets {program}.',
        'en': 'Limited work history — highlight ESCA clubs, simulations, volunteering, or {program} projects.',
        'ar': 'خبرة عمل محدودة — أبرز نوادي ESCA أو محاكاة أو تطوع أو مشاريع {program}.',
    },
    'coach_exp_highlight_leadership': {
        'fr': 'Mettez en avant un rôle lead (club, projet, association) pour vous différencier.',
        'en': 'Highlight a leadership role (club, project, association) to stand out.',
        'ar': 'أبرز دور قيادي (نادي، مشروع، جمعية) للتميز.',
    },
    # Education
    'coach_edu_academic_achievements': {
        'fr': 'Distinctions ou résultats académiques visibles — bon signal pour les recruteurs.',
        'en': 'Visible academic distinctions — positive signal for recruiters.',
        'ar': 'تميز أكاديمي ظاهر — إشارة إيجابية للمُوظّف.',
    },
    'coach_edu_certifications': {
        'fr': 'Des certifications alignées sur {domain} renforceraient votre crédibilité stage.',
        'en': 'Certifications aligned with {domain} would strengthen internship credibility.',
        'ar': 'شهادات متوافقة مع {domain} تعزز مصداقية التدريب.',
    },
    # Skills
    'coach_skills_field_tools': {
        'fr': 'Bonnes compétences outils/métiers pour {domain} — profil crédible.',
        'en': 'Solid field tools and methods for {domain} — credible profile.',
        'ar': 'مهارات أدوات/مجال جيدة لـ {domain} — ملف مقنع.',
    },
    'coach_skills_too_generic': {
        'fr': 'Compétences trop générales pour {domain} — ajoutez outils attendus en {program}.',
        'en': 'Skills are too generic for {domain} — add tools commonly expected in {program}.',
        'ar': 'مهارات عامة جداً لـ {domain} — أضف أدوات متوقعة في {program}.',
    },
    'coach_skills_missing_tools': {
        'fr': 'Envisagez d’ajouter : {tools} — souvent attendus en {domain}.',
        'en': 'Consider adding: {tools} — commonly expected in {domain}.',
        'ar': 'فكّر بإضافة: {tools} — شائعة في {domain}.',
    },
    # Languages
    'coach_lang_international_needs_more': {
        'fr': 'Profil international : au moins deux langues avec niveau précis renforce votre CV.',
        'en': 'International profile: at least two languages with clear levels strengthen your CV.',
        'ar': 'ملف دولي: لغتان على الأقل بمستوى واضح يعززان سيرتك.',
    },
    'coach_lang_asset': {
        'fr': 'Profil multilingue — atout pour stages et entreprises internationales.',
        'en': 'Multilingual profile — asset for internships and global employers.',
        'ar': 'ملف متعدد اللغات — ميزة للتدريب والشركات الدولية.',
    },
    # Projects
    'coach_projects_missing_specialization': {
        'fr': 'Ajoutez des projets liés à {domain} — les recruteurs attendent des exemples concrets.',
        'en': 'Add projects related to {domain} — recruiters expect concrete examples.',
        'ar': 'أضف مشاريع مرتبطة بـ {domain} — المُوظّف يتوقع أمثلة عملية.',
    },
    'coach_projects_strong': {
        'fr': 'Projets solides qui démontrent votre pratique en {domain}.',
        'en': 'Strong projects demonstrating hands-on work in {domain}.',
        'ar': 'مشاريع قوية تُظهر عملاً تطبيقياً في {domain}.',
    },
    'coach_projects_compensate_limited_exp': {
        'fr': 'Sans expérience, un projet portfolio (étude de cas, association, lab) est essentiel.',
        'en': 'With limited experience, a portfolio project (case, association, lab) is essential.',
        'ar': 'مع خبرة محدودة، مشروع محفظة (حالة، جمعية، مختبر) ضروري.',
    },
    'coach_projects_add_links': {
        'fr': 'Ajoutez des liens vers démos, rapports ou livrables pour crédibiliser vos projets.',
        'en': 'Add links to demos, reports, or deliverables to validate your projects.',
        'ar': 'أضف روابط للعروض أو التقارير أو المخرجات لتعزيز مشاريعك.',
    },
    # Overview narratives
    'coach_readiness_high': {
        'fr': 'Profil prêt pour candidatures stage {internship} en {program}.',
        'en': 'Profile ready for {internship} applications in {program}.',
        'ar': 'ملف جاهز لطلبات {internship} في {program}.',
    },
    'coach_readiness_build': {
        'fr': 'Renforcez projets, outils métier et liens pro avant campagne de stages.',
        'en': 'Strengthen projects, field tools, and professional links before applying.',
        'ar': 'عزّز المشاريع وأدوات المجال والروابط المهنية قبل التقديم.',
    },
    'coach_attract_high': {
        'fr': 'Bon potentiel de présélection pour {domain}.',
        'en': 'Good shortlist potential for {domain} roles.',
        'ar': 'إمكانية جيدة للقائمة المختصرة في {domain}.',
    },
    'coach_attract_improve': {
        'fr': 'Affinez l’alignement pratique avec {domain} pour convaincre plus vite.',
        'en': 'Sharpen practical alignment with {domain} to convince recruiters faster.',
        'ar': 'حسّن المواءمة العملية مع {domain} لإقناع المُوظّف أسرع.',
    },
    'coach_alignment_strong': {
        'fr': 'Bonne cohérence avec l’orientation {domain} / {program}.',
        'en': 'Strong alignment with {domain} / {program} orientation.',
        'ar': 'اتساق جيد مع توجه {domain} / {program}.',
    },
    'coach_alignment_weak': {
        'fr': 'Alignement {domain} perfectible — projets et outils métier à renforcer.',
        'en': '{domain} alignment can improve — add field projects and tools.',
        'ar': 'مواءمة {domain} تحتاج تعزيزاً — أضف مشاريع وأدوات المجال.',
    },
    # Recommendations (diverse)
    'coach_rec_linkedin': {
        'fr': 'Ajoutez LinkedIn — les recruteurs vérifient souvent le profil avant entretien.',
        'en': 'Add LinkedIn — recruiters often check profiles before interviews.',
        'ar': 'أضف LinkedIn — المُوظّف يتحقق من الملف غالباً قبل المقابلة.',
    },
    'coach_rec_portfolio_github': {
        'fr': 'Un GitHub avec 1–2 projets commentés renforce la crédibilité en {domain}.',
        'en': 'A GitHub with 1–2 documented projects builds credibility in {domain}.',
        'ar': 'GitHub بمشروعين موثّقين يعزز المصداقية في {domain}.',
    },
    'coach_rec_portfolio_behance': {
        'fr': 'Un portfolio (Behance/site) avec campagnes ou visuels aide en {domain}.',
        'en': 'A portfolio (Behance/site) with campaigns or visuals helps in {domain}.',
        'ar': 'محفظة (Behance/موقع) بحملات أو مرئيات تفيد في {domain}.',
    },
    'coach_rec_portfolio_portfolio_generic': {
        'fr': 'Un lien portfolio ou étude de cas rend votre profil {domain} plus concret.',
        'en': 'A portfolio link or case study makes your {domain} profile more tangible.',
        'ar': 'رابط محفظة أو دراسة حالة يجعل ملف {domain} أكثر واقعية.',
    },
    'coach_rec_specialization_projects': {
        'fr': 'Votre CV gagnerait avec davantage de projets liés à {domain} ({program}).',
        'en': 'Your CV would benefit from more {domain}-related projects ({program}).',
        'ar': 'سيرتك تستفيد من مشاريع أكثر مرتبطة بـ {domain} ({program}).',
    },
    'coach_rec_field_tools': {
        'fr': 'Intégrez des outils attendus dans votre filière : {tools}.',
        'en': 'Add tools commonly expected in your field: {tools}.',
        'ar': 'أضف أدوات متوقعة في مجالك: {tools}.',
    },
    'coach_rec_certifications': {
        'fr': 'Une certification courte alignée {domain} peut différencier votre candidature.',
        'en': 'A short certification aligned with {domain} can differentiate your application.',
        'ar': 'شهادة قصيرة متوافقة مع {domain} تميز طلبك.',
    },
    'coach_rec_extracurricular': {
        'fr': 'Valorisez activités para-universitaires (club ESCA, concours, pro bono) pour {program}.',
        'en': 'Highlight extracurriculars (ESCA club, competitions, pro bono) for {program}.',
        'ar': 'أبرز أنشطة خارجية (نادي ESCA، مسابقات) لـ {program}.',
    },
    'coach_rec_leadership': {
        'fr': 'Soulignez leadership, coordination ou mentoring — très lu en présélection.',
        'en': 'Emphasize leadership, coordination, or mentoring — valued in shortlisting.',
        'ar': 'أبرز القيادة أو التنسيق أو الإرشاد — مهم في الفرز.',
    },
    'coach_rec_practical_work': {
        'fr': 'Équilibrez le discours : moins théorie, plus livrables et résultats concrets {program}.',
        'en': 'Balance narrative: less theory, more deliverables and concrete outcomes in {program}.',
        'ar': 'وازن السرد: أقل نظرية وأكثر مخرجات ملموسة في {program}.',
    },
    'coach_rec_internship_focus': {
        'fr': 'Orientez le CV vers le type de stage visé : {internship}.',
        'en': 'Orient the CV toward your target internship type: {internship}.',
        'ar': 'وجّه السيرة نحو نوع التدريب المستهدف: {internship}.',
    },
    'coach_rec_communication_impact': {
        'fr': 'Renforcez communication analytique et impact métier dans chaque expérience.',
        'en': 'Strengthen analytical communication and business impact in each experience.',
        'ar': 'عزّز التواصل التحليلي والأثر المهني في كل خبرة.',
    },
    'coach_rec_specialization_skills': {
        'fr': 'La section compétences manque d’outils avancés liés à {domain}.',
        'en': 'Skills section lacks advanced tools related to {domain}.',
        'ar': 'قسم المهارات يفتقد أدوات متقدمة لـ {domain}.',
    },
    'coach_rec_languages_international': {
        'fr': 'Pour l’international, détaillez niveaux CECRL (FR/EN/ES…) avec preuves si possible.',
        'en': 'For international tracks, list CEFR levels (FR/EN/ES…) with evidence when possible.',
        'ar': 'للمسار الدولي، اذكر مستويات CEFR (FR/EN/ES…) مع إثبات إن أمكن.',
    },
    'coach_rec_project_links': {
        'fr': 'Ajoutez liens portfolio/GitHub/Behance sur vos projets clés.',
        'en': 'Add portfolio/GitHub/Behance links on key projects.',
        'ar': 'أضف روابط محفظة/GitHub/Behance على مشاريعك الرئيسية.',
    },
    'coach_rec_measurable_sparingly': {
        'fr': 'Sur 1–2 expériences clés, un résultat chiffré suffit (pas partout).',
        'en': 'On 1–2 key experiences, one quantified outcome is enough (not everywhere).',
        'ar': 'في 1–2 خبرات رئيسية، نتيجة رقمية واحدة تكفي (ليس في كل مكان).',
    },
}
