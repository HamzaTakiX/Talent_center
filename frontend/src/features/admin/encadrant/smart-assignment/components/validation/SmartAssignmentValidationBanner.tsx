import { FunctionComponent } from 'react';
import { AlertTriangle, ChevronRight, Info, ShieldAlert } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { SmartAssignmentPrecheckResult } from '../../../../api/types';
import { issueTitleKey, getIssueTranslationParams, sortIssuesBySeverity } from '../../utils/validationIssueKeys';
import '../../styles/admin-smart-assignment-validation.css';

interface SmartAssignmentValidationBannerProps {
  precheck: SmartAssignmentPrecheckResult;
  onViewDetails: () => void;
}

const SmartAssignmentValidationBanner: FunctionComponent<SmartAssignmentValidationBannerProps> = ({
  precheck,
  onViewDetails,
}) => {
  const { t } = useTranslation();
  const sorted = sortIssuesBySeverity(precheck.issues);
  const top = sorted[0];
  const isCritical = precheck.has_blocking_errors;
  const Icon = isCritical ? ShieldAlert : top?.severity === 'warning' ? AlertTriangle : Info;
  const title = isCritical
    ? t('admin.smartAssignment.validation.banner.blockedTitle')
    : t('admin.smartAssignment.validation.banner.warningTitle');
  const hasCounts = precheck.blocking_count > 0 || precheck.warning_count > 0;

  return (
    <div
      className={`sa-validation-banner ${isCritical ? 'sa-validation-banner--critical' : 'sa-validation-banner--warning'}`}
      role="alert"
    >
      <div className="sa-validation-banner__glow" aria-hidden />
      <div className="sa-validation-banner__mesh" aria-hidden />

      <div className="sa-validation-banner__inner">
        <div className="sa-validation-banner__icon-shell" aria-hidden>
          <span className="sa-validation-banner__icon-ring" />
          <span className="sa-validation-banner__icon">
            <Icon className="h-5 w-5" strokeWidth={2} />
          </span>
        </div>

        <div className="sa-validation-banner__body">
          <div className="sa-validation-banner__head">
            <h2 className="sa-validation-banner__title">{title}</h2>
            {hasCounts ? (
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
            ) : null}
          </div>

          {top ? (
            <div className="sa-validation-banner__issue">
              <div className="sa-validation-banner__issue-main">
                <span
                  className={`sa-validation-banner__severity sa-validation-banner__severity--${top.severity}`}
                >
                  {t(`admin.smartAssignment.validation.severity.${top.severity}`)}
                </span>
                <p className="sa-validation-banner__issue-text">
                  {t(issueTitleKey(top.code), getIssueTranslationParams(top))}
                </p>
              </div>
              <button type="button" onClick={onViewDetails} className="sa-validation-banner__action">
                {t('admin.smartAssignment.validation.viewDetails')}
                <ChevronRight className="h-3 w-3 shrink-0" aria-hidden />
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default SmartAssignmentValidationBanner;
