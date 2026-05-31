import { FunctionComponent, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  BookMarked,
  FileText,
  FolderOpen,
  Link2,
  Paperclip,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { studentReportEditorPath } from '../../constants/routes';
import type { HubDocumentItem } from '../../types';
import ReportsWorkspaceModuleHeader from './ReportsWorkspaceModuleHeader';

interface ReportsDocumentsReferencesProps {
  items: HubDocumentItem[];
  reportId: string;
}

type DocsTab = 'documents' | 'references' | 'templates';

const TAB_KEYS: DocsTab[] = ['documents', 'references', 'templates'];

const typeIconMap = {
  reference: BookMarked,
  attachment: Paperclip,
  template: FileText,
  bibliography: Link2,
};

function filterByTab(items: HubDocumentItem[], tab: DocsTab): HubDocumentItem[] {
  if (tab === 'documents') return items.filter((i) => i.type === 'attachment' || i.type === 'bibliography');
  if (tab === 'references') return items.filter((i) => i.type === 'reference');
  return items.filter((i) => i.type === 'template');
}

const ReportsDocumentsReferences: FunctionComponent<ReportsDocumentsReferencesProps> = ({
  items,
  reportId,
}) => {
  const { t } = useTranslation();
  const [tab, setTab] = useState<DocsTab>('documents');

  const filtered = useMemo(() => filterByTab(items, tab), [items, tab]);
  const counts = useMemo(
    () => ({
      documents: filterByTab(items, 'documents').length,
      references: filterByTab(items, 'references').length,
      templates: filterByTab(items, 'templates').length,
    }),
    [items],
  );

  return (
    <section className="sr-hub-card sr-hub-docs-panel">
      <ReportsWorkspaceModuleHeader
        icon={<FolderOpen className="h-5 w-5" />}
        title={t('student.reports.hub.docsTitle')}
        subtitle={t('student.reports.hub.docsModuleSubtitle')}
      />

      <div className="sr-hub-docs-panel__tabs" role="tablist">
        {TAB_KEYS.map((key) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={tab === key}
            className={`sr-hub-docs-panel__tab ${tab === key ? 'is-active' : ''}`}
            onClick={() => setTab(key)}
          >
            {t(`student.reports.hub.docsTabs.${key}`)}
            <span className="sr-hub-docs-panel__tab-count">{counts[key]}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.ul
          key={tab}
          className="sr-hub-docs__list"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.2 }}
        >
          {filtered.length === 0 ? (
            <li className="sr-hub-docs__empty">{t('student.reports.hub.docsEmpty')}</li>
          ) : (
            filtered.map((doc, i) => {
              const Icon = typeIconMap[doc.type];
              return (
                <motion.li
                  key={doc.id}
                  initial={{ opacity: 0, x: -4 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.03 * i }}
                >
                  <Link to={studentReportEditorPath(reportId)} className="sr-hub-docs__item">
                    <div className={`sr-hub-docs__icon sr-hub-docs__icon--${doc.type}`}>
                      <Icon className="h-3.5 w-3.5" aria-hidden />
                    </div>
                    <div className="sr-hub-docs__body">
                      <span className="sr-hub-docs__name">{doc.name}</span>
                      <span className="sr-hub-docs__meta">{doc.meta}</span>
                    </div>
                    <span className="sr-hub-docs__date">
                      {new Date(doc.updatedAt).toLocaleDateString(undefined, {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </span>
                  </Link>
                </motion.li>
              );
            })
          )}
        </motion.ul>
      </AnimatePresence>

      <Link to={studentReportEditorPath(reportId)} className="sr-hub-card__footer-link">
        {t('student.reports.hub.manageReferences')}
        <ArrowRight className="h-3.5 w-3.5" aria-hidden />
      </Link>
    </section>
  );
};

export default ReportsDocumentsReferences;
