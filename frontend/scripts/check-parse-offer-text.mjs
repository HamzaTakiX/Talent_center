/**
 * Regression harness for the "create offer from pasted text" parser.
 *
 * The frontend has no test runner installed, so this script transpiles
 * parseOfferText.ts on the fly (types stripped, no type-checking) and asserts
 * the shapes real users paste: labelled offers, plain website prose, Word
 * exports with non-breaking spaces and Wingdings bullets, long documents and
 * unusable input.
 *
 * Run: node scripts/check-parse-offer-text.mjs
 */
import { readFileSync, mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import ts from 'typescript';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');

function transpile(relPath) {
  const source = readFileSync(join(root, relPath), 'utf8');
  return ts.transpileModule(source, {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
  }).outputText;
}

const scratch = mkdtempSync(join(tmpdir(), 'parse-offer-text-'));
writeFileSync(
  join(scratch, 'createOfferWorkflow.mjs'),
  transpile('src/features/admin/offres-stage/types/createOfferWorkflow.ts'),
);
writeFileSync(
  join(scratch, 'parseOfferText.mjs'),
  transpile('src/features/admin/offres-stage/utils/parseOfferText.ts').replace(
    /from ['"][^'"]*createOfferWorkflow['"]/g,
    "from './createOfferWorkflow.mjs'",
  ),
);

const { parseOfferText } = await import(pathToFileURL(join(scratch, 'parseOfferText.mjs')).href);
rmSync(scratch, { recursive: true, force: true });

let failures = 0;
const check = (name, condition, detail = '') => {
  if (condition) {
    console.log(`  ok   ${name}`);
  } else {
    failures += 1;
    console.log(`  FAIL ${name}${detail ? ` — ${detail}` : ''}`);
  }
};

/* ------------------------------------------------------------------ */
console.log('\n1. Labelled text (documented format)');
{
  const r = parseOfferText([
    "Titre : Développeur Full Stack — Stage PFE",
    'Entreprise : TechCorp Maroc',
    'Ville : Casablanca',
    'Type : PFE',
    'Mode de travail : Hybride',
    '',
    'Description :',
    "Nous recherchons un stagiaire motivé pour renforcer l'équipe produit.",
    '',
    'Missions :',
    '- Développer des interfaces React',
    '- Concevoir des APIs Django',
    '',
    'Profil requis :',
    'Bac+5 en informatique.',
    '',
    'Compétences requises :',
    'React, Node.js, Python',
    '',
    'Langues : Français, Anglais',
    '',
    'Avantages :',
    'Gratification et encadrement.',
    '',
    'Date limite : 31/12/2025',
  ].join('\n'));

  check('title', r.form.title === 'Développeur Full Stack - Stage PFE', r.form.title);
  check('company', r.form.company === 'TechCorp Maroc', r.form.company);
  check('location', r.form.location === 'Casablanca', r.form.location);
  check('internshipType', r.form.internshipType === 'pfe', r.form.internshipType);
  check('workMode', r.form.workMode === 'hybrid', r.form.workMode);
  check('overview', r.form.description.overview.startsWith('Nous recherchons'), r.form.description.overview);
  check('responsibilities kept both lines', r.form.description.responsibilities.split('\n').length === 2);
  check('requirements', r.form.description.requirements === 'Bac+5 en informatique.');
  check('benefits', r.form.description.benefits === 'Gratification et encadrement.');
  check('skills', JSON.stringify(r.form.requiredSkills) === '["React","Node.js","Python"]', JSON.stringify(r.form.requiredSkills));
  check('languages', JSON.stringify(r.form.languages) === '["Français","Anglais"]', JSON.stringify(r.form.languages));
  check('deadline', r.form.recruitment.applicationDeadline === '2025-12-31', r.form.recruitment.applicationDeadline);
  check('no error', r.error === null, String(r.error));
  check('nothing missing', r.missing.length === 0, JSON.stringify(r.missing));
}

/* ------------------------------------------------------------------ */
console.log('\n2. Prose copied from a website (no labels at all)');
{
  const r = parseOfferText([
    'Stage PFE - Data Analyst',
    'Groupe Attijari',
    '',
    "Rejoignez notre pôle data à Rabat pour un stage de fin d'études de 6 mois.",
    "Vous participerez à la construction de tableaux de bord et à l'automatisation des reportings.",
    'Une première expérience en SQL est appréciée. Candidatures avant le 15 septembre 2026.',
  ].join('\n'));

  check('title from first line', r.form.title === 'Stage PFE - Data Analyst', r.form.title);
  check('company from second line', r.form.company === 'Groupe Attijari', r.form.company);
  check('city detected', r.form.location === 'Rabat', r.form.location);
  check('type inferred', r.form.internshipType === 'pfe', r.form.internshipType);
  check('overview from prose', r.form.description.overview.includes('tableaux de bord'), r.form.description.overview);
  check('deadline mid-sentence', r.form.recruitment.applicationDeadline === '2026-09-15', r.form.recruitment.applicationDeadline);
  check('no error', r.error === null, String(r.error));
}

/* ------------------------------------------------------------------ */
console.log('\n3. Word paste: NBSP before colon, Wingdings bullets, curly quotes');
{
  const r = parseOfferText([
    'Titre\u00A0: Chargé\u00A0d\u2019études Marketing',
    'Entreprise\u00A0: OCP Group',
    'Ville\u00A0: Marrakech',
    '',
    'Missions\u00A0:',
    '\uF0B7\u00A0Analyser le marché',
    '\u2022\u00A0Réaliser des benchmarks',
    '\uF0A7\u00A0Rédiger des synthèses',
    '',
    'Compétences\u00A0:',
    '\u2022 Excel',
    '\u2022 Power BI',
  ].join('\r\n'));

  check('title unwrapped from NBSP', r.form.title === "Chargé d'études Marketing", r.form.title);
  check('company', r.form.company === 'OCP Group', r.form.company);
  check('city', r.form.location === 'Marrakech', r.form.location);
  check('3 responsibilities lines', r.form.description.responsibilities.split('\n').length === 3, JSON.stringify(r.form.description.responsibilities));
  check('bullets became dashes', r.form.description.responsibilities.startsWith('- Analyser'), r.form.description.responsibilities);
  check('skills from bullets', JSON.stringify(r.form.requiredSkills) === '["Excel","Power BI"]', JSON.stringify(r.form.requiredSkills));
}

/* ------------------------------------------------------------------ */
console.log('\n4. Prose colons must not create sections');
{
  const r = parseOfferText([
    'Titre : Stage Développeur Mobile',
    'Entreprise : Inwi',
    '',
    'Description :',
    'Contexte : la direction digitale lance une nouvelle application.',
    "Note : le stage est rémunéré selon le profil.",
    'Attention : disponibilité immédiate demandée.',
  ].join('\n'));

  check('title intact', r.form.title === 'Stage Développeur Mobile', r.form.title);
  // "Contexte" is a real overview keyword, so it re-opens the overview section;
  // the unlabelled prose lines must stay attached instead of being dropped.
  check('prose lines preserved', r.form.description.overview.includes('rémunéré') && r.form.description.overview.includes('disponibilité'), r.form.description.overview);
}

/* ------------------------------------------------------------------ */
console.log('\n5. Long document (many sections, accents, lists)');
{
  const block = (i) => [
    '',
    `Missions ${i} :`,
    ...Array.from({ length: 12 }, (_, k) => `- Tâche numérotée ${i}.${k} avec des accents éàùç`),
  ].join('\n');
  const raw = [
    'Titre : Ingénieur DevOps — Stage de fin d\u2019études',
    'Entreprise : Maroc Telecom',
    'Ville : Tanger',
    '',
    'Description :',
    'Un long descriptif. '.repeat(200),
    Array.from({ length: 30 }, (_, i) => block(i)).join('\n'),
    '',
    'Compétences requises :',
    'Docker; Kubernetes; Terraform; Ansible; GitLab CI',
  ].join('\n');

  const started = Date.now();
  const r = parseOfferText(raw);
  const elapsed = Date.now() - started;

  check('title', r.form.title === "Ingénieur DevOps - Stage de fin d'études", r.form.title);
  check('company', r.form.company === 'Maroc Telecom', r.form.company);
  check('overview kept', r.form.description.overview.length > 1000);
  check('skills split on semicolons', r.form.requiredSkills.length === 5, JSON.stringify(r.form.requiredSkills));
  check(`parsed under 500ms (${elapsed}ms)`, elapsed < 500);
}

/* ------------------------------------------------------------------ */
console.log('\n6. Incomplete / unusable input');
{
  const tooShort = parseOfferText('Stage');
  check('short text rejected', tooShort.error === 'text_too_short', String(tooShort.error));

  const empty = parseOfferText('');
  check('empty text rejected', empty.error === 'text_too_short', String(empty.error));

  const partial = parseOfferText([
    'Compétences requises :',
    'Python, Django',
    '',
    'Langues :',
    'Français',
  ].join('\n'));
  check('no title reported', partial.error === 'no_fields_extracted', String(partial.error));

  const noCompany = parseOfferText([
    'Titre : Stage Data',
    '',
    'Description :',
    'Analyse de données pour la direction financière du groupe.',
  ].join('\n'));
  check('missing company surfaced', noCompany.missing.includes('company'), JSON.stringify(noCompany.missing));
  check('partial draft still usable', noCompany.error === null, String(noCompany.error));
}

/* ------------------------------------------------------------------ */
console.log('\n7. Date formats');
{
  const cases = [
    ['Date limite : 2026-03-01', '2026-03-01'],
    ['Date limite : 01/03/2026', '2026-03-01'],
    ['Date limite : 1.3.2026', '2026-03-01'],
    ['Date limite : 15 mars 2026', '2026-03-15'],
    ['Date limite : March 15, 2026', '2026-03-15'],
    ['Date limite : 03/15/2026', '2026-03-15'],
  ];
  for (const [line, expected] of cases) {
    const r = parseOfferText(`Titre : Stage Test\nEntreprise : ACME\nDescription :\nUn descriptif suffisamment long pour passer le seuil.\n${line}`);
    check(line, r.form.recruitment.applicationDeadline === expected, r.form.recruitment.applicationDeadline);
  }

  const garbage = parseOfferText('Titre : Stage Test\nEntreprise : ACME\nDescription :\nUn descriptif suffisamment long pour passer le seuil.\nDate limite : dès que possible');
  check('unparseable date left empty', garbage.form.recruitment.applicationDeadline === '', garbage.form.recruitment.applicationDeadline);
}

/* ------------------------------------------------------------------ */
console.log('\n8. Targeting is never invented by the parser');
{
  const r = parseOfferText('Titre : Stage Test\nEntreprise : ACME\nDescription :\nUn descriptif suffisamment long pour passer le seuil.');
  const t = r.form.targeting;
  const empty = Object.values(t).every((v) => Array.isArray(v) && v.length === 0);
  check('targeting left to the admin', empty, JSON.stringify(t));
}

console.log(failures === 0 ? '\nAll parseOfferText checks passed.\n' : `\n${failures} parseOfferText check(s) failed.\n`);
process.exit(failures === 0 ? 0 : 1);
