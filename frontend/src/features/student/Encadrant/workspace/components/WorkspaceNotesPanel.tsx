import { FunctionComponent, useMemo, useState } from 'react';
import {
  Bold,
  Code2,
  Italic,
  Link2,
  List,
  Pin,
  PinOff,
  Plus,
  Save,
  Search,
  Tag,
  X,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import StudentSearchEmptyState from '../../../ui/StudentSearchEmptyState';
import type { UseWorkspaceNotesResult } from '../hooks/useWorkspaceNotes';
import { isWorkspaceSearchActive, matchesWorkspaceSearch } from '../utils/workspaceSearch';
import { workspaceNoteExcerpt, workspaceNoteTitle } from '../utils/workspaceNotes';

interface WorkspaceNotesPanelProps {
  search: string;
  notes: UseWorkspaceNotesResult;
}

const FORMAT_TOOLS = [
  { id: 'bold', Icon: Bold },
  { id: 'italic', Icon: Italic },
  { id: 'list', Icon: List },
  { id: 'code', Icon: Code2 },
  { id: 'link', Icon: Link2 },
] as const;

const WorkspaceNotesPanel: FunctionComponent<WorkspaceNotesPanelProps> = ({ search, notes }) => {
  const { t } = useTranslation();
  const [noteSearch, setNoteSearch] = useState('');

  const filteredNotes = useMemo(() => {
    const matched = notes.notes.filter((note) => {
      const fields = [workspaceNoteTitle(t, note), workspaceNoteExcerpt(t, note), ...note.tags];
      return matchesWorkspaceSearch(search, fields) && matchesWorkspaceSearch(noteSearch, fields);
    });
    // Les notes épinglées restent en tête de liste quel que soit le filtre.
    return matched.sort((a, b) => Number(b.pinned) - Number(a.pinned));
  }, [notes.notes, search, noteSearch, t]);

  const isSearching = isWorkspaceSearchActive(search) || isWorkspaceSearchActive(noteSearch);

  const wordCount = useMemo(() => {
    const flat = notes.draftBody.trim();
    return flat ? flat.split(/\s+/).length : 0;
  }, [notes.draftBody]);

  return (
    <div className="student-workspace-notes">
      <div className="student-workspace-notes__header">
        <div className="student-workspace-notes__title-wrap">
          <h3 className="student-workspace-notes__title">
            {t('student.encadrant.workspace.platform.notes.sectionTitle')}
          </h3>
          <p className="student-workspace-notes__subtitle">
            {t('student.encadrant.workspace.platform.notes.sectionSubtitle')}
          </p>
        </div>
        <button type="button" className="student-workspace-notes__new" onClick={notes.startNewNote}>
          <Plus className="h-4 w-4 shrink-0" aria-hidden />
          <span>{t('student.encadrant.workspace.platform.notes.newNote')}</span>
        </button>
      </div>

      <div className="student-workspace-notes__body">
        <section className="student-workspace-notes__editor">
          <div className="student-workspace-notes__toolbar">
            <div
              className="student-workspace-notes__tools"
              role="group"
              aria-label={t('student.encadrant.workspace.platform.notes.formatGroup')}
            >
              {FORMAT_TOOLS.map(({ id, Icon }) => {
                const label = t(`student.encadrant.workspace.platform.notes.format.${id}`);
                return (
                  <button
                    key={id}
                    type="button"
                    className="student-workspace-notes__tool"
                    title={label}
                    aria-label={label}
                  >
                    <Icon className="h-3.5 w-3.5" aria-hidden />
                  </button>
                );
              })}
            </div>
            <span className="student-workspace-notes__words">
              {t('student.encadrant.workspace.platform.notes.words', { count: wordCount })}
            </span>
            <button
              type="button"
              className="student-workspace-notes__save"
              disabled={!notes.canSave}
              onClick={notes.saveDraft}
            >
              <Save className="h-3.5 w-3.5 shrink-0" aria-hidden />
              <span>{t('student.encadrant.workspace.platform.notes.save')}</span>
            </button>
          </div>

          <input
            type="text"
            className="student-workspace-notes__title-input"
            placeholder={t('student.encadrant.workspace.platform.notes.titlePlaceholder')}
            aria-label={t('student.encadrant.workspace.platform.notes.titlePlaceholder')}
            value={notes.draftTitle}
            onChange={(e) => notes.setDraftTitle(e.target.value)}
          />
          <textarea
            className="student-workspace-notes__textarea"
            placeholder={t('student.encadrant.workspace.platform.notes.editorPlaceholder')}
            aria-label={t('student.encadrant.workspace.platform.notes.editorPlaceholder')}
            value={notes.draftBody}
            onChange={(e) => notes.setDraftBody(e.target.value)}
          />
        </section>

        <aside className="student-workspace-notes__side">
          <div className="student-workspace-notes__side-head">
            <h4 className="student-workspace-notes__side-title">
              {t('student.encadrant.workspace.platform.notes.listTitle')}
            </h4>
            <span className="student-workspace-notes__count">{filteredNotes.length}</span>
          </div>

          <div className="student-workspace-notes__search">
            <Search className="student-workspace-notes__search-icon" aria-hidden />
            <input
              type="text"
              className="student-workspace-notes__search-input"
              placeholder={t('student.encadrant.workspace.platform.notes.search')}
              aria-label={t('student.encadrant.workspace.platform.notes.search')}
              value={noteSearch}
              onChange={(e) => setNoteSearch(e.target.value)}
            />
            {noteSearch ? (
              <button
                type="button"
                className="student-workspace-notes__search-clear"
                onClick={() => setNoteSearch('')}
                aria-label={t('student.encadrant.workspace.platform.notes.clearSearch')}
              >
                <X className="h-3.5 w-3.5" aria-hidden />
              </button>
            ) : null}
          </div>

          {filteredNotes.length === 0 ? (
            <StudentSearchEmptyState
              titleKey={
                isSearching ? undefined : 'student.encadrant.workspace.platform.empty.notesTitle'
              }
              descriptionKey={
                isSearching ? undefined : 'student.encadrant.workspace.platform.empty.notesDesc'
              }
              variant="inline"
              className="student-workspace-notes__empty"
            />
          ) : (
            <ul className="student-workspace-notes__list">
              {filteredNotes.map((note) => {
                const isActive = note.id === notes.activeNoteId;
                const pinLabel = t(
                  note.pinned
                    ? 'student.encadrant.workspace.platform.notes.unpin'
                    : 'student.encadrant.workspace.platform.notes.pin',
                );
                return (
                  <li
                    key={note.id}
                    className={`student-workspace-notes__card ${isActive ? 'is-active' : ''} ${
                      note.pinned ? 'is-pinned' : ''
                    }`}
                  >
                    <button
                      type="button"
                      className="student-workspace-notes__card-main"
                      onClick={() => notes.selectNote(note.id)}
                      aria-current={isActive}
                    >
                      <h5 className="student-workspace-notes__card-title">
                        {workspaceNoteTitle(t, note)}
                      </h5>
                      <p className="student-workspace-notes__card-excerpt">
                        {workspaceNoteExcerpt(t, note)}
                      </p>
                      <div className="student-workspace-notes__card-footer">
                        <div className="student-workspace-notes__tags">
                          {note.tags.map((tag) => (
                            <span key={tag} className="student-workspace-notes__tag">
                              <Tag className="h-2.5 w-2.5 shrink-0" aria-hidden />
                              {tag}
                            </span>
                          ))}
                        </div>
                        <span className="student-workspace-notes__card-date">{note.updatedAt}</span>
                      </div>
                    </button>
                    <button
                      type="button"
                      className="student-workspace-notes__pin"
                      onClick={() => notes.togglePin(note.id)}
                      aria-pressed={note.pinned}
                      title={pinLabel}
                      aria-label={pinLabel}
                    >
                      {note.pinned ? (
                        <Pin className="h-3.5 w-3.5" aria-hidden />
                      ) : (
                        <PinOff className="h-3.5 w-3.5" aria-hidden />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </aside>
      </div>
    </div>
  );
};

export default WorkspaceNotesPanel;
