import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, Circle, Loader2, SkipForward } from 'lucide-react';
import type { WorkflowStep } from '../types';

interface Props {
  steps: WorkflowStep[];
}

const DocumentsWorkflowTimeline: FunctionComponent<Props> = ({ steps }) => {
  const { t } = useTranslation();

  const iconFor = (status: WorkflowStep['status']) => {
    if (status === 'completed') return <Check className="h-4 w-4" />;
    if (status === 'in_progress') return <Loader2 className="h-4 w-4 animate-spin" />;
    if (status === 'skipped') return <SkipForward className="h-4 w-4" />;
    return <Circle className="h-4 w-4" />;
  };

  return (
    <ol className="admin-doc-timeline">
      {steps.map((step, idx) => (
        <li
          key={step.id}
          className={`admin-doc-timeline__step admin-doc-timeline__step--${step.status}`}
        >
          <span className="admin-doc-timeline__marker">{iconFor(step.status)}</span>
          <div className="admin-doc-timeline__body">
            <strong>{t(step.labelKey)}</strong>
            {step.performedAt && (
              <small>
                {step.performedBy ? `${step.performedBy} · ` : ''}
                {new Date(step.performedAt).toLocaleString()}
              </small>
            )}
            {step.notes && <p>{step.notes}</p>}
          </div>
          {idx < steps.length - 1 && <span className="admin-doc-timeline__connector" />}
        </li>
      ))}
    </ol>
  );
};

export default DocumentsWorkflowTimeline;
