import { FunctionComponent, useState } from 'react';

type Size = 'list' | 'header' | 'thread';

type Props = {
  url?: string | null;
  companyName?: string;
  offerTitle?: string;
  size?: Size;
};

function fallbackLabel(companyName?: string, offerTitle?: string): string {
  const src = (companyName || offerTitle || '').trim();
  const parts = src.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return (src.slice(0, 2) || '??').toUpperCase();
}

const InternshipOfferAvatar: FunctionComponent<Props> = ({
  url,
  companyName,
  offerTitle,
  size = 'list',
}) => {
  const [failed, setFailed] = useState(false);
  const resolved = url?.trim();
  const showImage = Boolean(resolved) && !failed;

  return (
    <div
      className={`isi-offer-avatar isi-offer-avatar--${size}`}
      aria-hidden={!showImage && !companyName && !offerTitle}
    >
      {showImage ? (
        <img
          src={resolved}
          alt={companyName ? `${companyName} logo` : 'Logo entreprise'}
          className="isi-offer-avatar__img"
          onError={() => setFailed(true)}
          loading="lazy"
          referrerPolicy="no-referrer"
        />
      ) : (
        <span className="isi-offer-avatar__fallback" aria-hidden>
          {fallbackLabel(companyName, offerTitle)}
        </span>
      )}
    </div>
  );
};

export default InternshipOfferAvatar;
