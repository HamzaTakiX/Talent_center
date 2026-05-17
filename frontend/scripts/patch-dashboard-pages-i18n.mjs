import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '../src/features/admin/dashboard/dashboard_cards');

const pages = [
  ['admins/pages/AllAdminsPage.tsx', 'dashboard.allAdmins', 'admins', 'admins'],
  ['encadrants/pages/AllEncadrantsPage.tsx', 'dashboard.allEncadrants', 'encadrantsDetail', 'encadrants'],
  ['students/pages/AllStudentsPage.tsx', 'dashboard.allStudents', 'students', 'students'],
  ['students-without-internship/pages/StudentsWithoutInternshipPage.tsx', 'dashboard.withoutInternship', 'students', 'students'],
  ['active-internship-offers/pages/ActiveInternshipOffersPage.tsx', 'dashboard.activeOffers', 'offers', 'offers'],
  ['ongoing-applications/pages/OngoingApplicationsPage.tsx', 'dashboard.ongoingApplications', 'offers', 'applications'],
  ['documents-pending-validation/pages/DocumentsPendingValidationPage.tsx', 'dashboard.documentsPending', 'documents', 'documents'],
  ['students-unpaid-srf/pages/StudentsUnpaidSrfPage.tsx', 'dashboard.unpaidSrf', 'students', 'students'],
];

for (const [rel, titleKey, subtitleKey, searchKey] of pages) {
  const full = path.join(root, rel);
  let c = fs.readFileSync(full, 'utf8');
  if (!c.includes('useAdminCopy')) {
    c = c.replace(/^import /m, `import { useAdminCopy } from '../../../i18n/useAdminCopy';\nimport `);
    c = c.replace(
      /const (\w+): FunctionComponent = \(\) => \{/,
      `const $1: FunctionComponent = () => {\n  const { pageTitle, filterSubtitle, searchPlaceholder } = useAdminCopy();`
    );
  }
  c = c.replace(/title=\{`[^`]+`\}/, `title={pageTitle('${titleKey}.title', { count: TOTAL_PLACEHOLDER })}`);
  // fix count variable names per file
  c = c.replace(
    /title=\{pageTitle\('([^']+)\.title', \{ count: TOTAL_PLACEHOLDER \}\)\}/,
    (_, key) => {
      const countVar =
        c.match(/(TOTAL_\w+_COUNT|ACTIVE_\w+_COUNT|ONGOING_\w+_COUNT|DOCUMENTS_\w+_COUNT|STUDENTS_\w+_COUNT)/)?.[1] ??
        'count';
      return `title={pageTitle('${key}.title', { count: ${countVar}.toLocaleString('en-US') })}`;
    }
  );
  c = c.replace(/subtitle="[^"]+"/, `subtitle={pageTitle('${titleKey}.subtitle')}`);
  c = c.replace(/searchPlaceholder="[^"]+"/, `searchPlaceholder={searchPlaceholder('${searchKey}')}`);
  fs.writeFileSync(full, c);
  console.log('ok', rel);
}
