import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import type { PlatformDeskViewerRole } from '../types/platformDeskChatTypes';
import type { PlatformDeskSupportStatus } from '../utils/platformDeskSupportStatus';
import {
  SUPPORT_STATUS_DEFAULT_LABELS,
  supportStatusLabelKey,
  supportStatusPillClass,
} from '../utils/platformDeskSupportStatus';

type Props = {
  status: PlatformDeskSupportStatus;
  viewerRole?: PlatformDeskViewerRole;
  className?: string;
  inline?: boolean;
};

const PlatformDeskSupportStatusBadge: FunctionComponent<Props> = ({
  status,
  viewerRole = 'admin',
  className,
  inline = false,
}) => {
  const { t } = useTranslation();

  return (
    <span
      className={[
        supportStatusPillClass(status),
        inline ? 'isi-status-pill--inline' : null,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {t(supportStatusLabelKey(status, viewerRole), {
        defaultValue: SUPPORT_STATUS_DEFAULT_LABELS[status],
      })}
    </span>
  );
};

export default PlatformDeskSupportStatusBadge;
