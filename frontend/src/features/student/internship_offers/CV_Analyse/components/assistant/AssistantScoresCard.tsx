import { FunctionComponent } from 'react';
import {
  CV_ASSISTANT_CARD,
  CV_ASSISTANT_PROGRESS_FILL,
  CV_ASSISTANT_PROGRESS_TRACK,
  CV_ASSISTANT_SCORE_VALUE,
  CV_ASSISTANT_SECTION_TITLE,
} from '../../constants/cvAiAssistantStyles';

interface AssistantScoresCardProps {
  scorePercent: number;
}

const AssistantScoresCard: FunctionComponent<AssistantScoresCardProps> = ({ scorePercent }) => {
  return (
    <article className={CV_ASSISTANT_CARD}>
      <h2 className={CV_ASSISTANT_SECTION_TITLE}>Analysis Scores</h2>
      <div className="mt-3.5 flex min-w-0 items-end justify-between gap-3 max-[429px]:mt-3">
        <span className="text-sm font-medium leading-5 text-[var(--admin-text-muted)]">CV Score</span>
        <span className={CV_ASSISTANT_SCORE_VALUE}>{scorePercent}%</span>
      </div>
      <div className={`${CV_ASSISTANT_PROGRESS_TRACK} mt-3.5 max-[429px]:mt-3`}>
        <div
          className={CV_ASSISTANT_PROGRESS_FILL}
          style={{ width: `${scorePercent}%` }}
          role="progressbar"
          aria-valuenow={scorePercent}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </article>
  );
};

export default AssistantScoresCard;
