import { FunctionComponent } from 'react';
import { Inbox } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface EncadrantReportsSourceBannerProps {
  count: number;
  loading?: boolean;
}

const EncadrantReportsSourceBanner: FunctionComponent<EncadrantReportsSourceBannerProps> = ({
  count,
  loading = false,
}) => {
  const { t } = useTranslation();

  return (
    <div
      className="flex items-start gap-3 rounded-lg border border-[var(--admin-border)] bg-[var(--admin-bg-elevated)] px-4 py-3 text-sm text-[var(--admin-text-secondary)] sm:items-center"
      role="status"
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--admin-border)] bg-[var(--admin-bg)] text-[var(--admin-brand)]">
        <Inbox className="h-4 w-4" strokeWidth={1.75} aria-hidden />
      </span>
      <p className="min-w-0 leading-relaxed">
        {loading
          ? t('admin.modules.reports.source.loading', {
              defaultValue: 'Chargement des rapports soumis par les encadrants…',
            })
          : count > 0
            ? t('admin.modules.reports.source.received', {
                defaultValue:
                  '{{count}} rapport(s) reçu(s) des encadrants. Consultez, filtrez et validez les soumissions.',
                count,
              })
            : t('admin.modules.reports.source.empty', {
                defaultValue:
                  'Aucun rapport pour le moment. Les rapports apparaîtront ici dès qu’un encadrant les soumet pour un étudiant.',
              })}
      </p>
    </div>
  );
};

export default EncadrantReportsSourceBanner;
