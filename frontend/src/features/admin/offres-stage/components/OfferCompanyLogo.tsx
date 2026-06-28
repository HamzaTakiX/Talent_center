import { FunctionComponent, useState } from 'react';
import OfferAvatarFallback from './OfferAvatarFallback';
import type { AvatarSize } from './OfferAvatarFallback';

interface OfferCompanyLogoProps {
  url?: string | null;
  companyName?: string;
  size?: 'table' | 'card' | 'detail' | 'kpi';
}

const SIZE_TO_AVATAR: Record<string, AvatarSize> = {
  kpi: 'kpi',
  table: 'table',
  card: 'card',
  detail: 'detail',
};

const OfferCompanyLogo: FunctionComponent<OfferCompanyLogoProps> = ({
  url,
  companyName,
  size = 'table',
}) => {
  const [failed, setFailed] = useState(false);
  const showImage = Boolean(url?.trim()) && !failed;

  const sizeClass =
    size === 'kpi'
      ? 'admin-offers-table__logo--kpi'
      : size === 'card'
      ? 'admin-offers-table__logo--card'
      : size === 'detail'
        ? 'admin-offers-table__logo--detail'
        : 'admin-offers-table__logo--table';

  return (
    <div className={`admin-offers-table__logo ${sizeClass}`} aria-hidden={!showImage && !companyName}>
      {showImage ? (
        <img
          src={url!}
          alt={companyName ? `${companyName} logo` : 'Company logo'}
          className="admin-offers-table__logo-img"
          onError={() => setFailed(true)}
          loading="lazy"
          referrerPolicy="no-referrer"
        />
      ) : (
        <OfferAvatarFallback
          companyName={companyName}
          size={SIZE_TO_AVATAR[size] ?? 'table'}
          className="offer-avatar--fill"
        />
      )}
    </div>
  );
};

export default OfferCompanyLogo;
