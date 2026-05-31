import { FunctionComponent } from 'react';
import { Pin, Search, Tag } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { workspaceNotes } from '../data/workspacePlatformMock';
import StudentSearchEmptyState from '../../../ui/StudentSearchEmptyState';

const WorkspaceNotesPanel: FunctionComponent = () => {
  const { t } = useTranslation();

  return (
    <div className="grid gap-4 p-4 lg:grid-cols-[1fr_280px] sm:p-5">
      <div className="min-h-[280px] rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface-muted)] p-4">
        <div className="mb-3 flex flex-wrap gap-1 border-b border-[var(--admin-border)] pb-2">
          {['bold', 'italic', 'list', 'code', 'link'].map((fmt) => (
            <button key={fmt} type="button" className="admin-btn admin-btn-ghost admin-btn--sm text-xs capitalize">
              {t(`student.encadrant.workspace.platform.notes.format.${fmt}`)}
            </button>
          ))}
        </div>
        <textarea
          className="min-h-[200px] w-full resize-y rounded-lg border border-[var(--admin-border)] bg-[var(--admin-bg-elevated)] p-3 text-sm text-[var(--admin-text)]"
          placeholder={t('student.encadrant.workspace.platform.notes.editorPlaceholder')}
        />
      </div>
      <aside>
        <div className="relative mb-3">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--admin-text-muted)]" />
          <input type="search" className="admin-input w-full pl-8 text-sm" placeholder={t('student.encadrant.workspace.platform.notes.search')} />
        </div>
        {workspaceNotes.length === 0 ? (
          <StudentSearchEmptyState titleKey="student.encadrant.workspace.platform.empty.notesTitle" descriptionKey="student.encadrant.workspace.platform.empty.notesDesc" variant="inline" />
        ) : (
          <ul className="m-0 flex list-none flex-col gap-2 p-0">
            {workspaceNotes.map((note) => (
              <li key={note.id} className="rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface-muted)] p-3">
                <div className="flex items-start justify-between gap-1">
                  <h4 className="m-0 text-sm font-semibold text-[var(--admin-text)]">{t(note.titleKey)}</h4>
                  {note.pinned ? <Pin className="h-3.5 w-3.5 shrink-0 text-[var(--admin-brand)]" aria-hidden /> : null}
                </div>
                <p className="m-0 mt-1 line-clamp-2 text-xs text-[var(--admin-text-muted)]">{t(note.excerptKey)}</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {note.tags.map((tag) => (
                    <span key={tag} className="inline-flex items-center gap-0.5 rounded bg-[var(--admin-brand-muted)] px-1.5 py-0.5 text-[10px] text-[var(--admin-brand)]">
                      <Tag className="h-2.5 w-2.5" aria-hidden />
                      {tag}
                    </span>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        )}
      </aside>
    </div>
  );
};

export default WorkspaceNotesPanel;
