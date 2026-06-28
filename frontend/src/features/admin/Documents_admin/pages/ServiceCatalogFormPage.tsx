import { FunctionComponent, useEffect, useState } from 'react';

import { useNavigate, useParams } from 'react-router-dom';

import { useTranslation } from 'react-i18next';

import AdminModulePageShell from '../../ui/AdminModulePageShell';

import AdminBackButton from '../../ui/AdminBackButton';

import ServiceCatalogForm from '../components/service-catalog/ServiceCatalogForm';

import ServiceCatalogFormSkeleton from '../components/skeletons/ServiceCatalogFormSkeleton';

import { createEmptyServicePayload, DEFAULT_SERVICE_CONFIG } from '../data/serviceCatalogDefaults';
import { generateServiceCode } from '../components/service-catalog/generateServiceCode';

import { saveServiceCatalog, useServiceCatalogDetail } from '../hooks/useServiceCatalog';
import { adminDocumentsApi } from '../../api/documents';

import type { DocumentServiceWritePayload } from '../types/documentServiceCatalog';

import '../styles/admin-documents.css';



const ServiceCatalogFormPage: FunctionComponent = () => {

  const { id } = useParams<{ id: string }>();

  const isEdit = Boolean(id);

  const navigate = useNavigate();

  const { t } = useTranslation();

  const { data, loading } = useServiceCatalogDetail(isEdit ? id : undefined);

  const [form, setForm] = useState<DocumentServiceWritePayload>(createEmptyServicePayload());

  const [saving, setSaving] = useState(false);
  const [pendingTemplateFile, setPendingTemplateFile] = useState<File | null>(null);



  useEffect(() => {

    if (data) {

      setForm({

        code: data.code,

        name: data.name,

        description: data.description,

        category: data.category,

        iconKey: data.iconKey,

        colorTheme: data.colorTheme,

        config: data.config ?? structuredClone(DEFAULT_SERVICE_CONFIG),

      });

    }

  }, [data]);



  const goCatalog = () => navigate('/admin/documents/catalog');



  const handleSave = async () => {

    setSaving(true);

    try {

      const payload = {
        ...form,
        code: form.code.trim() || generateServiceCode(form.name),
      };
      const saved = await saveServiceCatalog(isEdit ? id : undefined, payload);
      const targetId = saved?.id ?? id;
      if (
        pendingTemplateFile
        && targetId
        && form.config.availability.autoGenerateEnabled
      ) {
        const updated = await adminDocumentsApi.catalogUploadTemplateFile(targetId, pendingTemplateFile);
        if (updated.config?.template) {
          setForm((current) => ({
            ...current,
            config: { ...current.config, template: updated.config?.template },
          }));
        }
      }

      goCatalog();

    } finally {

      setSaving(false);

    }

  };



  if (loading && isEdit) {

    return (

      <AdminModulePageShell width="wide">

        <ServiceCatalogFormSkeleton />

      </AdminModulePageShell>

    );

  }



  return (

    <AdminModulePageShell width="wide">

      <div className="admin-doc-studio-page" data-admin-search-id="documents-catalog-create">

        <AdminBackButton

          onClick={goCatalog}

          label={t('admin.documentsModule.catalog.actions.backToCatalog')}

          className="mb-2 w-fit shrink-0 !rounded-lg"

        />

        <ServiceCatalogForm

          value={form}

          onChange={setForm}

          isEdit={isEdit}

          serviceId={id}

          saving={saving}

          onPendingTemplateFileChange={setPendingTemplateFile}

          onCancel={goCatalog}

          onSave={handleSave}

        />

      </div>

    </AdminModulePageShell>

  );

};



export default ServiceCatalogFormPage;


