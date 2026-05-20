import { FunctionComponent } from 'react';
import { RefreshCw, Sparkles } from 'lucide-react';
import {
  CV_ASSISTANT_REFRESH_BUTTON,
  CV_ASSISTANT_SUGGESTION_PILL,
} from '../../constants/cvAiAssistantStyles';

interface SuggestedQuestionsProps {
  questions: string[];
}

const SuggestedQuestions: FunctionComponent<SuggestedQuestionsProps> = ({ questions }) => {
  return (
    <section className="min-w-0" aria-label="Suggested questions">
      <p className="m-0 flex items-center gap-2 text-sm font-semibold leading-5 text-[#334155]">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#f3e8ff] text-[#7c3aed]">
          <Sparkles className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
        </span>
        Suggested questions
      </p>
      <div className="mt-3.5 flex min-w-0 flex-wrap items-center gap-2 sm:gap-2.5">
        {questions.map((question) => (
          <button key={question} type="button" className={CV_ASSISTANT_SUGGESTION_PILL}>
            {question}
          </button>
        ))}
        <button
          type="button"
          className={CV_ASSISTANT_REFRESH_BUTTON}
          aria-label="Refresh suggested questions"
        >
          <RefreshCw className="h-4 w-4" strokeWidth={1.75} aria-hidden />
        </button>
      </div>
    </section>
  );
};

export default SuggestedQuestions;
