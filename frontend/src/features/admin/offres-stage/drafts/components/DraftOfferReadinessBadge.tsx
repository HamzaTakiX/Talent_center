import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import AdminBadge from '../../../ui/AdminBadge';

interface DraftOfferReadinessBadgeProps {
  score: number | null | undefined;
  ready?: boolean | null;
}

const DraftOfferReadinessBadge: FunctionComponent<DraftOfferReadinessBadgeProps> = ({
  score,
  ready,
}) => {
  const { t } = useTranslation();
  const PREFIX = 'admin.modules.offers.draftsPage.readiness';

  if (score == null) return null;

  const variant = ready ? 'success' : score >= 50 ? 'warning' : 'danger';

  return (
    <AdminBadge variant={variant}>
      {ready
        ? t(`${PREFIX}.ready`)
        : t(`${PREFIX}.score`, { score })}
    </AdminBadge>
  );
};

export default DraftOfferReadinessBadge;
