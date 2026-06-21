import { FunctionComponent, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, CheckCircle2, ChevronRight } from 'lucide-react';
import type { CreateOfferFormState, WizardStep } from '../../types/createOfferWorkflow';
import { buildValidationChecklist, type ValidationChecklistItem } from './reviewOfferHelpers';

const PREFIX = 'admin.forms.createOfferStudio.review.validationCenter';
const SECTION_PREFIX = 'admin.forms.createOfferStudio.review.completion.sections';

interface OfferValidationCenterProps {
  form: CreateOfferFormState;
  onNavigateToStep: (step: WizardStep) => void;
}

function ChecklistRow({
  item,
  onNavigate,
}: {
  item: ValidationChecklistItem;
  onNavigate: (step: WizardStep) => void;
}) {
  const { t } = useTranslation();

  return (
    <li>
      <button type="button" className="offer-validation-row" onClick={() => onNavigate(item.step)}>
        {item.complete ? (
          <CheckCircle2 className="offer-validation-row__icon offer-validation-row__icon--ok" aria-hidden />
        ) : (
          <AlertTriangle className="offer-validation-row__icon offer-validation-row__icon--warn" aria-hidden />
        )}
        <span className="offer-validation-row__label">{t(`${SECTION_PREFIX}.${item.id}`)}</span>
        <span
          className={`offer-validation-row__status ${item.complete ? 'offer-validation-row__status--ok' : 'offer-validation-row__status--warn'}`}
        >
          {item.complete ? t(`${PREFIX}.statusCompleted`) : t(`${PREFIX}.statusMissing`)}
        </span>
        <ChevronRight className="offer-validation-row__chevron" aria-hidden />
      </button>
    </li>
  );
}

const OfferValidationCenter: FunctionComponent<OfferValidationCenterProps> = ({
  form,
  onNavigateToStep,
}) => {
  const { t } = useTranslation();
  const checklist = useMemo(() => buildValidationChecklist(form), [form]);

  const completed = checklist.filter((item) => item.complete);
  const missing = checklist.filter((item) => !item.complete);
  const total = checklist.length;
  const completedCount = completed.length;
  const percent = total > 0 ? Math.round((completedCount / total) * 100) : 0;

  return (
    <section className="offer-validation-center" aria-labelledby="offer-validation-center-title">
      <header className="offer-validation-center__header">
        <div className="offer-validation-center__summary">
          <h4 id="offer-validation-center-title" className="offer-validation-center__title">
            {t(`${PREFIX}.title`)}
          </h4>
          <p className="offer-validation-center__subtitle">
            {t(`${PREFIX}.sectionsCompleted`, { completed: completedCount, total })}
          </p>
        </div>
        <div className="offer-validation-center__progress-wrap">
          <span className="offer-validation-center__percent">
            {t(`${PREFIX}.percentComplete`, { percent })}
          </span>
          <div
            className="offer-validation-center__progress"
            role="progressbar"
            aria-valuenow={percent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={t(`${PREFIX}.percentComplete`, { percent })}
          >
            <div className="offer-validation-center__progress-fill" style={{ width: `${percent}%` }} />
          </div>
        </div>
      </header>

      <div className="offer-validation-center__body">
        {completed.length > 0 && (
          <div className="offer-validation-center__group">
            <h5 className="offer-validation-center__group-title">{t(`${PREFIX}.completedSections`)}</h5>
            <ul className="offer-validation-center__list">
              {completed.map((item) => (
                <ChecklistRow key={item.id} item={item} onNavigate={onNavigateToStep} />
              ))}
            </ul>
          </div>
        )}

        {missing.length > 0 && (
          <div className="offer-validation-center__group">
            <h5 className="offer-validation-center__group-title offer-validation-center__group-title--warn">
              {t(`${PREFIX}.missingSections`)}
            </h5>
            <ul className="offer-validation-center__list">
              {missing.map((item) => (
                <ChecklistRow key={item.id} item={item} onNavigate={onNavigateToStep} />
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
};

export default OfferValidationCenter;
