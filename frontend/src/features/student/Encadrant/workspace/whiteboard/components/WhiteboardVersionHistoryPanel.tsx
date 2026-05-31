import { FunctionComponent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Clock, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import type { WhiteboardVersion } from '../data/whiteboardMock';

interface WhiteboardVersionHistoryPanelProps {
  open: boolean;
  onClose: () => void;
  versions: WhiteboardVersion[];
  activeVersionId: string;
  onRestore: (id: string) => void;
}

const WhiteboardVersionHistoryPanel: FunctionComponent<WhiteboardVersionHistoryPanelProps> = ({
  open,
  onClose,
  versions,
  activeVersionId,
  onRestore,
}) => {
  const { t } = useTranslation();

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"
            className="student-whiteboard-version-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            aria-label={t('student.encadrant.workspace.whiteboardPage.versions.close')}
            onClick={onClose}
          />
          <motion.aside
            className="student-whiteboard-version-panel"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            role="dialog"
            aria-labelledby="wb-version-title"
          >
            <div className="student-whiteboard-version-panel__head">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-[var(--admin-brand)]" aria-hidden />
                <h2 id="wb-version-title" className="m-0 text-sm font-semibold text-[var(--admin-text)]">
                  {t('student.encadrant.workspace.whiteboardPage.versions.title')}
                </h2>
              </div>
              <button type="button" className="student-whiteboard-icon-btn" onClick={onClose} aria-label={t('student.encadrant.workspace.whiteboardPage.versions.close')}>
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="m-0 px-4 pb-3 text-xs text-[var(--admin-text-secondary)]">
              {t('student.encadrant.workspace.whiteboardPage.versions.subtitle')}
            </p>
            <ul className="student-whiteboard-version-list">
              {versions.map((v) => {
                const isActive = v.id === activeVersionId;
                return (
                  <li key={v.id}>
                    <button
                      type="button"
                      className={`student-whiteboard-version-item ${isActive ? 'is-active' : ''}`}
                      onClick={() => onRestore(v.id)}
                    >
                      <span className="student-whiteboard-version-item__label">
                        {t(v.labelKey)}
                        {v.isCurrent && (
                          <span className="student-whiteboard-version-item__badge">
                            {t('student.encadrant.workspace.whiteboardPage.versions.badgeCurrent')}
                          </span>
                        )}
                      </span>
                      <span className="student-whiteboard-version-item__meta">
                        {t(v.authorKey)} · {new Date(v.createdAt).toLocaleString()}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

export default WhiteboardVersionHistoryPanel;
