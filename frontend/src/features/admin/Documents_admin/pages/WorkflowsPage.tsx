import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import DocumentsSubPageLayout from '../components/DocumentsSubPageLayout';
import DocumentsWorkflowTimeline from '../components/DocumentsWorkflowTimeline';
import { useDocumentWorkflows } from '../hooks/useDocumentsAdmin';

const WorkflowsPage: FunctionComponent = () => {
  const { t } = useTranslation();
  const { items, loading } = useDocumentWorkflows();

  return (
    <DocumentsSubPageLayout
      title={t('admin.documentsModule.workflows.title')}
      subtitle={t('admin.documentsModule.workflows.subtitle')}
    >
      {loading ? (
        <div className="admin-doc-skeleton__kpi-card" style={{ minHeight: 120 }} />
      ) : (
        <div className="flex flex-col gap-6">
          {items.map((wf) => (
            <section key={wf.id} className="admin-doc-panel">
              <h2 className="mb-3 font-semibold">{wf.documentTypeCode}</h2>
              <DocumentsWorkflowTimeline
                steps={wf.steps.map((s, i) => ({
                  id: `${wf.id}-${s.code}`,
                  code: s.code,
                  labelKey: s.labelKey,
                  status: i === 0 ? 'completed' : 'pending',
                }))}
              />
            </section>
          ))}
        </div>
      )}
    </DocumentsSubPageLayout>
  );
};

export default WorkflowsPage;
