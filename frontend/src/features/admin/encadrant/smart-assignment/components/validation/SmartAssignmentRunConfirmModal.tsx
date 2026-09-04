import { FunctionComponent, useEffect, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import AdminModal from '../../../../ui/AdminModal';
import type {
  SmartAssignmentAssignmentStrategy,
  SmartAssignmentPrecheckResult,
} from '../../../../api/types';
import SmartAssignmentSeverityBadge from './SmartAssignmentSeverityBadge';
import { issueTitleKey, getIssueTranslationParams, sortIssuesBySeverity } from '../../utils/validationIssueKeys';

interface SmartAssignmentRunConfirmModalProps {
  open: boolean;
  onClose: () => void;
  precheck: SmartAssignmentPrecheckResult | null;
  isPreview: boolean;
  loading: boolean;
  onConfirm: (strategy: SmartAssignmentAssignmentStrategy) => void;
}

const SmartAssignmentRunConfirmModal: FunctionComponent<SmartAssignmentRunConfirmModalProps> = ({
  open,
  onClose,
  precheck,
  isPreview,
  loading,
  onConfirm,
}) => {
  const { t } = useTranslation();
  const hasExisting = precheck?.issues.some((i) => i.code === 'EXISTING_ASSIGNMENTS') ?? false;
  const [strategy, setStrategy] = useState<SmartAssignmentAssignmentStrategy>(
    hasExisting ? 'skip_assigned' : 'full',
  );

  useEffect(() => {
    if (open) {
      setStrategy(hasExisting ? 'skip_assigned' : 'full');
    }
  }, [open, hasExisting]);

  const warnings = precheck
    ? sortIssuesBySeverity(precheck.issues.filter((i) => i.severity !== 'critical'))
    : [];

  return (
    <AdminModal
      open={open}
      onClose={onClose}
      title={t('admin.smartAssignment.validation.confirmTitle')}
      description={t('admin.smartAssignment.validation.confirmDescription')}
      maxWidthClass="max-w-lg"
      closeAriaLabel={t('common.close')}
      footer={
        <div className="flex flex-wrap justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="admin-module-toolbar__btn disabled:opacity-50"
          >
            {t('common.cancel')}
          </button>
          <button
            type="button"
            onClick={() => onConfirm(strategy)}
            disabled={loading}
            className="admin-module-toolbar__btn inline-flex items-center gap-2 border-[var(--admin-brand)] bg-[var(--admin-brand)] text-white hover:opacity-90 disabled:opacity-50"
          >
            {loading ? (
              <span
                className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
                aria-hidden
              />
            ) : null}
            {isPreview
              ? t('admin.smartAssignment.validation.continuePreview')
              : t('admin.smartAssignment.validation.continueRun')}
          </button>
        </div>
      }
    >
      <div className="flex gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3">
        <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden />
        <p className="text-sm text-[var(--admin-text)]">
          {t('admin.smartAssignment.validation.confirmWarningsIntro')}
        </p>
      </div>

      <ul className="mt-4 space-y-2">
        {warnings.map((issue, index) => (
          <li
            key={`${issue.code}-${index}`}
            className="flex flex-wrap items-center gap-2 rounded-lg border border-[var(--admin-border)] bg-[var(--admin-bg)] px-3 py-2 text-xs"
          >
            <SmartAssignmentSeverityBadge severity={issue.severity} />
            <span className="text-[var(--admin-text)]">
              {t(issueTitleKey(issue.code), getIssueTranslationParams(issue))}
            </span>
          </li>
        ))}
      </ul>

      {hasExisting ? (
        <fieldset className="mt-5 space-y-2">
          <legend className="text-sm font-semibold text-[var(--admin-text)]">
            {t('admin.smartAssignment.validation.strategyLegend')}
          </legend>
          <label className="flex cursor-pointer items-start gap-2 rounded-lg border border-[var(--admin-border)] p-3 hover:bg-[var(--admin-surface-hover)]">
            <input
              type="radio"
              name="assignment-strategy"
              value="full"
              checked={strategy === 'full'}
              onChange={() => setStrategy('full')}
              className="mt-0.5"
            />
            <span>
              <span className="block text-sm font-medium text-[var(--admin-text)]">
                {t('admin.smartAssignment.validation.strategy.full.title')}
              </span>
              <span className="block text-xs text-[var(--admin-text-muted)]">
                {t('admin.smartAssignment.validation.strategy.full.description')}
              </span>
            </span>
          </label>
          <label className="flex cursor-pointer items-start gap-2 rounded-lg border border-[var(--admin-border)] p-3 hover:bg-[var(--admin-surface-hover)]">
            <input
              type="radio"
              name="assignment-strategy"
              value="skip_assigned"
              checked={strategy === 'skip_assigned'}
              onChange={() => setStrategy('skip_assigned')}
              className="mt-0.5"
            />
            <span>
              <span className="block text-sm font-medium text-[var(--admin-text)]">
                {t('admin.smartAssignment.validation.strategy.skipAssigned.title')}
              </span>
              <span className="block text-xs text-[var(--admin-text-muted)]">
                {t('admin.smartAssignment.validation.strategy.skipAssigned.description')}
              </span>
            </span>
          </label>
          <label className="flex cursor-pointer items-start gap-2 rounded-lg border border-[var(--admin-border)] p-3 hover:bg-[var(--admin-surface-hover)]">
            <input
              type="radio"
              name="assignment-strategy"
              value="unassigned_only"
              checked={strategy === 'unassigned_only'}
              onChange={() => setStrategy('unassigned_only')}
              className="mt-0.5"
            />
            <span>
              <span className="block text-sm font-medium text-[var(--admin-text)]">
                {t('admin.smartAssignment.validation.strategy.unassignedOnly.title')}
              </span>
              <span className="block text-xs text-[var(--admin-text-muted)]">
                {t('admin.smartAssignment.validation.strategy.unassignedOnly.description')}
              </span>
            </span>
          </label>
        </fieldset>
      ) : null}
    </AdminModal>
  );
};

export default SmartAssignmentRunConfirmModal;
