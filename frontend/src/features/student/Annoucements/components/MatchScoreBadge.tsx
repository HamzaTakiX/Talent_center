import { FunctionComponent } from 'react';
import { MATCH_SCORE_BADGE } from '../constants/allAnnouncementsStyles';

interface MatchScoreBadgeProps {
  score: number;
}

const MatchScoreBadge: FunctionComponent<MatchScoreBadgeProps> = ({ score }) => (
  <span className={MATCH_SCORE_BADGE}>{score}% Match</span>
);

export default MatchScoreBadge;
