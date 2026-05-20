import { FunctionComponent, useState } from 'react';
import { ChevronDown, ChevronUp, Lightbulb } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import AdminModal from '../../../../ui/AdminModal';
import { AdminPanelListSkeleton } from '../../../../ui';
import type { SmartAssignmentPrecheckResult, SmartAssignmentValidationIssue } from '../../../../api/types';
import SmartAssignmentSeverityBadge from './SmartAssignmentSeverityBadge';
import {
  issueDescriptionKey,
  issueTitleKey,
  recommendationKey,
  sortIssuesBySeverity,
} from '../../utils/validationIssueKeys';

interface SmartAssignmentValidationDetailsModalProps {
  open: boolean;
  onClose: () => void;
  precheck: SmartAssignmentPrecheckResult | null;
}

const IssueCard: FunctionComponent<{ issue: SmartAssignmentValidationIssue }> = ({ issue }) => {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const hasDetails = issue.students.length > 0 || issue.encadrants.length > 0;

  return (
    <article className="rounded-xl border border-[var(--admin-border)] bg-[var(--admin-bg)] p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h4 className="text-sm font-semibold text-[var(--admin-text)]">
          {t(issueTitleKey(issue.code), { count: issue.count })}
        </h4>
        <div className="flex flex-wrap items-center gap-2">
          <SmartAssignmentSeverityBadge severity={issue.severity} />
          {issue.count > 0 ? (
            <span className="rounded-full bg-[var(--admin-surface)] px-2 py-0.5 text-xs font-medium text-[var(--admin-text-muted)]">
              {t('admin.smartAssignment.validation.count', { count: issue.count })}
            </span>
          ) : null}
        </div>
      </div>
      <p className="mt-2 text-sm text-[var(--admin-text-muted)]">
        {t(issueDescriptionKey(issue.code), {
          count: issue.count,
          ...(issue.metadata as Record<string, string | number>),
        })}
      </p>
      {issue.recommendation_codes.length > 0 ? (
        <ul className="mt-3 space-y-1">
          {issue.recommendation_codes.map((code) => (
            <li key={code} className="flex items-start gap-2 text-xs text-[var(--admin-text)]">
              <Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--admin-brand)]" aria-hidden />
              {t(recommendationKey(code))}
            </li>
          ))}
        </ul>
      ) : null}
      {hasDetails ? (
        <>
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-[var(--admin-brand)] hover:underline"
          >
            {expanded
              ? t('admin.smartAssignment.validation.collapseDetails')
              : t('admin.smartAssignment.validation.expandDetails')}
            {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
          {expanded ? (
            <div className="mt-3 max-h-48 space-y-2 overflow-y-auto rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface)] p-2">
              {issue.students.map((s) => (
                <div
                  key={s.student_profile_id}
                  className="rounded-md px-2 py-1.5 text-xs text-[var(--admin-text)]"
                >
                  <p className="font-medium">{s.full_name}</p>
                  <p className="text-[var(--admin-text-muted)]">{s.email}</p>
                  {(s.filiere || s.level) && (
                    <p className="text-[var(--admin-text-muted)]">
                      {[s.filiere, s.level].filter(Boolean).join(' · ')}
                    </p>
                  )}
                </div>
              ))}
              {issue.encadrants.map((e) => (
                <div
                  key={e.encadrant_profile_id}
                  className="rounded-md px-2 py-1.5 text-xs text-[var(--admin-text)]"
                >
                  <p className="font-medium">{e.full_name}</p>
                  <p className="text-[var(--admin-text-muted)]">
                    {t('admin.smartAssignment.workload', {
                      current: e.current_load ?? 0,
                      max: e.max_capacity ?? 0,
                    })}
                  </p>
                </div>
              ))}
            </div>
          ) : null}
        </>
      ) : null}
    </article>
  );
};

const SmartAssignmentValidationDetailsModal: FunctionComponent<
  SmartAssignmentValidationDetailsModalProps
> = ({ open, onClose, precheck }) => {
  const { t } = useTranslation();
  const issues = precheck ? sortIssuesBySeverity(precheck.issues) : [];

  return (
    <AdminModal
      open={open}
      onClose={onClose}
      title={t('admin.smartAssignment.validation.detailsTitle')}
      description={t('admin.smartAssignment.validation.detailsDescription')}
      maxWidthClass="max-w-3xl"
      closeAriaLabel={t('common.close')}
      footer={
        <button
          type="button"
          onClick={onClose}
          className="admin-module-toolbar__btn border-[var(--admin-brand)] bg-[var(--admin-brand)] text-white hover:opacity-90"
        >
          {t('common.close')}
        </button>
      }
    >
      {!precheck ? (
        <AdminPanelListSkeleton rows={4} />
      ) : (
        <>
      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <SummaryCard
          label={t('admin.smartAssignment.validation.summary.eligible')}
          value={precheck.summary.eligible_students}
        />
        <SummaryCard
          label={t('admin.smartAssignment.validation.summary.encadrants')}
          value={precheck.summary.active_encadrants}
        />
        <SummaryCard
          label={t('admin.smartAssignment.validation.summary.alreadyAssigned')}
          value={precheck.summary.already_assigned}
        />
      </div>
      <div className="space-y-3">
        {issues.length === 0 ? (
          <p className="text-sm text-[var(--admin-text-muted)]">
            {t('admin.smartAssignment.validation.noIssues')}
          </p>
        ) : (
          issues.map((issue) => <IssueCard key={issue.code} issue={issue} />)
        )}
      </div>
        </>
      )}
    </AdminModal>
  );
};

const SummaryCard: FunctionComponent<{ label: string; value: number }> = ({ label, value }) => (
  <div className="rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface)] px-3 py-2">
    <p className="text-[10px] font-medium uppercase tracking-wide text-[var(--admin-text-muted)]">
      {label}
    </p>
    <p className="text-lg font-bold text-[var(--admin-text)]">{value}</p>
  </div>
);

export default SmartAssignmentValidationDetailsModal;
