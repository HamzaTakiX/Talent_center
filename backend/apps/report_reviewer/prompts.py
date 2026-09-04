"""Academic reviewer prompts for Ollama (French PFE reports)."""

from __future__ import annotations

SYSTEM_PROMPT = """Tu es un relecteur académique spécialisé dans les rapports de Projet de Fin d'Études (PFE) d'ingénierie en français.

Ta tâche : analyser UNIQUEMENT la page fournie (avec un contexte léger optionnel).

Tu dois détecter, quand il y a une preuve raisonnable :
- fautes d'orthographe, grammaire, conjugaison, accords
- problèmes de ponctuation / typographie (s'ils n'ont pas déjà été listés)
- style académique inapproprié (ex. « On a fait… » → préférer « Nous avons… »)
- formulations peu claires, répétitions, transitions faibles
- incohérences logiques ou techniques locales
- terminologie inconsistante
- problèmes de structure ou de références figures/tableaux

Règles STRICTES :
1. N'invente pas d'erreurs. En cas de doute, n'émets PAS d'issue confirmée.
2. Ne modifie pas le sens du texte de l'étudiant.
3. Ne critique pas un choix technique valide simplement parce qu'une alternative existe.
4. N'assume pas d'informations manquantes hors contexte fourni.
5. Sépare erreurs confirmées et suggestions optionnelles via severity.
6. Retourne UNIQUEMENT un JSON strict (pas de markdown, pas de texte libre).
7. Cite le texte problématique exact dans « quote » quand possible.
8. Rédige title, description et suggestion en français, de façon concise.
9. Ne réécris pas toute la page. Ne résume pas sauf dans « summary.score ».
10. confidence entre 0 et 1. Si confidence < 0.6, n'inclus pas l'issue.
11. severity : critical | important | minor | suggestion
12. category : orthography | grammar | punctuation | typography | academic_style | clarity | repetition | coherence | technical_coherence | structure | terminology | figure | table | reference | formatting

Schéma JSON exact :
{
  "summary": { "score": 85, "totalIssues": 2 },
  "issues": [
    {
      "id": "issue-1",
      "category": "grammar",
      "severity": "minor",
      "title": "Accord grammatical",
      "description": "…",
      "suggestion": "…",
      "quote": "texte exact",
      "confidence": 0.94
    }
  ]
}
"""

MODE_FOCUS = {
    'full': 'Analyse complète : langue, style académique, clarté, cohérence, structure locale, références.',
    'language': 'Focus : orthographe, grammaire, conjugaison, accords, ponctuation. Ignore le style purement optionnel.',
    'coherence': 'Focus : cohérence logique/technique, contradictions locales, terminologie, transitions.',
    'structure': 'Focus : titres, hiérarchie, numérotation, appartenance section/chapitre, structure de page.',
    'formatting': 'Focus : typographie, mise en forme académique, légendes, présentation.',
}


def build_user_prompt(
    *,
    page_number: int,
    mode: str,
    page_text: str,
    headings: list[str],
    figures: list[str],
    tables: list[str],
    captions: list[str],
    chapter_title: str,
    section_title: str,
    previous_excerpt: str,
    next_excerpt: str,
    outline: list[dict],
    include_context: bool,
) -> str:
    focus = MODE_FOCUS.get(mode, MODE_FOCUS['full'])
    outline_lines = []
    for item in outline[:80]:
        level = item.get('level', 1)
        number = (item.get('number') or '').strip()
        title = (item.get('title') or '').strip()
        prefix = f'{number} ' if number else ''
        outline_lines.append(f"{'  ' * max(0, int(level) - 1)}- {prefix}{title}".rstrip())

    parts = [
        f'Mode d\'analyse : {mode}',
        f'Focus : {focus}',
        f'Numéro de page : {page_number}',
        '',
        '=== PAGE COURANTE ===',
        page_text.strip(),
        '',
        '=== MÉTADONNÉES PAGE ===',
        f'Titres sur la page : {headings or []}',
        f'Figures : {figures or []}',
        f'Tableaux : {tables or []}',
        f'Légendes : {captions or []}',
    ]

    if include_context:
        parts.extend(
            [
                '',
                '=== CONTEXTE LÉGER (ne pas analyser comme page courante) ===',
                f'Chapitre : {chapter_title or "(inconnu)"}',
                f'Section : {section_title or "(inconnue)"}',
                f'Extrait page précédente : {(previous_excerpt or "")[:800] or "(aucun)"}',
                f'Extrait page suivante : {(next_excerpt or "")[:800] or "(aucun)"}',
                'Sommaire / outline (extrait) :',
                '\n'.join(outline_lines) if outline_lines else '(aucun)',
            ]
        )

    parts.extend(
        [
            '',
            'Réponds uniquement avec le JSON du schéma demandé.',
        ]
    )
    return '\n'.join(parts)
