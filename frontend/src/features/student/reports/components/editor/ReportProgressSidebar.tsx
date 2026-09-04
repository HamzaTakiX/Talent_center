import { FunctionComponent, useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  Circle,
  CircleDot,
  Pencil,
  Plus,
  Settings2,
  Trash2,
  X,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { loadReportOutline, saveReportOutline } from '../../data/reportOutlineStorage';
import type { ReportModelGuide, ReportModelSectionProgress } from '../../types/reportModelGuide';
import type { ReportOutlineItem } from '../../types/reportOutline';
import { calculateOutlineProgress } from '../../utils/reportModelProgress';
import {
  addOutlineItem,
  outlineFromModelSections,
  parseTocText,
  removeOutlineItem,
  renameOutlineItem,
} from '../../utils/reportOutline';

interface ReportProgressSidebarProps {
  reportId: string;
  model: ReportModelGuide | null;
  studentHtml: string;
  pageCount?: number;
  selectedSectionId?: string | null;
  onSelectSection?: (section: { id: string; title: string; level: 1 | 2 | 3 }) => void;
  onOutlineChange?: (items: ReportOutlineItem[]) => void;
  collapsed?: boolean;
}

function StatusIcon({ status }: { status: ReportModelSectionProgress['status'] }) {
  if (status === 'completed') {
    return <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-400" aria-hidden />;
  }
  if (status === 'in_progress') {
    return <CircleDot className="h-3.5 w-3.5 shrink-0 text-[var(--admin-brand)]" aria-hidden />;
  }
  return <Circle className="h-3.5 w-3.5 shrink-0 text-[var(--admin-text-muted)]" aria-hidden />;
}

function resolveInitialOutline(
  reportId: string,
  model: ReportModelGuide | null,
): ReportOutlineItem[] {
  const stored = loadReportOutline(reportId);
  if (stored?.length) return stored;
  if (model?.sections?.length) return outlineFromModelSections(model.sections);
  return [];
}

const ReportProgressSidebar: FunctionComponent<ReportProgressSidebarProps> = ({
  reportId,
  model,
  studentHtml,
  pageCount = 1,
  selectedSectionId = null,
  onSelectSection,
  onOutlineChange,
  collapsed = false,
}) => {
  const { t } = useTranslation();
  const [outline, setOutline] = useState<ReportOutlineItem[]>(() =>
    resolveInitialOutline(reportId, model),
  );
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [importText, setImportText] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftTitle, setDraftTitle] = useState('');

  useEffect(() => {
    const next = resolveInitialOutline(reportId, model);
    setOutline(next);
    onOutlineChange?.(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- seed only when report/model identity changes
  }, [reportId, model?.id]);

  const persistOutline = (next: ReportOutlineItem[]) => {
    setOutline(next);
    saveReportOutline(reportId, next);
    onOutlineChange?.(next);
  };

  const progress = useMemo(
    () => calculateOutlineProgress(outline, studentHtml),
    [outline, studentHtml],
  );

  if (collapsed) return null;

  const maxPages = model?.maxPages ?? 0;
  const pagesOverLimit = maxPages > 0 && pageCount > maxPages;
  const pagesNearLimit = maxPages > 0 && !pagesOverLimit && pageCount >= Math.ceil(maxPages * 0.9);

  const statusLabel = (status: ReportModelSectionProgress['status']) => {
    if (status === 'completed') return t('student.reports.modelGuide.statusCompleted');
    if (status === 'in_progress') return t('student.reports.modelGuide.statusInProgress');
    return t('student.reports.modelGuide.statusNotStarted');
  };

  const findItem = (id: string) => outline.find((item) => item.id === id);

  const startRename = (id: string) => {
    const item = findItem(id);
    if (!item) return;
    setEditingId(id);
    setDraftTitle(item.title);
  };

  const commitRename = () => {
    if (!editingId) return;
    persistOutline(renameOutlineItem(outline, editingId, draftTitle));
    setEditingId(null);
    setDraftTitle('');
  };

  const handleImport = () => {
    const parsed = parseTocText(importText);
    if (parsed.length === 0) return;
    persistOutline(parsed);
    setImportText('');
    setImportOpen(false);
    setSettingsOpen(false);
  };

  const handleResetFromModel = () => {
    if (!model?.sections?.length) return;
    persistOutline(outlineFromModelSections(model.sections));
    setSettingsOpen(false);
  };

  const renderTree = (nodes: ReportModelSectionProgress[], depth = 0) =>
    nodes.map((node) => {
      const item = findItem(node.sectionId);
      const isEditing = settingsOpen && editingId === node.sectionId;

      return (
        <div key={node.sectionId}>
          <div
            className={`student-report-progress-nav__item ${
              selectedSectionId === node.sectionId || progress.currentSectionId === node.sectionId
                ? 'is-active'
                : ''
            } ${settingsOpen ? 'is-editing' : ''}`}
            style={{ paddingInlineStart: `${0.5 + Math.min(depth, 2) * 0.55}rem` }}
          >
            <StatusIcon status={node.status} />
            {isEditing ? (
              <input
                className="student-report-progress-nav__edit"
                value={draftTitle}
                autoFocus
                onChange={(e) => setDraftTitle(e.target.value)}
                onBlur={commitRename}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') commitRename();
                  if (e.key === 'Escape') {
                    setEditingId(null);
                    setDraftTitle('');
                  }
                }}
                aria-label={t('student.reports.modelGuide.renameSection')}
              />
            ) : (
              <button
                type="button"
                className="student-report-progress-nav__title-btn"
                onClick={() => {
                  if (settingsOpen) {
                    startRename(node.sectionId);
                    return;
                  }
                  onSelectSection?.({
                    id: node.sectionId,
                    title: node.title,
                    level: node.level,
                  });
                }}
                title={settingsOpen ? t('student.reports.modelGuide.renameSection') : statusLabel(node.status)}
              >
                <span className="student-report-progress-nav__title">{node.title}</span>
              </button>
            )}

            {settingsOpen ? (
              <div className="student-report-progress-nav__actions">
                <button
                  type="button"
                  className="student-report-progress-nav__icon-btn"
                  onClick={() => startRename(node.sectionId)}
                  title={t('student.reports.modelGuide.renameSection')}
                  aria-label={t('student.reports.modelGuide.renameSection')}
                >
                  <Pencil className="h-3 w-3" aria-hidden />
                </button>
                <button
                  type="button"
                  className="student-report-progress-nav__icon-btn"
                  onClick={() =>
                    persistOutline(
                      addOutlineItem(outline, {
                        parentId: node.sectionId,
                        afterId: node.sectionId,
                        level: Math.min(3, node.level + 1) as 1 | 2 | 3,
                      }),
                    )
                  }
                  title={t('student.reports.modelGuide.addChildSection')}
                  aria-label={t('student.reports.modelGuide.addChildSection')}
                >
                  <Plus className="h-3 w-3" aria-hidden />
                </button>
                <button
                  type="button"
                  className="student-report-progress-nav__icon-btn is-danger"
                  onClick={() => persistOutline(removeOutlineItem(outline, node.sectionId))}
                  title={t('student.reports.modelGuide.deleteSection')}
                  aria-label={t('student.reports.modelGuide.deleteSection')}
                >
                  <Trash2 className="h-3 w-3" aria-hidden />
                </button>
              </div>
            ) : (
              <span className="student-report-progress-nav__pct">{node.progressPercent}%</span>
            )}
          </div>
          {node.children.length > 0 && renderTree(node.children, depth + 1)}
        </div>
      );
    });

  const empty = outline.length === 0;

  return (
    <aside
      className="student-report-progress-sidebar"
      aria-label={t('student.reports.modelGuide.progressTitle')}
    >
      {empty && !model ? (
        <div className="student-report-progress-sidebar__empty">
          <p>{t('student.reports.modelGuide.emptyTitle')}</p>
          <span>{t('student.reports.modelGuide.emptyBody')}</span>
        </div>
      ) : (
        <>
          <section className="student-report-progress-card">
            <div className="student-report-progress-card__head">
              <h2>{t('student.reports.modelGuide.progressTitle')}</h2>
              <strong>{progress.overallPercent}%</strong>
            </div>
            <div
              className="student-report-progress-card__bar"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={progress.overallPercent}
            >
              <span style={{ width: `${progress.overallPercent}%` }} />
            </div>
            {progress.currentSectionTitle && (
              <div className="student-report-progress-card__current">
                <span>{t('student.reports.modelGuide.currentChapter')}</span>
                <strong>{progress.currentSectionTitle}</strong>
                <em>
                  {t('student.reports.modelGuide.currentChapterPercent', {
                    percent: progress.currentSectionPercent,
                  })}
                </em>
              </div>
            )}
          </section>

          {maxPages > 0 && (
            <section
              className={`student-report-pages-limit ${
                pagesOverLimit ? 'is-over' : pagesNearLimit ? 'is-near' : ''
              }`}
              aria-live="polite"
            >
              <div className="student-report-pages-limit__head">
                <h2>{t('student.reports.modelGuide.pagesTitle')}</h2>
                <strong>
                  {t('student.reports.modelGuide.pagesValue', {
                    current: pageCount,
                    max: maxPages,
                  })}
                </strong>
              </div>
              <div
                className="student-report-pages-limit__bar"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={maxPages}
                aria-valuenow={Math.min(pageCount, maxPages)}
                aria-label={t('student.reports.modelGuide.pagesTitle')}
              >
                <span style={{ width: `${Math.min(100, (pageCount / maxPages) * 100)}%` }} />
              </div>
              <p className="student-report-pages-limit__hint">
                {pagesOverLimit
                  ? t('student.reports.modelGuide.pagesOver', { max: maxPages })
                  : t('student.reports.modelGuide.pagesHint', { max: maxPages })}
              </p>
            </section>
          )}

          <section className="student-report-progress-nav">
            <div className="student-report-progress-nav__head">
              <h3>{t('student.reports.modelGuide.toc')}</h3>
              <button
                type="button"
                className={`student-report-progress-nav__settings ${settingsOpen ? 'is-active' : ''}`}
                onClick={() => {
                  setSettingsOpen((v) => !v);
                  setImportOpen(false);
                  setEditingId(null);
                }}
                title={t('student.reports.modelGuide.tocSettings')}
                aria-label={t('student.reports.modelGuide.tocSettings')}
                aria-pressed={settingsOpen}
              >
                {settingsOpen ? <X className="h-3.5 w-3.5" aria-hidden /> : <Settings2 className="h-3.5 w-3.5" aria-hidden />}
              </button>
            </div>

            {settingsOpen && (
              <div className="student-report-toc-settings">
                <button
                  type="button"
                  className="student-report-toc-settings__btn"
                  onClick={() => persistOutline(addOutlineItem(outline, { level: 1 }))}
                >
                  <Plus className="h-3.5 w-3.5" aria-hidden />
                  {t('student.reports.modelGuide.addSection')}
                </button>
                <button
                  type="button"
                  className="student-report-toc-settings__btn"
                  onClick={() => setImportOpen((v) => !v)}
                >
                  {t('student.reports.modelGuide.importToc')}
                </button>
                {model?.sections?.length ? (
                  <button
                    type="button"
                    className="student-report-toc-settings__btn student-report-toc-settings__btn--ghost"
                    onClick={handleResetFromModel}
                  >
                    {t('student.reports.modelGuide.resetFromModel')}
                  </button>
                ) : null}
              </div>
            )}

            {importOpen && (
              <div className="student-report-toc-import">
                <p>{t('student.reports.modelGuide.importTocHint')}</p>
                <textarea
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  placeholder={t('student.reports.modelGuide.importTocPlaceholder')}
                  rows={8}
                />
                <div className="student-report-toc-import__actions">
                  <button
                    type="button"
                    className="student-report-action student-report-action--ghost"
                    onClick={() => {
                      setImportOpen(false);
                      setImportText('');
                    }}
                  >
                    {t('student.reports.modelGuide.close')}
                  </button>
                  <button
                    type="button"
                    className="student-report-action student-report-action--primary"
                    onClick={handleImport}
                    disabled={!importText.trim()}
                  >
                    {t('student.reports.modelGuide.replaceToc')}
                  </button>
                </div>
              </div>
            )}

            <div className="student-report-progress-nav__list">
              {empty ? (
                <p className="student-report-progress-nav__empty">
                  {t('student.reports.modelGuide.tocEmpty')}
                </p>
              ) : (
                renderTree(progress.chapters)
              )}
            </div>
          </section>
        </>
      )}
    </aside>
  );
};

export default ReportProgressSidebar;
