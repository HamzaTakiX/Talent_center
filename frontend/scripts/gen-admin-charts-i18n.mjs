import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const src = fs.readFileSync(
  path.join(__dirname, '../src/features/admin/ui/charts/statPageChartData.ts'),
  'utf8'
);

const charts = {};
const blockRe = /'([a-z0-9-]+)':\s*\{([\s\S]*?)\n  \},?\n/g;
let bm;
while ((bm = blockRe.exec(src)) !== null) {
  const id = bm[1];
  const block = bm[2];
  const title = block.match(/title:\s*'([^']*)'/)?.[1] ?? '';
  const subtitle = block.match(/subtitle:\s*'([^']*)'/)?.[1] ?? '';
  const ariaLabel = block.match(/ariaLabel:\s*'([^']*)'/)?.[1] ?? '';
  const entry = { title, subtitle, ariaLabel };
  const labelsM = block.match(/labels:\s*\[([^\]]+)\]/);
  if (labelsM) {
    entry.labels = [...labelsM[1].matchAll(/'([^']*)'/g)].map((x) => x[1]);
  }
  const series = {};
  const seriesBlock = block.match(/series:\s*\[([\s\S]*?)\],/);
  if (seriesBlock) {
    for (const sm of seriesBlock[1].matchAll(/key:\s*'([^']+)',\s*label:\s*'([^']*)'/g)) {
      series[sm[1]] = sm[2];
    }
  }
  if (Object.keys(series).length) entry.series = series;
  const segments = {};
  const segBlock = block.match(/segments:\s*\[([\s\S]*?)\],/);
  if (segBlock) {
    for (const sm of segBlock[1].matchAll(/key:\s*'([^']+)',\s*label:\s*'([^']*)'/g)) {
      segments[sm[1]] = sm[2];
    }
  }
  if (Object.keys(segments).length) entry.segments = segments;
  charts[id] = entry;
}

function toNestedCharts(obj, lang) {
  const out = {};
  for (const [id, cfg] of Object.entries(obj)) {
    const node = {
      title: cfg.title,
      subtitle: cfg.subtitle,
      ariaLabel: cfg.ariaLabel,
    };
    if (cfg.labels) {
      node.labels = {};
      cfg.labels.forEach((l, i) => {
        node.labels[String(i)] = l;
      });
    }
    if (cfg.series) node.series = { ...cfg.series };
    if (cfg.segments) node.segments = { ...cfg.segments };
    out[id] = node;
  }
  return out;
}

const frMap = {
  'Enrollment trend': 'Tendance des inscriptions',
  'New student registrations over the last 6 months': 'Nouvelles inscriptions sur les 6 derniers mois',
  'Activity split': 'Répartition d\'activité',
  'Active vs inactive accounts': 'Comptes actifs vs inactifs',
  'Search status': 'Statut de recherche',
  'Students without internship by status': 'Étudiants sans stage par statut',
  'Internship progress': 'Avancement du stage',
  'Assigned students by stage': 'Étudiants affectés par étape',
  'Engagement levels': 'Niveaux d\'engagement',
  'Distribution across High, Medium and Low': 'Répartition Élevé, Moyen et Faible',
  'Offers by status': 'Offres par statut',
  'Share of each offer state': 'Part de chaque état d\'offre',
  'Top companies': 'Meilleures entreprises',
  'Applications on active offers': 'Candidatures sur offres actives',
  'Expiration timeline': 'Chronologie d\'expiration',
  'Offers expired per month': 'Offres expirées par mois',
  'Draft activity': 'Activité brouillons',
  'Draft offers created per month': 'Brouillons créés par mois',
  'Closure reasons': 'Motifs de clôture',
  'Why offers were closed': 'Pourquoi les offres ont été clôturées',
  'Application volume': 'Volume de candidatures',
  'Applicants per offer bucket': 'Candidats par tranche d\'offre',
  'Payment overview': 'Aperçu des paiements',
  'Paid vs outstanding balance': 'Payé vs solde restant',
  'Unpaid amounts': 'Montants impayés',
  'Amount due by class group': 'Montant dû par filière',
  'Partial payments': 'Paiements partiels',
  'Due vs paid amounts (k MAD)': 'Dû vs payé (k MAD)',
  'Validation queue': 'File de validation',
  'Pending payments awaiting review': 'Paiements en attente de revue',
  'Late payments': 'Paiements en retard',
  'Late cases detected per week': 'Cas en retard par semaine',
  'Blocked accounts': 'Comptes bloqués',
  'Blocks issued over recent weeks': 'Blocages sur les dernières semaines',
  'Exemption reasons': 'Motifs d\'exemption',
  'Why students were exempted': 'Pourquoi les étudiants ont été exemptés',
  'Load by department': 'Charge par département',
  'Encadrants per department': 'Encadrants par département',
  'Top assignments': 'Top affectations',
  'Students assigned per encadrant (top 5)': 'Étudiants par encadrant (top 5)',
  'Reports status': 'Statut des rapports',
  'In progress vs submitted': 'En cours vs soumis',
  'Upcoming meetings': 'Réunions à venir',
  'Scheduled meetings per week': 'Réunions planifiées par semaine',
  'Announcement types': 'Types d\'annonces',
  'Distribution by category': 'Répartition par catégorie',
  'Active vs scheduled': 'Actives vs planifiées',
  'Currently live announcements': 'Annonces en ligne actuellement',
  'Document requests': 'Demandes de documents',
  'Status distribution': 'Répartition des statuts',
  'Pending age': 'Âge des en attente',
  'How long requests have waited': 'Durée d\'attente des demandes',
  'Validations trend': 'Tendance des validations',
  'Documents validated per day (last week)': 'Documents validés par jour (semaine)',
  'Rejection reasons': 'Motifs de rejet',
  'Top reasons for rejection': 'Principaux motifs de rejet',
  'Activity volume': 'Volume d\'activité',
  'Platform actions over the last 7 days': 'Actions plateforme sur 7 jours',
  'Student actions': 'Actions étudiants',
  'CRUD and profile updates per day': 'Mises à jour profil par jour',
  'Application funnel': 'Entonnoir de candidatures',
  'Applications by stage': 'Candidatures par étape',
  'SRF payments': 'Paiements SRF',
  'Payment-related actions per week': 'Actions paiement par semaine',
  'Document activity': 'Activité documents',
  'Validation workflow events': 'Événements du workflow',
  'Chat activity': 'Activité chat',
  'Messages sent per day': 'Messages envoyés par jour',
  'Students by field': 'Étudiants par filière',
  'Distribution across study fields': 'Répartition par filière',
  'Encadrants by department': 'Encadrants par département',
  'Supervisor distribution': 'Répartition des encadrants',
  'Admin roles': 'Rôles admin',
  'Platform administrators by role': 'Administrateurs par rôle',
  'Without internship': 'Sans stage',
  'Breakdown by support need': 'Répartition par besoin d\'accompagnement',
  'Applications': 'Candidatures',
  'Applicants on active offers': 'Candidats sur offres actives',
  'Ongoing applications by stage': 'Candidatures en cours par étape',
  'Pending validations': 'Validations en attente',
  'Documents awaiting review by age': 'Documents en attente par âge',
  'Unpaid SRF': 'SRF impayés',
  'Outstanding amount by class (k MAD)': 'Montant dû par classe (k MAD)',
  'Role distribution': 'Répartition des rôles',
  'Administrators by assigned role': 'Administrateurs par rôle assigné',
};

function translateFr(text) {
  return frMap[text] ?? text;
}

function translateCharts(obj, tr) {
  const out = {};
  for (const [id, cfg] of Object.entries(obj)) {
    const node = {
      title: tr(cfg.title),
      subtitle: tr(cfg.subtitle),
      ariaLabel: tr(cfg.ariaLabel),
    };
    if (cfg.labels) {
      node.labels = {};
      const labelEntries = Array.isArray(cfg.labels)
        ? cfg.labels.map((l, i) => [String(i), l])
        : Object.entries(cfg.labels);
      for (const [i, l] of labelEntries) {
        node.labels[i] = tr(l);
      }
    }
    if (cfg.series) {
      node.series = {};
      for (const [k, v] of Object.entries(cfg.series)) node.series[k] = tr(v);
    }
    if (cfg.segments) {
      node.segments = {};
      for (const [k, v] of Object.entries(cfg.segments)) node.segments[k] = tr(v);
    }
    out[id] = node;
  }
  return out;
}

const arMap = {
  Active: 'نشط',
  Inactive: 'غير نشط',
  Searching: 'يبحث',
  Students: 'طلاب',
  Applications: 'طلبات',
  Pending: 'قيد الانتظار',
  Validated: 'موثق',
  Rejected: 'مرفوض',
  Messages: 'رسائل',
  Actions: 'إجراءات',
  Offers: 'عروض',
  Encadrants: 'مشرفون',
  Meetings: 'اجتماعات',
  Paid: 'مدفوع',
  Due: 'مستحق',
  Drafts: 'مسودات',
  Expired: 'منتهي',
  Closed: 'مغلق',
  Draft: 'مسودة',
  High: 'مرتفع',
  Medium: 'متوسط',
  Low: 'منخفض',
};

function translateAr(text) {
  return arMap[text] ?? text;
}

const enCharts = toNestedCharts(charts);
const frCharts = translateCharts(enCharts, translateFr);
const arCharts = translateCharts(enCharts, translateAr);

const pagesEn = {
  announcements: {
    all: { title: 'All Announcements ({{count}})', subtitle: 'Filtered list of announcements' },
    active: { title: 'Active Announcements ({{count}})', subtitle: 'Filtered list of announcements' },
    allTypes: 'All types',
    filterByType: 'Filter by type',
    filterActiveToolbar: 'Filter active announcements',
    filterAllToolbar: 'Filter all announcements',
  },
  offers: {
    all: { title: 'All Offers ({{count}})', subtitle: 'Filtered list of internship offers' },
    active: { title: 'Active Offers ({{count}})', subtitle: 'Filtered list of internship offers' },
    closed: { title: 'Closed Offers ({{count}})', subtitle: 'Filtered list of internship offers' },
    draft: { title: 'Draft Offers ({{count}})', subtitle: 'Filtered list of internship offers' },
    expired: { title: 'Expired Offers ({{count}})', subtitle: 'Filtered list of internship offers' },
    withApplications: { title: 'Offers with Applications ({{count}})', subtitle: 'Filtered list of internship offers' },
  },
  encadrants: {
    all: { title: 'All Encadrants ({{count}})', subtitle: 'Detailed view of supervisors' },
    assigned: { title: 'Encadrants by Assigned Students ({{count}})', subtitle: 'Detailed view of supervisors' },
    reports: { title: 'Reports in Progress ({{count}})', subtitle: 'Detailed view of supervisors' },
    meetings: { title: 'Upcoming Meetings ({{count}})', subtitle: 'Detailed view of supervisors' },
  },
  students: {
    total: { title: 'Total Students ({{count}})', subtitle: 'Complete student registry' },
    active: { title: 'Active Students ({{count}})', subtitle: 'Students with active accounts' },
    withoutInternship: { title: 'Students Without Internship ({{count}})', subtitle: 'Students still seeking placement' },
    withInternship: { title: 'Students With Internship ({{count}})', subtitle: 'Students currently on internship' },
    engagement: { title: 'Engagement Level ({{count}})', subtitle: 'Student engagement metrics' },
  },
  documents: {
    all: { title: 'All Documents ({{count}})', subtitle: 'All document requests' },
    pending: { title: 'Pending Documents ({{count}})', subtitle: 'Awaiting validation' },
    validated: { title: 'Validated Documents ({{count}})', subtitle: 'Approved documents' },
    rejected: { title: 'Rejected Documents ({{count}})', subtitle: 'Rejected document requests' },
    backToDocuments: 'Back to Documents',
  },
  dashboard: {
    allStudents: { title: 'All Students ({{count}})', subtitle: 'Complete student directory' },
    allEncadrants: { title: 'All Encadrants ({{count}})', subtitle: 'Supervisors on the platform' },
    allAdmins: { title: 'All Admins ({{count}})', subtitle: 'Platform administrators and their roles' },
    withoutInternship: { title: 'Students Without Internship ({{count}})', subtitle: 'Students who still need an internship assignment' },
    activeOffers: { title: 'Active Internship Offers ({{count}})', subtitle: 'Published offers currently accepting applications' },
    ongoingApplications: { title: 'Ongoing Applications ({{count}})', subtitle: 'Applications currently in progress' },
    documentsPending: { title: 'Documents Pending Validation ({{count}})', subtitle: 'Documents awaiting admin approval' },
    unpaidSrf: { title: 'Students Unpaid SRF ({{count}})', subtitle: 'Students with outstanding SRF payments' },
  },
  administrators: {
    filteredList: 'Filtered list of admin users',
    all: { title: 'All Administrators ({{count}})', subtitle: 'Filtered list of admin users' },
  },
};

const modulesEn = {
  students: { title: 'Students', subtitle: 'Manage student profiles and internship status' },
  encadrants: { title: 'Supervisors', subtitle: 'Manage supervisors and their assigned students' },
  offers: { title: 'Internship offers', subtitle: 'Manage all internship opportunities' },
  announcements: { title: 'Announcements', subtitle: 'Manage platform announcements and notifications' },
  srf: { title: 'SRF', subtitle: 'Track and manage student payment status' },
  history: { title: 'History', subtitle: 'Complete history of all platform actions' },
  administrators: { title: 'Administrators', subtitle: 'Manage admin users and their permissions' },
  administratorsFiltered: { subtitle: 'Filtered list of admin users' },
};

const tablesEn = {
  columns: {
    studentName: 'Student Name',
    class: 'Class',
    amountDue: 'Amount Due',
    amountPaid: 'Amount Paid',
    remaining: 'Remaining',
    status: 'Status',
    actions: 'Actions',
    allClasses: 'All classes',
    filterByClass: 'Filter by class',
    noStudentsMatch: 'No students match your search.',
  },
  filter: {
    allTypes: 'All types',
    allCompanies: 'All companies',
    allRoles: 'All roles',
    filterByType: 'Filter by type',
    filterByCompany: 'Filter by company',
    filterByRole: 'Filter by role',
  },
};

function emitLocale(lang, chartsObj, pages) {
  const modules =
    lang === 'en' ? modulesEn : lang === 'fr' ? walkTranslate(modulesEn, translateFr) : walkTranslate(modulesEn, translateAr);
  const tables =
    lang === 'en' ? tablesEn : lang === 'fr' ? walkTranslate(tablesEn, translateFr) : walkTranslate(tablesEn, translateAr);

  function walkTranslate(obj, tr) {
    if (typeof obj === 'string') return tr(obj);
    const out = {};
    for (const [k, v] of Object.entries(obj)) out[k] = walkTranslate(v, tr);
    return out;
  }

  return `/** Auto-generated admin copy — ${lang} */
export const adminCopy${lang.charAt(0).toUpperCase() + lang.slice(1)} = ${JSON.stringify(
    {
      back: {
        dashboard: lang === 'en' ? 'Back to Dashboard' : lang === 'fr' ? 'Retour au tableau de bord' : 'العودة إلى لوحة التحكم',
        announcements: lang === 'en' ? 'Back to Announcements' : lang === 'fr' ? 'Retour aux annonces' : 'العودة إلى الإعلانات',
        offers: lang === 'en' ? 'Back to Offers' : lang === 'fr' ? 'Retour aux offres' : 'العودة إلى العروض',
        encadrants: lang === 'en' ? 'Back to Supervisors' : lang === 'fr' ? 'Retour aux encadrants' : 'العودة إلى المشرفين',
        documents: lang === 'en' ? 'Back to Documents' : lang === 'fr' ? 'Retour aux documents' : 'العودة إلى المستندات',
        students: lang === 'en' ? 'Back to Students' : lang === 'fr' ? 'Retour aux étudiants' : 'العودة إلى الطلاب',
        srf: lang === 'en' ? 'Back to SRF' : lang === 'fr' ? 'Retour au SRF' : 'العودة إلى SRF',
        history: lang === 'en' ? 'Back to History' : lang === 'fr' ? "Retour à l'historique" : 'العودة إلى السجل',
        administrators: lang === 'en' ? 'Back to Administrators' : lang === 'fr' ? 'Retour aux administrateurs' : 'العودة إلى المسؤولين',
      },
      search: {
        admins: lang === 'en' ? 'Search admins...' : lang === 'fr' ? 'Rechercher des admins...' : 'البحث عن المسؤولين...',
        students: lang === 'en' ? 'Search students...' : lang === 'fr' ? 'Rechercher des étudiants...' : 'البحث عن الطلاب...',
        documents: lang === 'en' ? 'Search documents...' : lang === 'fr' ? 'Rechercher des documents...' : 'البحث عن المستندات...',
        documentsOrStudents: lang === 'en' ? 'Search documents or students...' : lang === 'fr' ? 'Rechercher documents ou étudiants...' : 'البحث عن مستندات أو طلاب...',
        offers: lang === 'en' ? 'Search offers...' : lang === 'fr' ? 'Rechercher des offres...' : 'البحث عن العروض...',
        announcements: lang === 'en' ? 'Search announcements...' : lang === 'fr' ? 'Rechercher des annonces...' : 'البحث عن الإعلانات...',
        encadrants: lang === 'en' ? 'Search supervisors...' : lang === 'fr' ? 'Rechercher des encadrants...' : 'البحث عن المشرفين...',
        applications: lang === 'en' ? 'Search applications...' : lang === 'fr' ? 'Rechercher des candidatures...' : 'البحث عن الطلبات...',
        activity: lang === 'en' ? 'Search activity...' : lang === 'fr' ? "Rechercher une activité..." : 'البحث في النشاط...',
        reports: lang === 'en' ? 'Search reports...' : lang === 'fr' ? 'Rechercher des rapports...' : 'البحث عن التقارير...',
      },
      filters: {
        announcements: lang === 'en' ? 'Filtered list of announcements' : lang === 'fr' ? 'Liste filtrée des annonces' : 'قائمة مفلترة للإعلانات',
        offers: lang === 'en' ? 'Filtered list of internship offers' : lang === 'fr' ? 'Liste filtrée des offres de stage' : 'قائمة مفلترة لعروض التدريب',
        admins: lang === 'en' ? 'Filtered list of admin users' : lang === 'fr' ? 'Liste filtrée des administrateurs' : 'قائمة مفلترة للمسؤولين',
        encadrantsDetail: lang === 'en' ? 'Detailed view of supervisors' : lang === 'fr' ? 'Vue détaillée des encadrants' : 'عرض تفصيلي للمشرفين',
      },
      pages,
      modules,
      tables,
      charts: chartsObj,
      kpi: {
        srf: {
          paid: {
            totalPaid: lang === 'en' ? 'Total Paid' : lang === 'fr' ? 'Total payé' : 'إجمالي المدفوع',
            thisMonth: lang === 'en' ? 'This Month' : lang === 'fr' ? 'Ce mois' : 'هذا الشهر',
            totalAmount: lang === 'en' ? 'Total Amount' : lang === 'fr' ? 'Montant total' : 'المبلغ الإجمالي',
            completionRate: lang === 'en' ? 'Completion Rate' : lang === 'fr' ? 'Taux de complétion' : 'معدل الإنجاز',
          },
        },
      },
      empty: {
        noResults: lang === 'en' ? 'No results found' : lang === 'fr' ? 'Aucun résultat' : 'لا توجد نتائج',
        tryAdjusting: lang === 'en' ? 'Try adjusting your search or filters' : lang === 'fr' ? 'Essayez de modifier la recherche ou les filtres' : 'جرّب تعديل البحث أو الفلاتر',
      },
    },
    null,
    2
  )} as const;
`;
}

const outDir = path.join(__dirname, '../src/features/admin/i18n/locales');
fs.mkdirSync(outDir, { recursive: true });
const pagesFr = JSON.parse(JSON.stringify(pagesEn));
const pagesAr = JSON.parse(JSON.stringify(pagesEn));
function walkPages(obj, tr) {
  for (const k of Object.keys(obj)) {
    if (typeof obj[k] === 'string') obj[k] = tr(obj[k]);
    else if (typeof obj[k] === 'object') walkPages(obj[k], tr);
  }
}
walkPages(pagesFr, translateFr);
walkPages(pagesAr, translateAr);
pagesFr.documents.backToDocuments = 'Retour aux documents';
pagesAr.documents.backToDocuments = 'العودة إلى المستندات';

fs.writeFileSync(path.join(outDir, 'admin-copy.en.ts'), emitLocale('en', enCharts, pagesEn));
fs.writeFileSync(path.join(outDir, 'admin-copy.fr.ts'), emitLocale('fr', frCharts, pagesFr));
fs.writeFileSync(path.join(outDir, 'admin-copy.ar.ts'), emitLocale('ar', arCharts, pagesAr));
console.log('Generated', Object.keys(charts).length, 'charts');
