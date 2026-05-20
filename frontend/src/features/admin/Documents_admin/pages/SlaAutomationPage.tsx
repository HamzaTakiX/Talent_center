import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import DocumentsSubPageLayout from '../components/DocumentsSubPageLayout';
import { useSlaRules } from '../hooks/useDocumentsAdmin';

const SlaAutomationPage: FunctionComponent = () => {
  const { t } = useTranslation();
  const { items, loading } = useSlaRules();

  return (
    <DocumentsSubPageLayout
      title={t('admin.documentsModule.sla.title')}
      subtitle={t('admin.documentsModule.sla.subtitle')}
    >
      <div className="flex flex-col gap-3">
        {loading
          ? null
          : items.map((rule) => (
              <article key={rule.id} className="admin-doc-panel flex flex-wrap items-center justify-between gap-2">
                <div>
                  <strong>{rule.name}</strong>
                  {rule.documentTypeCode && (
                    <span className="ms-2 text-xs text-[var(--admin-text-secondary)]">
                      {rule.documentTypeCode}
                    </span>
                  )}
                </div>
                <span className="text-sm">
                  SLA {rule.slaHours}h · Escalade {rule.escalationHours}h
                </span>
              </article>
            ))}
      </div>
    </DocumentsSubPageLayout>
  );
};

export default SlaAutomationPage;
