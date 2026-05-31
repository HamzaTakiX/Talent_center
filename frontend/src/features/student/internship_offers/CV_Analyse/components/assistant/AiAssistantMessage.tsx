import { FunctionComponent } from 'react';
import { Check, Sparkles } from 'lucide-react';
import type { CvAiAssistantAnalysisMessage } from '../../types/cvAiAssistant';
import {
  CV_ASSISTANT_AVATAR_ICON,
  CV_ASSISTANT_LIST_ITEM_IMPROVE,
  CV_ASSISTANT_LIST_ITEM_STRENGTH,
  CV_ASSISTANT_MESSAGE_BUBBLE,
  CV_ASSISTANT_SCORE_BADGE,
} from '../../constants/cvAiAssistantStyles';

interface AiAssistantMessageProps {
  message: CvAiAssistantAnalysisMessage;
}

const AiAssistantMessage: FunctionComponent<AiAssistantMessageProps> = ({ message }) => {
  return (
    <div className="flex min-w-0 items-start gap-3 sm:gap-4">
      <span className={CV_ASSISTANT_AVATAR_ICON} aria-hidden>
        <Sparkles className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={1.75} />
      </span>
      <article className={CV_ASSISTANT_MESSAGE_BUBBLE}>
        <p className="m-0 text-sm leading-6 sm:text-[15px] sm:leading-7">
          {message.intro}{' '}
          <span className={CV_ASSISTANT_SCORE_BADGE}>{message.scorePercent}%</span>
        </p>

        <p className="m-0 mt-5 text-sm font-semibold leading-5 text-[var(--admin-text)]">
          {message.strengthsTitle}
        </p>
        <ul className="m-0 mt-2.5 flex list-none flex-col gap-2 p-0">
          {message.strengths.map((item) => (
            <li key={item} className={CV_ASSISTANT_LIST_ITEM_STRENGTH}>
              <Check
                className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500"
                strokeWidth={2.5}
                aria-hidden
              />
              <span>{item}</span>
            </li>
          ))}
        </ul>

        <p className="m-0 mt-5 text-sm font-semibold leading-5 text-[var(--admin-text)]">
          {message.improvementsTitle}
        </p>
        <ul className="m-0 mt-2.5 flex list-none flex-col gap-2 p-0">
          {message.improvements.map((item) => (
            <li key={item} className={CV_ASSISTANT_LIST_ITEM_IMPROVE}>
              <span
                className="mt-2 h-2 w-2 shrink-0 rounded-full bg-amber-500"
                aria-hidden
              />
              <span>{item}</span>
            </li>
          ))}
        </ul>

        <p className="m-0 mt-5 text-sm leading-6 sm:text-[15px]">{message.closing}</p>
      </article>
    </div>
  );
};

export default AiAssistantMessage;
