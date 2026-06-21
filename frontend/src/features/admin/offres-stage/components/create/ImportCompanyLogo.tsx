import { FunctionComponent, useState } from 'react';
import { Building2 } from 'lucide-react';

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
        <div className="offer-import-company-logo__fallback">
          <Building2 className="h-6 w-6" strokeWidth={1.75} />
        </div>
      )}
    </div>
  );
};

export default ImportCompanyLogo;
