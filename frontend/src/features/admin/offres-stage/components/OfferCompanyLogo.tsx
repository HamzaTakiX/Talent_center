import { FunctionComponent, useState } from 'react';
import { Building2 } from 'lucide-react';

interface OfferCompanyLogoProps {
  url?: string | null;
  companyName?: string;
  size?: 'table' | 'card' | 'detail' | 'kpi';
}

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
        <div className="admin-offers-table__logo-fallback">
          <Building2
            className={size === 'detail' ? 'h-6 w-6' : size === 'kpi' ? 'h-3.5 w-3.5' : 'h-4 w-4'}
            strokeWidth={1.75}
            aria-hidden
          />
        </div>
      )}
    </div>
  );
};

export default OfferCompanyLogo;
