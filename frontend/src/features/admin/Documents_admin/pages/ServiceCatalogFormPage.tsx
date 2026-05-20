import { FunctionComponent, useEffect, useState } from 'react';

import { useNavigate, useParams } from 'react-router-dom';

import { useTranslation } from 'react-i18next';

import AdminModulePageShell from '../../ui/AdminModulePageShell';

import AdminBackButton from '../../ui/AdminBackButton';

import ServiceCatalogForm from '../components/service-catalog/ServiceCatalogForm';

import DocumentsPageSkeleton from '../components/skeletons/DocumentsPageSkeleton';

import { createEmptyServicePayload, DEFAULT_SERVICE_CONFIG } from '../data/serviceCatalogDefaults';

import { saveServiceCatalog, useServiceCatalogDetail } from '../hooks/useServiceCatalog';

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

      await saveServiceCatalog(isEdit ? id : undefined, form);

      goCatalog();

    } finally {

      setSaving(false);

    }

  };



  if (loading && isEdit) {

    return (

      <AdminModulePageShell width="wide">

        <DocumentsPageSkeleton />

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

          saving={saving}

          onCancel={goCatalog}

          onSave={handleSave}

        />

      </div>

    </AdminModulePageShell>

  );

};



export default ServiceCatalogFormPage;


