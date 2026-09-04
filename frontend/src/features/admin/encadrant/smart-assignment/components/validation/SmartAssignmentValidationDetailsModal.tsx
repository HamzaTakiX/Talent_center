import { FunctionComponent, useState } from 'react';
import { ChevronDown, ChevronUp, ClipboardList, Lightbulb, Link2, UserCheck, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import AdminModal from '../../../../ui/AdminModal';
import { AdminPanelListSkeleton } from '../../../../ui';
import type {
  SmartAssignmentPrecheckResult,
  SmartAssignmentSeverity,
  SmartAssignmentValidationIssue,
} from '../../../../api/types';
import {
  getIssueReactKey,
  getIssueTranslationParams,
  issueDescriptionKey,
  issueTitleKey,
  recommendationKey,
  sortIssuesBySeverity,
} from '../../utils/validationIssueKeys';
import '../../styles/admin-smart-assignment-validation.css';

interface SmartAssignmentValidationDetailsModalProps {
  open: boolean;
  onClose: () => void;
  precheck: SmartAssignmentPrecheckResult | null;
}

const severityIssueClass: Record<SmartAssignmentSeverity, string> = {
  critical: 'sa-validation-modal__issue--critical',
  warning: 'sa-validation-modal__issue--warning',
  info: 'sa-validation-modal__issue--info',
};

const severityBadgeClass: Record<SmartAssignmentSeverity, string> = {
  critical: 'sa-validation-banner__severity sa-validation-banner__severity--critical',
  warning: 'sa-validation-banner__severity sa-validation-banner__severity--warning',
  info: 'sa-validation-banner__severity sa-validation-banner__severity--info',
};

const IssueCard: FunctionComponent<{ issue: SmartAssignmentValidationIssue }> = ({ issue }) => {
  const { t } = useTranslation();
  const translationParams = getIssueTranslationParams(issue);
  const hasRecords = issue.students.length > 0 || issue.encadrants.length > 0;
  const hasDetails = hasRecords || issue.count > 0;
  const [expanded, setExpanded] = useState(hasRecords);

  return (
    <article
      className={`sa-validation-modal__issue ${severityIssueClass[issue.severity]}`}
    >
      <div className="sa-validation-modal__issue-header">
        <h4 className="sa-validation-modal__issue-title">
          {t(issueTitleKey(issue.code), translationParams)}
        </h4>
        <div className="sa-validation-modal__issue-badges">
          <span className={`sa-validation-modal__severity ${severityBadgeClass[issue.severity]}`}>
            {t(`admin.smartAssignment.validation.severity.${issue.severity}`)}
          </span>
          {issue.count > 0 ? (
            <span className="sa-validation-modal__issue-count">
              {t('admin.smartAssignment.validation.count', { count: issue.count })}
            </span>
          ) : null}
        </div>
      </div>

      <p className="sa-validation-modal__issue-desc">
        {t(issueDescriptionKey(issue.code), translationParams)}
      </p>

      {issue.recommendation_codes.length > 0 ? (
        <div className="sa-validation-modal__recommendations">
          <p className="sa-validation-modal__recommendations-label">
            <Lightbulb className="h-3.5 w-3.5" aria-hidden />
            {t('admin.smartAssignment.validation.recommendationsLabel')}
          </p>
          <ul className="sa-validation-modal__recommendations-list">
            {issue.recommendation_codes.map((code) => (
              <li key={code}>{t(recommendationKey(code))}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {hasDetails ? (
        <div className="sa-validation-modal__issue-actions">
          {hasRecords ? (
            <>
              <button
                type="button"
                onClick={() => setExpanded((v) => !v)}
                className="sa-validation-modal__expand-btn"
                aria-expanded={expanded}
              >
                {expanded
                  ? t('admin.smartAssignment.validation.collapseDetails')
                  : t('admin.smartAssignment.validation.expandDetails')}
                {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              </button>

              {expanded ? (
                <div className="sa-validation-modal__records">
                  {issue.students.map((s) => (
                    <div key={s.student_profile_id} className="sa-validation-modal__record">
                      <span className="sa-validation-modal__record-avatar" aria-hidden>
                        {(s.full_name || s.email || '?').charAt(0).toUpperCase()}
                      </span>
                      <div className="sa-validation-modal__record-copy">
                        <p className="sa-validation-modal__record-name">{s.full_name}</p>
                        <p className="sa-validation-modal__record-meta">{s.email}</p>
                        {(s.filiere || s.level || s.internship_type) && (
                          <p className="sa-validation-modal__record-meta">
                            {[s.filiere, s.level, s.internship_type].filter(Boolean).join(' · ')}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                  {issue.encadrants.map((e) => (
                    <div key={e.encadrant_profile_id} className="sa-validation-modal__record">
                      <span className="sa-validation-modal__record-avatar sa-validation-modal__record-avatar--encadrant" aria-hidden>
                        {(e.full_name || '?').charAt(0).toUpperCase()}
                      </span>
                      <div className="sa-validation-modal__record-copy">
                        <p className="sa-validation-modal__record-name">{e.full_name}</p>
                        <p className="sa-validation-modal__record-meta">
                          {t('admin.smartAssignment.workload', {
                            current: e.current_load ?? 0,
                            max: e.max_capacity ?? 0,
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
            </>
          ) : (
            <p className="sa-validation-modal__issue-fallback">
              {t('admin.smartAssignment.validation.recordsUnavailable')}
            </p>
          )}
        </div>
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
      headerIcon={ClipboardList}
      closeAriaLabel={t('common.close')}
      bodyClassName="sa-validation-modal__body"
      footer={
        <button type="button" onClick={onClose} className="sa-validation-modal__close-btn">
          {t('common.close')}
        </button>
      }
    >
      {!precheck ? (
        <AdminPanelListSkeleton rows={4} />
      ) : (
        <>
          <div className="sa-validation-modal__summary">
            <SummaryCard
              icon={Users}
              label={t('admin.smartAssignment.validation.summary.eligible')}
              value={precheck.summary.eligible_students}
              tone="brand"
            />
            <SummaryCard
              icon={UserCheck}
              label={t('admin.smartAssignment.validation.summary.encadrants')}
              value={precheck.summary.active_encadrants}
              tone="cyan"
            />
            <SummaryCard
              icon={Link2}
              label={t('admin.smartAssignment.validation.summary.alreadyAssigned')}
              value={precheck.summary.already_assigned}
              tone="violet"
            />
          </div>

          {(precheck.blocking_count > 0 || precheck.warning_count > 0) && issues.length > 0 ? (
            <div className="sa-validation-modal__issues-head">
              <p className="sa-validation-modal__issues-title">
                {t('admin.smartAssignment.validation.issuesSectionTitle')}
              </p>
              <div className="sa-validation-banner__stats">
                {precheck.blocking_count > 0 ? (
                  <span className="sa-validation-banner__stat sa-validation-banner__stat--critical">
                    {t('admin.smartAssignment.validation.banner.criticalCount', {
                      count: precheck.blocking_count,
                    })}
                  </span>
                ) : null}
                {precheck.warning_count > 0 ? (
                  <span className="sa-validation-banner__stat sa-validation-banner__stat--warning">
                    {t('admin.smartAssignment.validation.banner.warningCount', {
                      count: precheck.warning_count,
                    })}
                  </span>
                ) : null}
              </div>
            </div>
          ) : null}

          <div className="sa-validation-modal__issues">
            {issues.length === 0 ? (
              <p className="sa-validation-modal__empty">{t('admin.smartAssignment.validation.noIssues')}</p>
            ) : (
              issues.map((issue, index) => (
                <IssueCard key={getIssueReactKey(issue, index)} issue={issue} />
              ))
            )}
          </div>
        </>
      )}
    </AdminModal>
  );
};

const summaryToneClass = {
  brand: 'sa-validation-modal__stat--brand',
  cyan: 'sa-validation-modal__stat--cyan',
  violet: 'sa-validation-modal__stat--violet',
} as const;

const SummaryCard: FunctionComponent<{
  label: string;
  value: number;
  icon: typeof Users;
  tone: keyof typeof summaryToneClass;
}> = ({ label, value, icon: Icon, tone }) => (
  <div className={`sa-validation-modal__stat ${summaryToneClass[tone]}`}>
    <span className="sa-validation-modal__stat-icon" aria-hidden>
      <Icon className="h-4 w-4" strokeWidth={2} />
    </span>
    <div className="sa-validation-modal__stat-copy">
      <p className="sa-validation-modal__stat-label">{label}</p>
      <p className="sa-validation-modal__stat-value">{value}</p>
    </div>
  </div>
);

export default SmartAssignmentValidationDetailsModal;
