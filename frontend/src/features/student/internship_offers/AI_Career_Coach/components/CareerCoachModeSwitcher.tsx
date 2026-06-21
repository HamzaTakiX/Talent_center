import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import type { CoachMode } from '../types/careerCoach';
import { COACH_MODES } from '../types/careerCoach';

interface CareerCoachModeSwitcherProps {
  mode: CoachMode;
  onModeChange: (mode: CoachMode) => void;
}

const CareerCoachModeSwitcher: FunctionComponent<CareerCoachModeSwitcherProps> = ({
  mode,
  onModeChange,
}) => {
  const { t } = useTranslation();

  return (
    <div className="sr-acc-modes" role="tablist" aria-label={t('student.internshipOffers.careerCoach.modes.aria')}>
      {COACH_MODES.map((m) => (
        <button
          key={m}
          type="button"
          role="tab"
          aria-selected={mode === m}
          className={`sr-acc-modes__chip${mode === m ? ' sr-acc-modes__chip--active' : ''}`}
          onClick={() => onModeChange(m)}
        >
          {t(`student.internshipOffers.careerCoach.modes.${m}`)}
        </button>
      ))}
    </div>
  );
};

export default CareerCoachModeSwitcher;
