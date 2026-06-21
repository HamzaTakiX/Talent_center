import { FunctionComponent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  AlertCircle,
  Calendar,
  ChevronRight,
  FileText,
  GraduationCap,
  Sparkles,
  Upload,
  Video,
} from 'lucide-react';
import type { JourneyActionItem } from '../../types/journeyTypes';

const ACTION_ICONS: Record<string, typeof AlertCircle> = {
  complete_profile: GraduationCap,
  upload_cv: Upload,
  prepare_interview: Video,
  track_application: FileText,
  upcoming_interview: Calendar,
};

interface InternshipActionItemsPanelProps {
  items: JourneyActionItem[];
}

const InternshipActionItemsPanel: FunctionComponent<InternshipActionItemsPanelProps> = ({ items }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  if (items.length === 0) return null;

  return (
    <section
      aria-label={t('student.internshipOffers.journey.actionsAria')}
      className="admin-module-panel flex w-full min-w-0 flex-col gap-3 p-4 sm:p-5"
    >
      <div className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 shrink-0 text-[var(--admin-brand)]" strokeWidth={1.75} aria-hidden />
        <h2 className="m-0 text-base font-semibold text-[var(--admin-text)] sm:text-lg">
          {t('student.internshipOffers.journey.actionsTitle')}
        </h2>
      </div>

      <ul className="m-0 flex list-none flex-col gap-2 p-0">
        {items.map((item, index) => {
          const Icon = ACTION_ICONS[item.type] ?? AlertCircle;
          const isHigh = item.priority === 'high';
          return (
            <li key={`${item.type}-${index}`}>
              <button
                type="button"
                onClick={() => navigate(item.href)}
                className={`flex w-full min-w-0 items-center gap-3 rounded-xl border px-3.5 py-3 text-left transition-colors sm:px-4 ${
                  isHigh
                    ? 'border-[color-mix(in_srgb,var(--admin-brand)_35%,var(--admin-border))] bg-[color-mix(in_srgb,var(--admin-brand)_8%,var(--admin-bg-elevated))] hover:bg-[color-mix(in_srgb,var(--admin-brand)_12%,var(--admin-bg-elevated))]'
                    : 'border-[var(--admin-border)] bg-[var(--admin-bg-elevated)] hover:bg-[var(--admin-bg-subtle)]'
                }`}
              >
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                    isHigh ? 'bg-[var(--admin-brand-muted)] text-[var(--admin-brand)]' : 'bg-[var(--admin-surface-inset)] text-[var(--admin-text-secondary)]'
                  }`}
                >
                  <Icon className="h-[18px] w-[18px]" strokeWidth={1.75} aria-hidden />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-[var(--admin-text)]">
                    {t(`student.internshipOffers.journey.actions.${item.title_key}`, {
                      offer: item.offer_title ?? '',
                    })}
                  </span>
                  {item.scheduled_at && (
                    <span className="mt-0.5 block text-xs text-[var(--admin-text-muted)]">
                      {new Date(item.scheduled_at).toLocaleString()}
                    </span>
                  )}
                </span>
                <ChevronRight className="h-4 w-4 shrink-0 text-[var(--admin-text-muted)]" aria-hidden />
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
};

export default InternshipActionItemsPanel;
