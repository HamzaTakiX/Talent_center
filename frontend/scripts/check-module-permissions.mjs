/**
 * Regression harness for admin module gating (`modulePermissions.ts`).
 *
 * Mirrors the backend scenario in
 * `apps/admin_management/tests/test_module_permissions.py`: an administrator
 * scoped to the Stage module must not be offered Finance or any other module,
 * while a super admin keeps everything.
 *
 * Run: node scripts/check-module-permissions.mjs
 */
import { readFileSync, mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import ts from 'typescript';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');

function transpile(relPath) {
  return ts.transpileModule(readFileSync(join(root, relPath), 'utf8'), {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
  }).outputText;
}

const scratch = mkdtempSync(join(tmpdir(), 'module-permissions-'));

// `onboardingCvGate` reaches for browser storage at call time; the gating logic
// under test never invokes it.
writeFileSync(
  join(scratch, 'onboardingCvGate.mjs'),
  'export const ONBOARDING_CV_EDITOR_PATH = "/cv-editor";\nexport const isOnboardingCvPending = () => false;\n',
);
writeFileSync(
  join(scratch, 'roleAuth.mjs'),
  transpile('src/features/auth/utils/roleAuth.ts').replace(
    /from ['"]\.\/onboardingCvGate['"]/g,
    "from './onboardingCvGate.mjs'",
  ),
);
writeFileSync(
  join(scratch, 'modulePermissions.mjs'),
  transpile('src/features/auth/utils/modulePermissions.ts').replace(
    /from ['"]\.\/roleAuth['"]/g,
    "from './roleAuth.mjs'",
  ),
);

const { canAccessAdminPath, requiredPermissionsForPath, hasAnyPermission } = await import(
  pathToFileURL(join(scratch, 'modulePermissions.mjs')).href
);
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

// Permissions granted by the ADMIN_INTERNSHIP role (rbac_seed.ROLE_DEFINITIONS).
const jihane = {
  id: 1,
  email: 'jihane@esca.test',
  role: 'ADMIN',
  is_super_admin: false,
  permission_codes: [
    'internship.manage',
    'students.manage',
    'reports.access',
    'reports.review',
    'reports.escalate',
    'reports.assign',
    'reports.export',
    'meetings.access',
    'meetings.manage',
    'history.entity.read',
  ],
};

const financeAdmin = {
  id: 2,
  email: 'karim@esca.test',
  role: 'ADMIN',
  is_super_admin: false,
  permission_codes: ['finance.manage', 'srf.import', 'srf.financial.manage', 'srf.financial.audit', 'reports.access', 'history.entity.read'],
};

const superAdmin = { id: 3, email: 'root@esca.test', role: 'ADMIN', is_super_admin: true, permission_codes: [] };

const supervisor = { id: 4, email: 'enc@esca.test', role: 'SUPERVISOR' };

const legacySession = { id: 5, email: 'cached@esca.test', role: 'ADMIN' };

/* ------------------------------------------------------------------ */
console.log('\n1. Stage-only administrator: allowed paths');
for (const path of [
  '/admin/dashboard',
  '/admin/profile',
  '/admin/notifications',
  '/admin/internship-offers',
  '/admin/internship-offers/create',
  '/admin/internship-offers/all',
  '/admin/internship-offers/drafts',
  '/admin/internship-offers/history',
  '/admin/active-internship-offers',
  '/admin/ongoing-applications',
  '/admin/students-without-internship',
  '/admin/students',
  '/admin/students/create',
  '/admin/dashboard/students',
  '/admin/student/chat',
  '/admin/encadrant/reports',
  '/admin/encadrant/meetings',
  '/admin/history',
]) {
  check(path, canAccessAdminPath(jihane, path));
}

console.log('\n2. Stage-only administrator: refused paths');
for (const path of [
  '/admin/srf',
  '/admin/srf/imports',
  '/admin/srf/config',
  '/admin/srf/paid-students',
  '/admin/srf/student/42',
  '/admin/students-unpaid-srf',
  '/admin/announcements',
  '/admin/announcements/create',
  '/admin/documents',
  '/admin/documents/catalog',
  '/admin/documents-pending-validation',
  '/admin/admins',
  '/admin/admins/create-administrator',
  '/admin/admins/7/permissions',
  '/admin/sous-admin/chat',
  '/admin/dashboard/admins',
  '/admin/encadrants',
  '/admin/encadrants/all',
  '/admin/dashboard/encadrants',
  '/admin/settings',
  '/admin/settings/academic-structure',
  '/admin/settings/email-system',
]) {
  check(path, !canAccessAdminPath(jihane, path), 'unexpectedly allowed');
}

/* ------------------------------------------------------------------ */
console.log('\n3. Finance administrator is the mirror image');
check('/admin/srf allowed', canAccessAdminPath(financeAdmin, '/admin/srf'));
check('/admin/srf/imports allowed', canAccessAdminPath(financeAdmin, '/admin/srf/imports'));
check('/admin/internship-offers refused', !canAccessAdminPath(financeAdmin, '/admin/internship-offers'));
check('/admin/admins refused', !canAccessAdminPath(financeAdmin, '/admin/admins'));
check('/admin/students refused', !canAccessAdminPath(financeAdmin, '/admin/students'));

/* ------------------------------------------------------------------ */
console.log('\n4. Super admin keeps every module');
for (const path of [
  '/admin/srf', '/admin/announcements', '/admin/documents', '/admin/admins',
  '/admin/encadrants', '/admin/settings', '/admin/internship-offers', '/admin/history',
]) {
  check(path, canAccessAdminPath(superAdmin, path));
}

/* ------------------------------------------------------------------ */
console.log('\n5. Prefix matching must not leak across sibling paths');
check(
  '/admin/students-unpaid-srf is finance, not students',
  requiredPermissionsForPath('/admin/students-unpaid-srf').includes('finance.manage'),
  JSON.stringify(requiredPermissionsForPath('/admin/students-unpaid-srf')),
);
check(
  '/admin/students-without-internship is internship, not students',
  requiredPermissionsForPath('/admin/students-without-internship').includes('internship.manage'),
);
check(
  '/admin/encadrants resolves before /admin/encadrant',
  JSON.stringify(requiredPermissionsForPath('/admin/encadrants')) === '["users.manage"]',
  JSON.stringify(requiredPermissionsForPath('/admin/encadrants')),
);
check(
  '/admin/encadrant/reports resolves before /admin/encadrant',
  requiredPermissionsForPath('/admin/encadrant/reports').includes('reports.access'),
);
check('/admin/dashboard is ungated', requiredPermissionsForPath('/admin/dashboard') === null);
check(
  '/admin/dashboard/students is still gated',
  requiredPermissionsForPath('/admin/dashboard/students')?.includes('students.manage') === true,
);

/* ------------------------------------------------------------------ */
console.log('\n6. Non-admin roles and legacy sessions are not locked out');
check('supervisor is not module-gated', canAccessAdminPath(supervisor, '/admin/encadrant/reports'));
check('session without permission_codes falls open', canAccessAdminPath(legacySession, '/admin/srf'));
check('anonymous is refused', !canAccessAdminPath(null, '/admin/dashboard'));
check('hasAnyPermission on empty list is false', !hasAnyPermission(jihane, []));

console.log(failures === 0 ? '\nAll modulePermissions checks passed.\n' : `\n${failures} modulePermissions check(s) failed.\n`);
process.exit(failures === 0 ? 0 : 1);
