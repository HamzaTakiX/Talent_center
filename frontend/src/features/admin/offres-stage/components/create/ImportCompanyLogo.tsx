import { FunctionComponent, useState } from 'react';
import OfferAvatarFallback from '../OfferAvatarFallback';

interface ImportCompanyLogoProps {
  url?: string;
  companyName?: string;
}

const ImportCompanyLogo: FunctionComponent<ImportCompanyLogoProps> = ({ url, companyName }) => {
  const [failed, setFailed] = useState(false);
  const showImage = Boolean(url?.trim()) && !failed;

  return (
    <div className="offer-import-company-logo" aria-hidden={!showImage && !companyName}>
      {showImage ? (
        <img
          src={url}
          alt={companyName ? `${companyName} logo` : 'Company logo'}
          className="offer-import-company-logo__img"
          onError={() => setFailed(true)}
          loading="lazy"
          referrerPolicy="no-referrer"
        />
      ) : (
        <OfferAvatarFallback
          companyName={companyName}
          size="import"
          className="offer-avatar--fill"
        />
      )}
    </div>
  );
};

export default ImportCompanyLogo;
