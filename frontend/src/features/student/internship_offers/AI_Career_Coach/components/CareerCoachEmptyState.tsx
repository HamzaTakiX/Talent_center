import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import InternshipAssistantBot from '../../components/InternshipAssistantBot';
import type { CoachModeConfig } from '../types/careerCoach';

interface CareerCoachEmptyStateProps {
  modeConfig: CoachModeConfig;
  onPromptClick: (labelKey: string) => void;
}

const CareerCoachEmptyState: FunctionComponent<CareerCoachEmptyStateProps> = ({
  modeConfig,
  onPromptClick,
}) => {
  const { t } = useTranslation();
  const question = t('student.internshipOffers.careerCoach.empty.title');

  return (
    <div className="sr-acc-empty" key={modeConfig.introKey}>
      <div className="sr-acc-empty__dialogue">
        <div className="sr-acc-empty__thought">
          <div
            className="sr-acc-empty__speech"
            id="sr-acc-empty-question"
            role="status"
            aria-live="polite"
          >
            <span className="sr-acc-empty__think" aria-hidden>
              <span />
              <span />
              <span />
            </span>
            <p className="sr-acc-empty__speech-text">{question}</p>
          </div>
          <div className="sr-acc-empty__trail" aria-hidden>
            <span />
            <span />
          </div>
        </div>
        <div className="sr-acc-empty__bot-wrap">
          <div className="sr-acc-empty__bot-glow" aria-hidden />
          <InternshipAssistantBot
            variant="full"
            showBubble={false}
            animated
            className="sr-acc-bot sr-acc-bot--empty sr-acc-empty__bot"
            ariaLabel={question}
          />
        </div>
      </div>
      <p className="sr-cva-state__desc">{t(modeConfig.emptyHintKey)}</p>
      <div className="sr-cva-quick-actions sr-acc-empty__prompts">
        {modeConfig.prompts.map((prompt) => (
          <button
            key={prompt.id}
            type="button"
            className="sr-cva-quick-btn"
            onClick={() => onPromptClick(prompt.labelKey)}
          >
            {t(prompt.labelKey)}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CareerCoachEmptyState;
