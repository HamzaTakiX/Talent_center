import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2, Save, X } from 'lucide-react';

interface Props {
  onCancel: () => void;
  onSave: () => void;
  saving: boolean;
  disabled: boolean;
}

const ServiceCatalogStudioFooter: FunctionComponent<Props> = ({
  onCancel,
  onSave,
  saving,
  disabled,
}) => {
  const { t } = useTranslation();

  return (
    <footer className="admin-doc-studio-footer">
      <p className="admin-doc-studio-footer__hint">
        {t('admin.documentsModule.catalog.form.studio.footerHint')}
      </p>
      <div className="admin-doc-studio-footer__actions">
        <button type="button" className="admin-doc-studio-btn admin-doc-studio-btn--ghost" onClick={onCancel}>
          <X className="h-4 w-4" aria-hidden />
          {t('admin.common.actions.cancel')}
        </button>
        <button
          type="button"
          className="admin-doc-studio-btn admin-doc-studio-btn--primary"
          disabled={disabled || saving}
          onClick={onSave}
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          ) : (
            <Save className="h-4 w-4" aria-hidden />
          )}
          {saving
            ? t('admin.documentsModule.catalog.form.saving')
            : t('admin.common.actions.save')}
        </button>
      </div>
    </footer>
  );
};

export default ServiceCatalogStudioFooter;
