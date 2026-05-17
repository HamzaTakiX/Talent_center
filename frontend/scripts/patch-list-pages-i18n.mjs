import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const adminRoot = path.join(__dirname, '../src/features/admin');

const configs = [
  ['announcements-stage/annoucements_cards/active-announcements/pages/ActiveAnnouncementsListPage.tsx', 'announcements', 'announcements.active.title', 'announcements', 'announcements', 'announcements.filterActiveToolbar'],
  ['announcements-stage/annoucements_cards/all-announcements/pages/AllAnnouncementsListPage.tsx', 'announcements', 'announcements.all.title', 'announcements', 'announcements', 'announcements.filterAllToolbar'],
  ['offres-stage/offrestage_cards/all-offers/pages/AllOffersPage.tsx', 'offers', 'offers.all.title', 'offers', 'offers', null],
  ['offres-stage/offrestage_cards/active-offers/pages/ActiveOffersListPage.tsx', 'offers', 'offers.active.title', 'offers', 'offers', null],
  ['offres-stage/offrestage_cards/closed-offers/pages/ClosedOffersListPage.tsx', 'offers', 'offers.closed.title', 'offers', 'offers', null],
  ['offres-stage/offrestage_cards/draft-offers/pages/DraftOffersListPage.tsx', 'offers', 'offers.draft.title', 'offers', 'offers', null],
  ['offres-stage/offrestage_cards/expired-offers/pages/ExpiredOffersListPage.tsx', 'offers', 'offers.expired.title', 'offers', 'offers', null],
  ['offres-stage/offrestage_cards/with-applications/pages/OffersWithApplicationsListPage.tsx', 'offers', 'offers.withApplications.title', 'offers', 'offers', null],
  ['encadrant/encadrant_cards/all-encadrants/pages/AllEncadrantsListPage.tsx', 'encadrants', 'encadrants.all.title', 'encadrantsDetail', 'encadrants', null],
  ['encadrant/encadrant_cards/assigned-students/pages/EncadrantsByAssignedStudentsListPage.tsx', 'encadrants', 'encadrants.assigned.title', 'encadrantsDetail', 'encadrants', null],
  ['encadrant/encadrant_cards/reports-in-progress/pages/ReportsInProgressListPage.tsx', 'encadrants', 'encadrants.reports.title', 'encadrantsDetail', 'encadrants', null],
  ['encadrant/encadrant_cards/upcoming-meetings/pages/UpcomingMeetingsListPage.tsx', 'encadrants', 'encadrants.meetings.title', 'encadrantsDetail', 'encadrants', null],
  ['student/student_cards/total_students/pages/TotalStudentsListPage.tsx', 'students', 'students.total.title', 'students', 'students', null],
  ['student/student_cards/active_students/pages/ActiveStudentsListPage.tsx', 'students', 'students.active.title', 'students', 'students', null],
  ['student/student_cards/without_internship/pages/WithoutInternshipListPage.tsx', 'students', 'students.withoutInternship.title', 'students', 'students', null],
  ['student/student_cards/with_internship/pages/WithInternshipListPage.tsx', 'students', 'students.withInternship.title', 'students', 'students', null],
  ['student/student_cards/engagement_level/pages/EngagementLevelListPage.tsx', 'students', 'students.engagement.title', 'students', 'students', null],
];

function i18nImport(relFile) {
  const depth = relFile.split('/').length - 1;
  return `${'../'.repeat(depth)}i18n/useAdminCopy`;
}

function patchFile(relFile, backTo, titleKey, filterKey, searchKey, toolbarKey) {
  const full = path.join(adminRoot, relFile);
  let c = fs.readFileSync(full, 'utf8');
  const imp = i18nImport(relFile);

  if (!c.includes('useAdminCopy')) {
    c = c.replace(
      /^import /m,
      `import { useAdminCopy } from '${imp}';\nimport `
    );
    c = c.replace(
      /const (\w+): FunctionComponent = \(\) => \{\n  const navigate/,
      `const $1: FunctionComponent = () => {\n  const { pageTitle, filterSubtitle, searchPlaceholder } = useAdminCopy();\n  const navigate`
    );
    c = c.replace(
      /const (\w+): FunctionComponent = \(\) => \{\n  const \[/,
      `const $1: FunctionComponent = () => {\n  const { pageTitle, filterSubtitle, searchPlaceholder } = useAdminCopy();\n  const [`
    );
  }

  c = c.replace(/backLabel="[^"]+"/, `backTo="${backTo}"`);
  c = c.replace(/title=\{`[^`]+`\}/, `title={pageTitle('${titleKey}', { count: totalFormatted })}`);
  c = c.replace(/subtitle="[^"]+"/, `subtitle={filterSubtitle('${filterKey}')}`);
  c = c.replace(/searchPlaceholder="[^"]+"/, `searchPlaceholder={searchPlaceholder('${searchKey}')}`);
  if (toolbarKey) {
    c = c.replace(/toolbarAriaLabel="[^"]+"/, `toolbarAriaLabel={pageTitle('${toolbarKey}')}`);
  }

  fs.writeFileSync(full, c);
  console.log('ok', relFile);
}

for (const cfg of configs) patchFile(...cfg);

// SRF detail pages — back only
const srfPages = fs
  .readdirSync(path.join(adminRoot, 'SRF/srf_cards'), { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => `SRF/srf_cards/${d.name}/pages/${d.name.replace(/-/g, '').replace('students', 'Students').replace('payments', 'Payments').replace('validation', 'Validation')}DetailPage.tsx`);

// fix srf page names manually
const srfDetailFiles = [
  'SRF/srf_cards/paid-students/pages/PaidStudentsDetailPage.tsx',
  'SRF/srf_cards/unpaid-students/pages/UnpaidStudentsDetailPage.tsx',
  'SRF/srf_cards/partially-paid/pages/PartiallyPaidDetailPage.tsx',
  'SRF/srf_cards/pending-validation/pages/PendingValidationDetailPage.tsx',
  'SRF/srf_cards/late-payments/pages/LatePaymentsDetailPage.tsx',
  'SRF/srf_cards/blocked-students/pages/BlockedStudentsDetailPage.tsx',
  'SRF/srf_cards/exempted-students/pages/ExemptedStudentsDetailPage.tsx',
];

for (const rel of srfDetailFiles) {
  const full = path.join(adminRoot, rel);
  let c = fs.readFileSync(full, 'utf8');
  c = c.replace(/backLabel="Back to SRF"/, 'backTo="srf"');
  fs.writeFileSync(full, c);
  console.log('srf', rel);
}

// Documents filtered
const docFiltered = path.join(adminRoot, 'Documents_admin/Documents_cards/shared/DocumentsFilteredListPage.tsx');
let dc = fs.readFileSync(docFiltered, 'utf8');
dc = dc.replace(/backLabel="Back to Documents"/, 'backTo="documents"');
fs.writeFileSync(docFiltered, dc);

console.log('done');
