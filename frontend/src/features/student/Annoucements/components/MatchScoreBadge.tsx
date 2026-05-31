import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { MATCH_SCORE_BADGE } from '../constants/allAnnouncementsStyles';

interface MatchScoreBadgeProps {
  score: number;
}

const MatchScoreBadge: FunctionComponent<MatchScoreBadgeProps> = ({ score }) => {
  const { t } = useTranslation();

  return (
    <span className={MATCH_SCORE_BADGE}>{t('student.announcements.matchScore', { score })}</span>
  );
};

export default MatchScoreBadge;
