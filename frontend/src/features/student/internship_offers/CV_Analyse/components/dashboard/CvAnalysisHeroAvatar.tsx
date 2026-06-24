import { FunctionComponent, useState } from 'react';
import type { CvAnalysisStudentProfile } from '../../types/cvAnalysisDashboard';

interface CvAnalysisHeroAvatarProps {
  profile: Pick<CvAnalysisStudentProfile, 'avatarInitials' | 'avatarUrl' | 'name'>;
}

const CvAnalysisHeroAvatar: FunctionComponent<CvAnalysisHeroAvatarProps> = ({ profile }) => {
  const [avatarFailed, setAvatarFailed] = useState(false);
  const showAvatar = Boolean(profile.avatarUrl) && !avatarFailed;

  return (
    <div
      className={`sr-cva-hero__avatar${showAvatar ? ' sr-cva-hero__avatar--photo' : ''}`}
      aria-hidden={showAvatar ? undefined : true}
    >
      {showAvatar ? (
        <img
          src={profile.avatarUrl}
          alt={profile.name ? `Photo de ${profile.name}` : 'Photo de profil'}
          className="sr-cva-hero__avatar-img"
          onError={() => setAvatarFailed(true)}
          loading="lazy"
          referrerPolicy="no-referrer"
        />
      ) : (
        profile.avatarInitials
      )}
    </div>
  );
};

export default CvAnalysisHeroAvatar;
