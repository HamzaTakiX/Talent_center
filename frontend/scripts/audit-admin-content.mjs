/**
 * Super Admin content audit — replace AI-sounding / robotic copy with natural admin wording.
 * Run: node scripts/audit-admin-content.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOCALES_DIR = path.join(__dirname, '../src/features/admin/i18n/locales');

/** Global replacements applied to all admin locale files */
const GLOBAL_REPLACEMENTS = [
  ['/** Auto-generated admin copy — ', '/** Admin copy — '],
];

const FILE_REPLACEMENTS = {
  'admin-copy.en.ts': [
    ['Cannot reach the API — showing demo data.', 'Cannot reach the API. Showing demo data.'],
    ['API connected — no threads for module', 'API connected. No threads for module'],
    ['No contextual threads yet — create one', 'No contextual threads yet. Create one'],
    ['Smart assignment only matches students whose internship type is selected here.', 'Assignment only matches students whose internship type is selected here.'],
    ['Duplicate detected — view the existing offer or continue anyway', 'Duplicate detected. View the existing offer or continue anyway.'],
    ['Automatic extraction', 'Field extraction from URL'],
    ['Predicted applications', 'Estimated applications'],
    ['Smart Insights', 'Key observations'],
    ['Smart insights', 'Key observations'],
    ['Draft generated — edit before publishing', 'Review this draft before publishing.'],
    ['Paste an external offer link to automatically extract information.', 'Paste an external offer link to extract offer details.'],
    ['Analyze Offer', 'Extract from URL'],
    ['Re-analyze', 'Re-extract'],
    ['Change the URL and click Re-analyze, or use Other URL to start fresh with a new offer.', 'Change the URL and click Re-extract, or use Other URL to start fresh with a new offer.'],
    ['Could not analyze this URL', 'Could not extract data from this URL'],
    ['Analyzing page…', 'Reading page…'],
    ['Financial intelligence', 'Financial overview'],
    ['Risk intelligence', 'Risk overview'],
    ['Tension signals detected — enhanced follow-up recommended.', 'Payment delays detected. Enhanced follow-up is recommended.'],
    ['Stable financial profile — standard monitoring.', 'Stable financial profile. Standard monitoring applies.'],
    ['Elevated financial risk — prioritize administrative action.', 'Elevated financial risk. Prioritize administrative action.'],
    ['{{count}} overdue installment(s) — blocking risk.', '{{count}} overdue installment(s). Blocking risk applies.'],
    ['Financial situation cleared — academic access open.', 'Financial situation cleared. Academic access is open.'],
    ['Financial and academic operations control center — exam periods, automated warnings, and restrictions.', 'Financial and academic operations. Configure exam periods, reminders, and restrictions.'],
    ['No tiers configured — defaults will be seeded.', 'No tiers configured. Default values will be applied.'],
    ['Audit & activity center — operational timeline, traceability and accountability', 'Audit and activity log. Operational timeline, traceability, and accountability.'],
    ['Reports submitted by supervisors for their students — admin intake and validation', 'Reports submitted by supervisors for their students. Admin intake and validation.'],
    ['Academic agenda — monitor supervisor / student meetings', 'Academic agenda. Monitor supervisor and student meetings.'],
    ['Active pipeline', 'In progress'],
    ['Supervision metrics look healthy — no alerts right now.', 'Supervision metrics are within normal range. No alerts at this time.'],
    ['No upcoming meetings scheduled — review the agenda', 'No upcoming meetings scheduled. Review the agenda.'],
    ['Operational intelligence', 'Operational overview'],
    ['Platform activity, critical signals and automation footprint', 'Platform activity, critical events, and automated actions'],
    ['Module intelligence', 'Module overview'],
    ['Activity, critical signals and automation for this module only', 'Activity, critical events, and automated actions for this module only'],
    ['Smart assignment', 'Supervisor assignment'],
    ['Smart Assignment', 'Supervisor Assignment'],
    ['{{module}} generated {{count}} events today.', '{{module}} recorded {{count}} events today.'],
    ['{{recent}} events in 24h vs {{previous}} previously — review workload.', '{{recent}} events in 24h vs {{previous}} previously. Review workload.'],
    ['Smart assignment audit trail', 'Supervisor assignment audit trail'],
    ['ESCA-aware analysis and intelligent student distribution across supervisors', 'Assign students to supervisors based on program, level, sector, and workload.'],
    ['Run engine', 'Run assignment'],
    ['Excluded from engine', 'Excluded from assignment'],
    ['Assignment engine failed.', 'Assignment run failed.'],
    ['Running assignment engine…', 'Running assignment…'],
    ['Generating preview…', 'Preparing preview…'],
    ['Re-run the engine for all eligible students, including those already assigned.', 'Re-run assignment for all eligible students, including those already assigned.'],
    ['Smart re-run (unassigned only)', 'Re-run for unassigned students only'],
    ['Choose whether to overwrite, skip, or smart re-run existing assignments.', 'Choose whether to overwrite, skip, or re-run for unassigned students only.'],
    ['Assignment blocked — fix critical issues before running.', 'Assignment blocked. Fix critical issues before running.'],
    ['{{type}} — {{count}} student(s)', '{{type}}: {{count}} student(s)'],
    ['Programs, classes, levels and years — linked dynamically based on your selections.', 'Programs, classes, levels, and years are linked based on your selections.'],
    ['Program, levels, academic years, expertise domains, and ESCA sectors — each step unlocks the next.', 'Program, levels, academic years, expertise domains, and ESCA sectors. Each step unlocks the next.'],
    ['Multiple types possible — specify specialization', 'Multiple types possible. Specify the specialization.'],
    ['Program, level, specialization, internship type, year and class — loaded from ESCA reference data.', 'Program, level, specialization, internship type, year, and class are loaded from ESCA reference data.'],
    ['Document preview — connect the API to show the actual file.', 'Document preview. Connect the API to show the actual file.'],
    ['No online payments — institutional data only', 'No online payments. Institutional data only.'],
    ['CSV · XLSX · JSON — max 25 MB', 'CSV, XLSX, or JSON. Max 25 MB.'],
    ['Previous imports on the platform — rollback when available', 'Previous imports on the platform. Rollback when available.'],
    ['Import in progress — cannot delete', 'Import in progress. Cannot delete.'],
    ['Installment 1 — amount', 'Installment 1: amount'],
    ['Installment 1 — status', 'Installment 1: status'],
    ['Installment 1 — due date', 'Installment 1: due date'],
    ['Installment 2 — amount', 'Installment 2: amount'],
    ['Installment 2 — status', 'Installment 2: status'],
    ['Installment 2 — due date', 'Installment 2: due date'],
    ['Installment 3 — amount', 'Installment 3: amount'],
    ['Installment 3 — status', 'Installment 3: status'],
    ['Installment 3 — due date', 'Installment 3: due date'],
    ['Installment 4 — amount', 'Installment 4: amount'],
    ['Installment 4 — status', 'Installment 4: status'],
    ['Installment 4 — due date', 'Installment 4: due date'],
    ['No accounts restored — no backup snapshot for this batch. Fix data manually in SRF.', 'No accounts restored. No backup snapshot for this batch. Fix data manually in SRF.'],
    ['Installment {{n}} — {{status}}', 'Installment {{n}}: {{status}}'],
    ['Audit indicators — {{module}}', 'Audit indicators for {{module}}'],
    ['— Select a program —', 'Select a program'],
    ['— Select a level —', 'Select a level'],
    ['— Select a program first —', 'Select a program first'],
    ['— Select a specialization —', 'Select a specialization'],
    ['— Select an internship type —', 'Select an internship type'],
    ['— Select a level first —', 'Select a level first'],
    ['— Select academic year —', 'Select academic year'],
    ['— Select a class —', 'Select a class'],
    ['— Select a field —', 'Select a field'],
    ['— Select a field first —', 'Select a field first'],
  ],
  'admin-copy.fr.ts': [
    ['Connexion API impossible — affichage des données de démonstration.', 'Connexion API impossible. Affichage des données de démonstration.'],
    ['API connectée — aucun fil', 'API connectée. Aucun fil'],
    ['Aucun fil contextuel — créez une conversation', 'Aucun fil contextuel. Créez une conversation'],
    ["L'affectation intelligente n'assignera que des étudiants dont le type de stage correspond.", "L'affectation n'assignera que des étudiants dont le type de stage correspond."],
    ['Doublon détecté — consultez l\'offre existante ou continuez quand même', 'Doublon détecté. Consultez l\'offre existante ou continuez quand même.'],
    ['Extraction automatique', 'Extraction des champs depuis l\'URL'],
    ['Candidatures prévues', 'Candidatures estimées'],
    ['Recommandations intelligentes', 'Observations clés'],
    ['Analyses intelligentes', 'Observations clés'],
    ['Insights intelligents', 'Observations clés'],
    ['Brouillon généré — modifiez avant publication', 'Relisez ce brouillon avant publication.'],
    ['Analyser l\'offre', 'Extraire depuis l\'URL'],
    ['Ré-analyser', 'Ré-extraire'],
    ['Intelligence financière', 'Aperçu financier'],
    ['Intelligence des risques', 'Aperçu des risques'],
    ['Signaux de tension détectés — suivi renforcé recommandé.', 'Retards de paiement détectés. Un suivi renforcé est recommandé.'],
    ['Profil financier stable — surveillance standard.', 'Profil financier stable. Surveillance standard.'],
    ['Risque financier élevé — action administrative prioritaire.', 'Risque financier élevé. Action administrative prioritaire.'],
    ['Situation financière régularisée — accès académiques ouverts.', 'Situation financière régularisée. Accès académiques ouverts.'],
    ['Centre de pilotage financier et académique — périodes d\'examen', 'Opérations financières et académiques. Configurez les périodes d\'examen'],
    ['Aucun palier configuré — des valeurs par défaut seront proposées.', 'Aucun palier configuré. Des valeurs par défaut seront proposées.'],
    ['Centre d\'audit et d\'activité — chronologie opérationnelle', 'Journal d\'audit et d\'activité. Chronologie opérationnelle'],
    ['Rapports soumis par les encadrants pour leurs étudiants — réception et validation admin', 'Rapports soumis par les encadrants pour leurs étudiants. Réception et validation admin.'],
    ['Agenda académique — suivi des rencontres encadrant / étudiant', 'Agenda académique. Suivi des rencontres encadrant et étudiant.'],
    ['Pipeline actif', 'En cours'],
    ['Les indicateurs de supervision sont sains — aucune alerte.', 'Les indicateurs de supervision sont dans les normes. Aucune alerte.'],
    ['Aucune réunion à venir — consultez l\'agenda', 'Aucune réunion à venir. Consultez l\'agenda.'],
    ['Intelligence opérationnelle', 'Aperçu opérationnel'],
    ['Intelligence module', 'Aperçu du module'],
    ['Affectation intelligente', 'Affectation des encadrants'],
    ['Historique Smart Assignment', 'Historique des affectations'],
    ['Réexécution intelligente (non affectés uniquement)', 'Réexécution pour les non affectés uniquement'],
    ['— Sélectionner un programme —', 'Sélectionner un programme'],
    ['— Sélectionner un niveau —', 'Sélectionner un niveau'],
    ['— Choisir un programme d\'abord —', 'Choisir un programme d\'abord'],
    ['— Sélectionner une spécialisation —', 'Sélectionner une spécialisation'],
    ['— Sélectionner un type de stage —', 'Sélectionner un type de stage'],
    ['— Choisir un niveau d\'abord —', 'Choisir un niveau d\'abord'],
    ['— Sélectionner l\'année académique —', 'Sélectionner l\'année académique'],
    ['— Sélectionner une classe —', 'Sélectionner une classe'],
    ['— Sélectionner une filière —', 'Sélectionner une filière'],
    ['— Choisir une filière d\'abord —', 'Choisir une filière d\'abord'],
    ['Lancer le moteur', 'Lancer l\'affectation'],
    ['Affectation bloquée — corrigez', 'Affectation bloquée. Corrigez'],
  ],
  'announcements-module.en.ts': [
    ['Communication intelligence', 'Communications'],
    ['Live pipeline', 'Recent activity'],
    ['Intelligent communication & internship opportunities platform', 'Manage announcements and internship opportunities'],
    ['Smart recommendations will appear as students interact with your content.', 'Recommendations will appear as students interact with your content.'],
    ['Smart signals from the recommendation engine', 'Observations based on student engagement'],
    ['Engagement Intelligence', 'Engagement analytics'],
    ['Enterprise analytics for communication performance, recommendations, and audience behavior', 'Views, engagement, and audience behavior for your announcements'],
    ['Intelligence center', 'Analytics center'],
    ['Building engagement intelligence', 'No engagement data yet'],
    ['Publish announcements and let students interact — analytics will populate in real time.', 'Publish announcements and let students interact. Analytics will update as activity occurs.'],
    ['LME segment engagement shifted this week — review targeting', 'LME segment engagement shifted this week. Review targeting.'],
    ['Recommendation insights', 'Engagement observations'],
  ],
  'announcements-module.fr.ts': [
    ['Intelligence communication', 'Communications'],
    ['Pipeline actif', 'Activité récente'],
    ['Plateforme de communication intelligente et d\'opportunités de stage', 'Gérer les annonces et les opportunités de stage'],
    ['Les recommandations intelligentes apparaîtront', 'Les recommandations apparaîtront'],
    ['Intelligence d\'engagement', 'Analytique d\'engagement'],
    ['Centre d\'intelligence', 'Centre d\'analytique'],
    ['Construction de l\'intelligence engagement', 'Aucune donnée d\'engagement pour le moment'],
    ['Recommandations et insights', 'Observations d\'engagement'],
    ['Signaux intelligents du moteur de recommandation', 'Observations basées sur l\'engagement des étudiants'],
    ['L\'engagement segment LME a varié cette semaine — revoir le ciblage', 'L\'engagement segment LME a varié cette semaine. Revoir le ciblage.'],
  ],
  'admin-copy.ar.ts': [
    ['/** Auto-generated admin copy — ar */', '/** Admin copy — ar */'],
    ['تعذّر الاتصال بالـ API — عرض بيانات تجريبية', 'تعذّر الاتصال بالـ API. عرض بيانات تجريبية'],
    ['API متصل — لا محادثات', 'API متصل. لا محادثات'],
    ['لا محادثات سياقية بعد — أنشئ', 'لا محادثات سياقية بعد. أنشئ'],
    ['مسودة جاهزة — عدّل قبل النشر', 'راجع هذه المسودة قبل النشر.'],
    ['الذكاء المالي', 'نظرة مالية'],
    ['ذكاء المخاطر', 'نظرة على المخاطر'],
    ['تحليلات ذكية', 'ملاحظات رئيسية'],
    ['رؤى ذكية', 'ملاحظات رئيسية'],
    ['التعيين الذكي', 'تعيين المشرفين'],
    ['الخط النشط', 'قيد التنفيذ'],
    ['— اختر البرنامج —', 'اختر البرنامج'],
    ['— اختر المستوى —', 'اختر المستوى'],
    ['— اختر البرنامج أولاً —', 'اختر البرنامج أولاً'],
    ['— اختر التخصص —', 'اختر التخصص'],
    ['— اختر نوع التدريب —', 'اختر نوع التدريب'],
    ['— اختر المستوى أولاً —', 'اختر المستوى أولاً'],
    ['— اختر السنة الأكاديمية —', 'اختر السنة الأكاديمية'],
    ['— اختر القسم —', 'اختر القسم'],
    ['— اختر شعبة —', 'اختر شعبة'],
    ['— اختر شعبة أولاً —', 'اختر شعبة أولاً'],
  ],
  'announcements-module.ar.ts': [
    ['ذكاء التواصل', 'الاتصالات'],
    ['الخط النشط', 'النشاط الأخير'],
    ['منصة تواصل ذكية وفرص تدريب', 'إدارة الإعلانات وفرص التدريب'],
    ['ذكاء التفاعل', 'تحليلات التفاعل'],
    ['مركز الذكاء', 'مركز التحليلات'],
  ],
  'documents-module.ar.ts': [
    ['الذكاء الإداري', 'خدمات الوثائق'],
    ['مسار الخدمات المباشر', 'الطلبات الأخيرة'],
    ['مُولّد تلقائياً (أسبوع)', 'مُنتَج هذا الأسبوع'],
    ['رؤى ذكية', 'ملاحظات رئيسية'],
    ['تعيين ذكي', 'تعيين المواعيد'],
  ],
  'documents-module.en.ts': [
    ['Administrative intelligence', 'Document services'],
    ['Live service pipeline', 'Recent requests'],
    ['Intelligent service orchestration, workflows & reservations', 'Manage document requests, workflows, and reservations'],
    ['Auto-generated (week)', 'Produced this week'],
    ['Generated documents', 'Produced documents'],
    ['Smart insights', 'Key observations'],
    ['No generated documents yet', 'No documents produced yet'],
    ['Intelligent slot allocation, guichets & signature appointments', 'Schedule pickup slots and signature appointments'],
    ['Smart assignment', 'Assign slots'],
    ['Auto-generated', 'System-produced'],
    ['Documents can be generated automatically when validated.', 'Documents are produced automatically when validated.'],
    ['Automatic document generation', 'Automatic document production'],
    ['Add guichets, offices and meeting rooms for the reservation engine.', 'Add guichets, offices, and meeting rooms for reservations.'],
    ['Enterprise service configuration — multi-school ready', 'Service configuration for multiple schools'],
    ['Enterprise blue', 'Standard blue'],
    ['Scolarité service is at 75% capacity — consider redistribution.', 'Scolarité service is at 75% capacity. Consider redistribution.'],
  ],
  'documents-module.fr.ts': [
    ['Intelligence administrative', 'Services documentaires'],
    ['Pipeline services en direct', 'Demandes récentes'],
    ['Orchestration intelligente des services, workflows et réservations', 'Gérer les demandes documentaires, workflows et réservations'],
    ['Auto-générés (semaine)', 'Produits cette semaine'],
    ['Insights intelligents', 'Observations clés'],
    ['Allocation intelligente des créneaux, guichets et signatures', 'Planifier les créneaux de retrait et les rendez-vous de signature'],
    ['Affectation intelligente', 'Attribuer les créneaux'],
    ['Configuration enterprise — multi-établissement', 'Configuration des services multi-établissement'],
    ['Bleu enterprise', 'Bleu standard'],
  ],
};

function applyReplacements(content, replacements) {
  let result = content;
  let count = 0;
  for (const [from, to] of replacements) {
    const parts = result.split(from);
    if (parts.length > 1) {
      count += parts.length - 1;
      result = parts.join(to);
    }
  }
  return { result, count };
}

let totalChanges = 0;
const report = [];

for (const [filename, replacements] of Object.entries(FILE_REPLACEMENTS)) {
  const filepath = path.join(LOCALES_DIR, filename);
  if (!fs.existsSync(filepath)) {
    console.warn('Skip (missing):', filename);
    continue;
  }
  let content = fs.readFileSync(filepath, 'utf8');
  for (const [pattern, replacement] of GLOBAL_REPLACEMENTS) {
    content = content.replace(pattern, replacement);
  }
  const { result, count } = applyReplacements(content, replacements);
  if (count > 0) {
    fs.writeFileSync(filepath, result, 'utf8');
    totalChanges += count;
    report.push({ file: filename, changes: count });
    console.log(`✓ ${filename}: ${count} replacement(s)`);
  } else {
    console.log(`· ${filename}: no changes`);
  }
}

console.log(`\nTotal: ${totalChanges} replacements across ${report.length} files`);
report.forEach((r) => console.log(`  ${r.file}: ${r.changes}`));
