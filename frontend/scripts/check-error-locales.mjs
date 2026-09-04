/**
 * Guards the backend↔frontend error-code contract for offer creation.
 *
 * `apps/stage/views.py` returns `errors.code`, and the studio localizes it with
 * `t(...errors.<code>)`. A code without a locale entry silently falls back to
 * the server's English sentence, which is exactly the "message technique
 * incompréhensible" this work removed. This script fails when they drift.
 *
 * Run: node scripts/check-error-locales.mjs
 */
import { readFileSync, mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import ts from 'typescript';

const here = dirname(fileURLToPath(import.meta.url));
const frontend = join(here, '..');
const backend = join(frontend, '..', 'backend');

/** Codes the import service can emit, read straight from the Python source. */
function backendImportCodes() {
  const source = readFileSync(
    join(backend, 'apps', 'stage', 'services', 'offer_import_service.py'),
    'utf8',
  );
  const block = source.match(/_FAILURE_MESSAGES: dict\[str, str\] = \{([\s\S]*?)\n\}/);
  if (!block) throw new Error('Could not locate _FAILURE_MESSAGES in offer_import_service.py');
  const codes = [...block[1].matchAll(/^\s{4}'([a-z_]+)':/gm)].map((m) => m[1]);
  if (codes.length === 0) throw new Error('_FAILURE_MESSAGES parsed as empty');
  return codes;
}

/** Codes raised outside the failure table but surfaced on the same banner. */
const EXTRA_IMPORT_CODES = ['unexpected_error', 'import_failed'];

const TEXT_CODES = ['no_fields_extracted', 'text_too_short', 'parse_failed'];

const scratch = mkdtempSync(join(tmpdir(), 'error-locales-'));
const locales = {};
for (const [lang, file] of [
  ['fr', 'admin-copy.fr.ts'],
  ['en', 'admin-copy.en.ts'],
  ['ar', 'admin-copy.ar.ts'],
]) {
  const out = join(scratch, `${lang}.mjs`);
  writeFileSync(
    out,
    ts.transpileModule(readFileSync(join(frontend, 'src/features/admin/i18n/locales', file), 'utf8'), {
      compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
    }).outputText,
  );
  const mod = await import(pathToFileURL(out).href);
  locales[lang] = Object.values(mod)[0];
}
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

const at = (copy, path) => path.split('.').reduce((node, key) => (node ?? {})[key], copy);

const importCodes = [...backendImportCodes(), ...EXTRA_IMPORT_CODES];
console.log(`\nBackend import codes: ${importCodes.join(', ')}`);

for (const [lang, copy] of Object.entries(locales)) {
  console.log(`\n${lang}: URL import errors`);
  const errors = at(copy, 'forms.createOfferStudio.import.errors') ?? {};
  for (const code of importCodes) {
    const text = errors[code];
    check(code, typeof text === 'string' && text.trim().length > 10, text ? 'too short' : 'missing');
  }

  console.log(`${lang}: pasted-text errors`);
  const textErrors = at(copy, 'forms.createOfferStudio.text.errors') ?? {};
  for (const code of TEXT_CODES) {
    const text = textErrors[code];
    check(code, typeof text === 'string' && text.trim().length > 10, text ? 'too short' : 'missing');
  }
}

console.log(
  failures === 0
    ? '\nAll error-locale checks passed.\n'
    : `\n${failures} error-locale check(s) failed.\n`,
);
process.exit(failures === 0 ? 0 : 1);
