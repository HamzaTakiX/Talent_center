import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { CircleCheck } from 'lucide-react';
import { srfRoutes } from '../../../api/srf';
import { invalidateSrfData } from '../../utils/srfDataSync';

interface SrfValidateButtonProps {
  pendingProofId?: number | null;
  className?: string;
  size?: 'sm' | 'md';
}

const SrfValidateButton: FunctionComponent<SrfValidateButtonProps> = ({
  pendingProofId,
  className = '',
  size = 'md',
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const enabled = Boolean(pendingProofId);
  const tooltip = enabled
    ? t('admin.modules.srf.detail.validateEnabled')
    : t('admin.modules.srf.detail.validateDisabledTooltip');

  const sizeCls =
    size === 'sm'
      ? 'gap-1 px-2.5 py-1 text-xs'
      : 'gap-1.5 px-3 py-2 text-sm';

  return (
    <span className="inline-flex" title={tooltip}>
      <button
        type="button"
        disabled={!enabled}
        aria-disabled={!enabled}
        title={tooltip}
        onClick={() => {
          if (!pendingProofId) return;
          invalidateSrfData();
          navigate(srfRoutes.validation(pendingProofId));
        }}
        className={`inline-flex cursor-pointer items-center justify-center rounded-lg font-medium leading-5 transition-all ${sizeCls} ${
          enabled
            ? 'admin-btn-primary text-white hover:opacity-90'
            : 'cursor-not-allowed border border-[var(--admin-border)] bg-[var(--admin-bg-subtle)] text-[var(--admin-text-muted)] opacity-70'
        } ${className}`}
      >
        <CircleCheck className="h-4 w-4 shrink-0" strokeWidth={2} />
        {t('admin.common.actions.validate')}
      </button>
    </span>
  );
};

export default SrfValidateButton;
