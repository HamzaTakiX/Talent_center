import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, Info, Sparkles } from 'lucide-react';
import type { SmartInsight } from '../../types/createOfferWorkflow';

const PREFIX = 'admin.forms.createOfferStudio.insights';

interface CreateOfferInsightsProps {
  insights: SmartInsight[];
}

const iconMap = {
  info: Info,
  warning: AlertTriangle,
  success: Sparkles,
};

const CreateOfferInsights: FunctionComponent<CreateOfferInsightsProps> = ({ insights }) => {
  const { t } = useTranslation();

  return (
    <div className="offer-insights">
      <p className="mb-1 text-[0.7rem] font-bold uppercase tracking-wide text-[var(--admin-text-muted)]">
        {t(`${PREFIX}.title`)}
      </p>
      {insights.map((insight) => {
        const Icon = iconMap[insight.type];
        return (
          <div key={insight.id} className={`offer-insight offer-insight--${insight.type}`}>
            <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
            <span>{t(`${PREFIX}.${insight.message}`)}</span>
          </div>
        );
      })}
    </div>
  );
};

export default CreateOfferInsights;
