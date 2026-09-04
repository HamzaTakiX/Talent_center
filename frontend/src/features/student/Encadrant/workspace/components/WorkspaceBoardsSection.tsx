import { FunctionComponent, useMemo, useState } from "react";
import { Check, Clock3, FolderOpen, LayoutGrid, Pencil, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { resolveAvatarUrl } from "../../../../admin/dashboard/utils/adminUserDisplay";
import { fadeInUp } from "../../../../admin/dashboard/ui/animations";
import AdminSearchInput from "../../../../admin/ui/AdminSearchInput";
import { useAuth } from "../../../../auth/hooks/useAuth";
import { WORKSPACE_GLASS_CARD } from "../constants/workspaceLayout";
import { workspaceCollaborators } from "../data/workspacePlatformMock";
import type { WorkspaceCollaborator } from "../types";
import {
  useWorkspaceBoards,
  type WorkspaceBoardListItem,
  type WorkspaceBoardsFilter,
} from "../hooks/useWorkspaceBoards";
import { isWorkspaceSearchActive } from "../utils/workspaceSearch";
import StudentSearchEmptyState from "../../../ui/StudentSearchEmptyState";
import { WorkspaceSectionBodySkeleton } from "./WorkspaceSkeleton";

interface WorkspaceBoardsSectionProps {
  loading?: boolean;
}

const FILTERS: WorkspaceBoardsFilter[] = ["all", "saved", "draft"];

const WorkspaceBoardsSection: FunctionComponent<WorkspaceBoardsSectionProps> = ({
  loading = false,
}) => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const boards = useWorkspaceBoards();
  const isSearching = isWorkspaceSearchActive(boards.search);
  const members = useMemo(() => {
    const studentAvatar = resolveAvatarUrl(user?.profile?.avatar);
    return workspaceCollaborators
      .filter((person) => person.isActive)
      .map((person) =>
        person.id === "c1" && studentAvatar
          ? { ...person, avatarUrl: studentAvatar }
          : person,
      );
  }, [user?.profile?.avatar]);

  return (
    <motion.section
      {...fadeInUp}
      className={`${WORKSPACE_GLASS_CARD} student-workspace-hub student-workspace-boards min-w-0`}
      aria-busy={loading || undefined}
    >
      <div className="student-workspace-search">
        <div className="student-workspace-search__inner">
          <AdminSearchInput
            value={boards.search}
            onChange={(event) => boards.setSearch(event.target.value)}
            onClear={() => boards.setSearch("")}
            placeholder={t("student.encadrant.workspace.platform.boards.searchPlaceholder")}
            aria-label={t("student.encadrant.workspace.platform.boards.searchPlaceholder")}
          />
        </div>
      </div>

      <div className="student-workspace-tabs-wrap">
        <nav
          className="ofative-view-switch"
          role="tablist"
          aria-label={t("student.encadrant.workspace.platform.boards.title")}
        >
          {FILTERS.map((key) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={boards.filter === key}
              className={`ofative-view-switch__btn${boards.filter === key ? " is-active" : ""}`}
              onClick={() => boards.setFilter(key)}
            >
              {t(`student.encadrant.workspace.platform.boards.filter.${key}`)}
            </button>
          ))}
        </nav>
      </div>

      <div className="student-workspace-hub__panel">
        {loading ? (
          <div className="student-workspace-hub__panel-inner flex flex-col gap-4 p-5 sm:p-6">
            <WorkspaceSectionBodySkeleton rows={2} rowClassName="h-24 w-full" />
          </div>
        ) : (
          <div className="student-workspace-hub__panel-inner">
            <div className="student-workspace-documents student-workspace-boards__panel">
              <div className="student-workspace-documents__header">
                <div className="student-workspace-documents__title-wrap">
                  <div className="student-workspace-documents__title-row">
                    <span className="student-workspace-documents__title-icon" aria-hidden>
                      <LayoutGrid className="h-4 w-4" strokeWidth={2} />
                    </span>
                    <div>
                      <h3 className="student-workspace-documents__title">
                        {t("student.encadrant.workspace.platform.boards.title")}
                      </h3>
                      <p className="student-workspace-documents__subtitle">
                        {t("student.encadrant.workspace.platform.boards.subtitle")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {boards.filtered.length === 0 ? (
                <StudentSearchEmptyState
                  titleKey={
                    isSearching
                      ? undefined
                      : "student.encadrant.workspace.platform.boards.emptyTitle"
                  }
                  descriptionKey={
                    isSearching
                      ? undefined
                      : "student.encadrant.workspace.platform.boards.emptyDesc"
                  }
                  variant="inline"
                  className="student-workspace-hub-empty"
                />
              ) : (
                <ul className="student-workspace-boards__grid">
                  {boards.filtered.map((board) => (
                    <li key={board.id}>
                      <WorkspaceBoardCard
                        board={board}
                        members={members}
                        locale={i18n.language}
                        onOpen={() => boards.openBoard(board.id)}
                        onRename={(title) => boards.renameBoard(board.id, title)}
                        onDelete={() => {
                          const confirmed = window.confirm(
                            t("student.encadrant.workspace.platform.boards.deleteConfirm"),
                          );
                          if (confirmed) boards.removeBoard(board.id);
                        }}
                      />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </div>
    </motion.section>
  );
};

interface WorkspaceBoardCardProps {
  board: WorkspaceBoardListItem;
  members: WorkspaceCollaborator[];
  locale: string;
  onOpen: () => void;
  onRename: (title: string) => void;
  onDelete: () => void;
}

const WorkspaceBoardMemberAvatar: FunctionComponent<{
  person: WorkspaceCollaborator;
}> = ({ person }) => {
  const { t } = useTranslation();
  const [failed, setFailed] = useState(false);
  const name = t(person.nameKey);

  return (
    <span className="student-workspace-board-card__avatar-wrap" title={name}>
      {failed ? (
        <span className="student-workspace-board-card__avatar-fallback" aria-hidden>
          {person.initials}
        </span>
      ) : (
        <img
          src={person.avatarUrl}
          alt={name}
          className="student-workspace-board-card__avatar"
          onError={() => setFailed(true)}
        />
      )}
    </span>
  );
};

const WorkspaceBoardCard: FunctionComponent<WorkspaceBoardCardProps> = ({
  board,
  members,
  locale,
  onOpen,
  onRename,
  onDelete,
}) => {
  const { t } = useTranslation();
  const [editing, setEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState(board.title);

  const updatedLabel = new Date(board.updatedAt).toLocaleString(locale, {
    dateStyle: "short",
    timeStyle: "short",
  });

  const commitRename = () => {
    onRename(draftTitle);
    setEditing(false);
  };

  return (
    <article
      className={`student-workspace-board-card student-workspace-board-card--${board.status}`}
    >
      <div className="student-workspace-board-card__preview" aria-hidden>
        <span className="student-workspace-board-card__preview-grid" />
        <span className="student-workspace-board-card__preview-icon">
          <LayoutGrid className="h-6 w-6" strokeWidth={1.6} />
        </span>
      </div>

      <div className="student-workspace-board-card__body">
      <div className="student-workspace-board-card__head">
        <span
          className={`student-workspace-board-card__badge student-workspace-board-card__badge--${board.status}`}
        >
          {t(`student.encadrant.workspace.platform.boards.status.${board.status}`)}
        </span>
        <time
          className="student-workspace-board-card__date"
          dateTime={board.updatedAt}
        >
          <Clock3 className="h-3 w-3" aria-hidden />
          {updatedLabel}
        </time>
      </div>

      {editing ? (
        <form
          className="student-workspace-board-card__rename"
          onSubmit={(event) => {
            event.preventDefault();
            commitRename();
          }}
        >
          <input
            className="student-workspace-board-card__input"
            value={draftTitle}
            onChange={(event) => setDraftTitle(event.target.value)}
            onBlur={commitRename}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                setDraftTitle(board.title);
                setEditing(false);
              }
            }}
            aria-label={t("student.encadrant.workspace.platform.boards.renameAria")}
            autoFocus
          />
          <button
            type="submit"
            className="student-workspace-board-card__icon-btn"
            aria-label={t("student.encadrant.workspace.platform.boards.rename")}
          >
            <Check className="h-3.5 w-3.5" aria-hidden />
          </button>
        </form>
      ) : (
        <div className="student-workspace-board-card__title-row">
          <h3 className="student-workspace-board-card__title">
            {board.title || t("student.encadrant.workspace.platform.boards.untitled")}
          </h3>
          <button
            type="button"
            className="student-workspace-board-card__icon-btn"
            onClick={() => {
              setDraftTitle(board.title);
              setEditing(true);
            }}
            aria-label={t("student.encadrant.workspace.platform.boards.renameAria")}
          >
            <Pencil className="h-3.5 w-3.5" aria-hidden />
          </button>
        </div>
      )}

      <p className="student-workspace-board-card__hint">
        {t(
          board.hasScene
            ? "student.encadrant.workspace.platform.boards.hasContent"
            : "student.encadrant.workspace.platform.boards.emptyBoard",
        )}
      </p>

      {members.length > 0 ? (
        <div
          className="student-workspace-board-card__members"
          aria-label={t("student.encadrant.workspace.platform.boards.membersAria", {
            count: members.length,
          })}
        >
          {members.map((person) => (
            <WorkspaceBoardMemberAvatar key={person.id} person={person} />
          ))}
        </div>
      ) : null}

      <div className="student-workspace-board-card__actions">
        <button
          type="button"
          className="student-workspace-board-card__btn student-workspace-board-card__btn--primary"
          onClick={onOpen}
        >
          <FolderOpen className="h-3.5 w-3.5" aria-hidden />
          {t("student.encadrant.workspace.platform.boards.open")}
        </button>
        <button
          type="button"
          className="student-workspace-board-card__btn student-workspace-board-card__btn--danger"
          onClick={onDelete}
        >
          <Trash2 className="h-3.5 w-3.5" aria-hidden />
          {t("student.encadrant.workspace.platform.boards.delete")}
        </button>
      </div>
      </div>
    </article>
  );
};

export default WorkspaceBoardsSection;
