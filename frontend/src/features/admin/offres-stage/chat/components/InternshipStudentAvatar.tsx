import { FunctionComponent, useState } from 'react';

type Size = 'list' | 'header' | 'inspector';

type Props = {
  url?: string | null;
  name?: string;
  email?: string;
  initials?: string;
  size?: Size;
};

const InternshipStudentAvatar: FunctionComponent<Props> = ({
  url,
  name,
  email,
  initials,
  size = 'list',
}) => {
  const [failed, setFailed] = useState(false);
  const resolved = url?.trim();
  const showImage = Boolean(resolved) && !failed;
  const fallback =
    initials?.trim() ||
    (() => {
      const trimmed = (name ?? '').trim();
      const parts = trimmed.split(/\s+/).filter(Boolean);
      if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      if (parts.length === 1 && parts[0].length >= 2) return parts[0].slice(0, 2).toUpperCase();
      const local = (email ?? '').split('@')[0] ?? '';
      if (local.length >= 2) return local.slice(0, 2).toUpperCase();
      return '??';
    })();

  return (
    <div
      className={`isi-avatar isi-avatar--${size}${showImage ? ' isi-avatar--photo' : ''}`}
      aria-hidden={!showImage && !fallback}
    >
      {showImage ? (
        <img
          src={resolved}
          alt={name ? `Photo de ${name}` : 'Photo étudiant'}
          className="isi-avatar__img"
          onError={() => setFailed(true)}
          loading="lazy"
          referrerPolicy="no-referrer"
        />
      ) : (
        fallback
      )}
    </div>
  );
};

export default InternshipStudentAvatar;
