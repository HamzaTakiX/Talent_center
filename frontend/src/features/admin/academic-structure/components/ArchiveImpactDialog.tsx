import { FunctionComponent, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  AlertTriangle,
  Archive,
  Briefcase,
  Calendar,
  FileText,
  Megaphone,
  Users,
} from 'lucide-react';
import AdminModal from '../../ui/AdminModal';
import type { ArchivedEntityKind, ImpactSummary } from '../types/academicStructureTypes';

const PREFIX = 'admin.modules.academicStructure';

interface ArchiveImpactDialogProps {
  open: boolean;
  label: string;
  entityType?: ArchivedEntityKind | string;
  impact: ImpactSummary | null;
  confirming: boolean;
  onCancel: () => void;
  onConfirm: () => void | Promise<void>;
}

const IMPACT_ITEMS = [
  { key: 'students', icon: Users },
  { key: 'offers', icon: Briefcase },
  { key: 'applications', icon: FileText },
  { key: 'announcements', icon: Megaphone },
  { key: 'meetings', icon: Calendar },
] as const;

const ArchiveImpactDialog: FunctionComponent<ArchiveImpactDialogProps> = ({
  open,
  label,
  entityType,
  impact,
  confirming,
  onCancel,
  onConfirm,
}) => {
  const { t } = useTranslation();

  const entityTypeLabel = entityType
    ? t(`${PREFIX}.archived.types.${entityType}`, { defaultValue: String(entityType) })
    : null;

  const impactItems = useMemo(() => {
    if (!impact) return [];
    return IMPACT_ITEMS.map(({ key, icon }) => ({
      key,
      icon,
      count: impact[key as keyof ImpactSummary] as number,
    })).filter((item) => item.count > 0);
  }, [impact]);

  const hasImpact = impactItems.length > 0;
  const totalImpact = impact?.total ?? impactItems.reduce((sum, item) => sum + item.count, 0);

  const footer = (
    <>
      <button
        type="button"
        onClick={onCancel}
        disabled={confirming}
        className="admin-btn-secondary rounded-xl px-4 py-2 text-sm font-medium"
      >
        {t(`${PREFIX}.archive.cancel`)}
      </button>
      <button
        type="button"
        onClick={() => void onConfirm()}
        disabled={confirming}
        className="academic-archive-confirm-btn inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold"
      >
        <Archive className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
        {confirming ? t(`${PREFIX}.archive.confirming`) : t(`${PREFIX}.archive.confirmAction`)}
      </button>
    </>
  );

  return (
    <AdminModal
      open={open}
      onClose={confirming ? () => undefined : onCancel}
      title={t(`${PREFIX}.archive.title`)}
      description={t(`${PREFIX}.archive.subtitle`)}
      maxWidthClass="max-w-[520px]"
      footer={footer}
    >
      <div className="academic-archive-dialog">
        <div className="academic-archive-dialog__hero">
          <span className="academic-archive-dialog__icon" aria-hidden>
            <AlertTriangle className="h-5 w-5" strokeWidth={2} />
          </span>
          <div className="min-w-0 flex-1">
            {entityTypeLabel ? (
              <p className="academic-archive-dialog__type">{entityTypeLabel}</p>
            ) : null}
            <p className="academic-archive-dialog__entity">{label}</p>
            <p className="academic-archive-dialog__hint">
              {t(`${PREFIX}.archive.confirm`, { name: label })}
            </p>
          </div>
        </div>

        <div className="academic-archive-dialog__notice">
          <p>{t(`${PREFIX}.archive.notice`)}</p>
        </div>

        {hasImpact ? (
          <div className="academic-archive-dialog__impact">
            <div className="academic-archive-dialog__impact-head">
              <p className="academic-archive-dialog__impact-title">{t(`${PREFIX}.archive.usedBy`)}</p>
              {totalImpact > 0 ? (
                <span className="academic-archive-dialog__impact-total">
                  {t(`${PREFIX}.archive.totalReferences`, { count: totalImpact })}
                </span>
              ) : null}
            </div>
            <ul className="academic-archive-dialog__impact-list">
              {impactItems.map(({ key, icon: Icon, count }) => (
                <li key={key} className="academic-archive-dialog__impact-item">
                  <span className="academic-archive-dialog__impact-icon" aria-hidden>
                    <Icon className="h-4 w-4" strokeWidth={2} />
                  </span>
                  <span className="academic-archive-dialog__impact-label">
                    {t(`${PREFIX}.archive.${key}`, { count })}
                  </span>
                  <span className="academic-archive-dialog__impact-count">{count}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="academic-archive-dialog__impact academic-archive-dialog__impact--empty">
            <p>{t(`${PREFIX}.archive.noReferences`)}</p>
          </div>
        )}
      </div>
    </AdminModal>
  );
};

export default ArchiveImpactDialog;
