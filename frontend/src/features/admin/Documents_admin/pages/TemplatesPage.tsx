import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import DocumentsSubPageLayout from '../components/DocumentsSubPageLayout';
import DocumentsPremiumEmpty from '../components/DocumentsPremiumEmpty';
import { useDocumentTemplates } from '../hooks/useDocumentsAdmin';

const TemplatesPage: FunctionComponent = () => {
  const { t } = useTranslation();
  const { items, loading } = useDocumentTemplates();

  return (
    <DocumentsSubPageLayout
      title={t('admin.documentsModule.templates.title')}
      subtitle={t('admin.documentsModule.templates.subtitle')}
    >
      {!loading && items.length === 0 ? (
        <DocumentsPremiumEmpty variant="templates" />
      ) : (
        <div className="admin-doc-table">
          {items.map((tpl) => (
            <div
              key={tpl.id}
              className="admin-doc-table__row"
              style={{ gridTemplateColumns: '1fr 1fr 80px 1fr', cursor: 'default' }}
            >
              <span>{tpl.name}</span>
              <span>{tpl.documentTypeCode}</span>
              <span>{tpl.language}</span>
              <span className="text-xs text-[var(--admin-text-secondary)]">
                {tpl.placeholders.join(', ')}
              </span>
            </div>
          ))}
        </div>
      )}
    </DocumentsSubPageLayout>
  );
};

export default TemplatesPage;
