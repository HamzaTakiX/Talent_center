import { FunctionComponent, useState } from 'react';
import { resolveMediaUrl } from '../../../../../shared/api/mediaUrl';
import OfferAvatarFallback, { type AvatarSize } from '../../components/OfferAvatarFallback';

type Size = 'list' | 'header' | 'thread';

type Props = {
  url?: string | null;
  companyName?: string;
  offerTitle?: string;
  size?: Size;
};

const SIZE_TO_AVATAR: Record<Size, AvatarSize> = {
  list: 'card',
  header: 'card',
  thread: 'kpi',
};

const InternshipOfferAvatar: FunctionComponent<Props> = ({
  url,
  companyName,
  offerTitle,
  size = 'list',
}) => {
  const [failed, setFailed] = useState(false);
  const resolved = resolveMediaUrl(url) ?? undefined;
  const showImage = Boolean(resolved) && !failed;
  const fallbackName = companyName?.trim() || offerTitle?.trim();

  return (
    <div
      className={`isi-offer-avatar isi-offer-avatar--${size}`}
      aria-hidden={!showImage && !fallbackName}
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
        <OfferAvatarFallback
          companyName={fallbackName}
          size={SIZE_TO_AVATAR[size]}
          className="offer-avatar--fill"
        />
      )}
    </div>
  );
};

export default InternshipOfferAvatar;
