import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { Bot } from 'lucide-react';
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

  return (
    <div className="sr-acc-empty" key={modeConfig.introKey}>
      <div className="sr-acc-empty__illustration" aria-hidden>
        <div className="sr-acc-empty__orb">
          <Bot className="h-10 w-10 text-[var(--admin-brand)]" strokeWidth={1.5} />
        </div>
      </div>
      <h2 className="sr-acc-empty__title">{t('student.internshipOffers.careerCoach.empty.title')}</h2>
      <p className="sr-acc-empty__hint">{t(modeConfig.emptyHintKey)}</p>
      <div className="sr-acc-empty__prompts">
        {modeConfig.prompts.map((prompt) => (
          <button
            key={prompt.id}
            type="button"
            className="sr-acc-empty__prompt"
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
