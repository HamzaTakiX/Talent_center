import { FunctionComponent, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  BookMarked,
  FileStack,
  FileText,
  FolderOpen,
  FolderSearch,
  Link2,
  Paperclip,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { REPORTS_HUB_DOCS_SKELETON_ROWS } from '../../constants/limits';
import { studentReportEditorPath } from '../../constants/routes';
import type { HubDocumentItem } from '../../types';
import ReportsHubSkeletonBlock from './ReportsHubSkeletonBlock';
import ReportsWorkspaceModuleHeader from './ReportsWorkspaceModuleHeader';

interface ReportsDocumentsReferencesProps {
  items: HubDocumentItem[];
  reportId: string;
  loading?: boolean;
}

type DocsTab = 'documents' | 'templates';

const TAB_KEYS: DocsTab[] = ['documents', 'templates'];

const tabIconMap: Record<DocsTab, typeof FolderOpen> = {
  documents: FolderOpen,
  templates: FileStack,
};

const typeIconMap = {
  reference: BookMarked,
  attachment: Paperclip,
  template: FileText,
  bibliography: Link2,
};

function filterByTab(items: HubDocumentItem[], tab: DocsTab): HubDocumentItem[] {
  if (tab === 'documents') return items.filter((i) => i.type === 'attachment' || i.type === 'bibliography');
  return items.filter((i) => i.type === 'template');
}

function splitMeta(meta: string): { kind: string; detail: string } {
  const idx = meta.indexOf(',');
  if (idx === -1) return { kind: meta, detail: '' };
  return { kind: meta.slice(0, idx).trim(), detail: meta.slice(idx + 1).trim() };
}

const ReportsDocumentsReferences: FunctionComponent<ReportsDocumentsReferencesProps> = ({
  items,
  reportId,
  loading = false,
}) => {
  const { t } = useTranslation();
  const loadingLabel = t('student.reports.hub.loading', { defaultValue: 'Chargement…' });
  const [tab, setTab] = useState<DocsTab>('documents');

  const filtered = useMemo(() => filterByTab(items, tab), [items, tab]);
  const counts = useMemo(
    () => ({
      documents: filterByTab(items, 'documents').length,
      templates: filterByTab(items, 'templates').length,
    }),
    [items],
  );

  return (
    <section className="sr-hub-card sr-hub-docs-panel" aria-busy={loading || undefined}>
      <ReportsWorkspaceModuleHeader
        icon={<FolderOpen className="h-5 w-5" />}
        title={t('student.reports.hub.docsTitle')}
        subtitle={t('student.reports.hub.docsModuleSubtitle')}
      />

      <div className="sr-hub-docs-panel__tabs" role="tablist" aria-label={t('student.reports.hub.docsTitle')}>
        {TAB_KEYS.map((key) => {
          const TabIcon = tabIconMap[key];
          const isActive = tab === key;
          return (
            <button
              key={key}
              type="button"
              role="tab"
              id={`sr-hub-docs-tab-${key}`}
              aria-selected={isActive}
              aria-controls="sr-hub-docs-panel-tab"
              className={`sr-hub-docs-panel__tab ${isActive ? 'is-active' : ''}`}
              onClick={() => setTab(key)}
              disabled={loading}
            >
              <TabIcon className="sr-hub-docs-panel__tab-icon" aria-hidden />
              <span className="sr-hub-docs-panel__tab-label">{t(`student.reports.hub.docsTabs.${key}`)}</span>
              {loading ? (
                <ReportsHubSkeletonBlock className="h-4 w-5 rounded-full" />
              ) : (
                <span className="sr-hub-docs-panel__tab-count">{counts[key]}</span>
              )}
            </button>
          );
        })}
      </div>

      {loading ? (
        <ul className="sr-hub-docs__list" role="status" aria-label={loadingLabel}>
          {Array.from({ length: REPORTS_HUB_DOCS_SKELETON_ROWS }, (_, i) => (
            <li key={i} className="sr-hub-docs__row" aria-hidden>
              <div className="sr-hub-docs__item">
                <ReportsHubSkeletonBlock className="h-[2.15rem] w-[2.15rem] shrink-0 rounded-lg" />
                <div className="sr-hub-docs__body min-w-0 flex-1">
                  <ReportsHubSkeletonBlock className="h-3.5 w-[70%]" />
                  <ReportsHubSkeletonBlock className="mt-1.5 h-3 w-24" />
                </div>
                <ReportsHubSkeletonBlock className="h-3 w-12 shrink-0" />
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <AnimatePresence mode="wait">
        <motion.ul
          key={tab}
          id="sr-hub-docs-panel-tab"
          role="tabpanel"
          aria-labelledby={`sr-hub-docs-tab-${tab}`}
          className="sr-hub-docs__list"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.2 }}
        >
          {filtered.length === 0 ? (
            <li className="sr-hub-docs__empty">
              <span className="sr-hub-docs__empty-icon" aria-hidden>
                <FolderSearch className="h-5 w-5" />
              </span>
              <span className="sr-hub-docs__empty-title">{t('student.reports.hub.docsEmpty')}</span>
              <span className="sr-hub-docs__empty-hint">{t('student.reports.hub.docsEmptyHint')}</span>
            </li>
          ) : (
            filtered.map((doc, i) => {
              const Icon = typeIconMap[doc.type];
              const { kind, detail } = splitMeta(doc.meta);
              return (
                <motion.li
                  key={doc.id}
                  className="sr-hub-docs__row"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.04 * i }}
                >
                  <Link to={studentReportEditorPath(reportId)} className="sr-hub-docs__item">
                    <div className={`sr-hub-docs__icon sr-hub-docs__icon--${doc.type}`}>
                      <Icon className="h-4 w-4" aria-hidden />
                    </div>
                    <div className="sr-hub-docs__body">
                      <span className="sr-hub-docs__name">{doc.name}</span>
                      <span className="sr-hub-docs__meta-row">
                        {kind && (
                          <span className={`sr-hub-docs__kind sr-hub-docs__kind--${doc.type}`}>{kind}</span>
                        )}
                        {detail && <span className="sr-hub-docs__meta">{detail}</span>}
                      </span>
                    </div>
                    <div className="sr-hub-docs__aside">
                      <time className="sr-hub-docs__date" dateTime={doc.updatedAt}>
                        {new Date(doc.updatedAt).toLocaleDateString(undefined, {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </time>
                      <ArrowRight className="sr-hub-docs__chevron h-3.5 w-3.5" aria-hidden />
                    </div>
                  </Link>
                </motion.li>
              );
            })
          )}
        </motion.ul>
        </AnimatePresence>
      )}
    </section>
  );
};

export default ReportsDocumentsReferences;
