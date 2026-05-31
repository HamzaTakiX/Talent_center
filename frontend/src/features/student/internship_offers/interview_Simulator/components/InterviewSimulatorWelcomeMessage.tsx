import { FunctionComponent } from 'react';
import { Users } from 'lucide-react';
import { IS_AVATAR_ICON, IS_MESSAGE_BUBBLE } from '../constants/interviewSimulatorStyles';

interface InterviewSimulatorWelcomeMessageProps {
  paragraphs: string[];
}

const InterviewSimulatorWelcomeMessage: FunctionComponent<InterviewSimulatorWelcomeMessageProps> = ({
  paragraphs,
}) => {
  return (
    <div className="flex min-w-0 items-start gap-3 sm:gap-4">
      <span className={IS_AVATAR_ICON} aria-hidden>
        <Users className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={1.75} />
      </span>
      <article className={IS_MESSAGE_BUBBLE}>
        {paragraphs.map((text, index) => (
          <p
            key={text}
            className={`m-0 text-sm leading-6 sm:text-[15px] sm:leading-7 ${
              index > 0 ? 'mt-4 max-[429px]:mt-3' : ''
            }`}
          >
            {text}
          </p>
        ))}
      </article>
    </div>
  );
};

export default InterviewSimulatorWelcomeMessage;
