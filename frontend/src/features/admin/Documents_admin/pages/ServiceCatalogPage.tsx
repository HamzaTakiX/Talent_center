import { FunctionComponent, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Plus, Sparkles } from 'lucide-react';
import AdminModulePageShell from '../../ui/AdminModulePageShell';
import { AdminSearchInput, AdminSelectField } from '../../ui';
import AdminToggle from '../../account/components/AdminToggle';
import ServiceCatalogCard from '../components/service-catalog/ServiceCatalogCard';
import DocumentsPremiumEmpty from '../components/DocumentsPremiumEmpty';
import { seedServiceCatalog, useServiceCatalogList } from '../hooks/useServiceCatalog';
import '../styles/admin-documents.css';

const ServiceCatalogPage: FunctionComponent = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { items, loading, refresh } = useServiceCatalogList();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [activeOnly, setActiveOnly] = useState(false);

  const filtered = useMemo(() => {
    let list = items;
    if (activeOnly) list = list.filter((s) => s.isActive);
    if (category) list = list.filter((s) => s.category === category);
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.code.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q),
      );
    }
    return list;
  }, [items, search, category, activeOnly]);

  const handleSeed = async () => {
    await seedServiceCatalog();
    refresh();
  };

  return (
    <AdminModulePageShell width="wide">
      <div className="admin-doc-workspace admin-doc-catalog-page" data-admin-search-id="documents-catalog">
        <header className="admin-doc-hero">
          <div className="admin-doc-hero__content">
            <span className="admin-doc-hero__badge">
              <Sparkles className="h-3.5 w-3.5" aria-hidden />
              {t('admin.documentsModule.catalog.badge')}
            </span>
            <h1 className="admin-doc-hero__title">{t('admin.documentsModule.catalog.title')}</h1>
            <p className="admin-doc-hero__subtitle">{t('admin.documentsModule.catalog.subtitle')}</p>
          </div>
          <div className="admin-doc-catalog-hero__actions">
            <button
              type="button"
              className="admin-btn-secondary inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium"
              onClick={handleSeed}
            >
              {t('admin.documentsModule.catalog.actions.seed')}
            </button>
            <button
              type="button"
              className="admin-btn-primary inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold"
              onClick={() => navigate('/admin/documents/catalog/create')}
            >
              <Plus className="h-4 w-4" aria-hidden />
              {t('admin.documentsModule.catalog.actions.create')}
            </button>
          </div>
        </header>

        <section className="admin-doc-catalog-filters">
          <div className="admin-doc-catalog-filters__head">
            <AdminSearchInput
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('admin.documentsModule.catalog.filters.search')}
              className="admin-doc-catalog-filters__search"
            />
          </div>
          <div className="admin-doc-catalog-filters__panel">
            <AdminSelectField
              aria-label={t('admin.documentsModule.catalog.filters.category')}
              value={category}
              onChange={setCategory}
              options={[
                { value: '', label: t('admin.documentsModule.catalog.filters.allCategories') },
                { value: 'ATTESTATION', label: t('admin.documentsModule.catalog.categories.ATTESTATION') },
                { value: 'CONVENTION', label: t('admin.documentsModule.catalog.categories.CONVENTION') },
                { value: 'CERTIFICATE', label: t('admin.documentsModule.catalog.categories.CERTIFICATE') },
                { value: 'REPORT', label: t('admin.documentsModule.catalog.categories.REPORT') },
              ]}
            />
          </div>
          <div className="admin-doc-catalog-filters__toggles">
            <AdminToggle
              id="documents-catalog-active-only"
              label={t('admin.documentsModule.catalog.filters.activeOnly')}
              checked={activeOnly}
              onChange={setActiveOnly}
            />
          </div>
        </section>

        {loading ? (
          <div className="admin-doc-svc-grid admin-doc-svc-grid--loading">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="admin-doc-svc-card admin-doc-svc-card--skeleton" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <DocumentsPremiumEmpty variant="requests" />
        ) : (
          <div className="admin-doc-svc-grid">
            {filtered.map((service) => (
              <ServiceCatalogCard key={service.id} service={service} />
            ))}
          </div>
        )}
      </div>
    </AdminModulePageShell>
  );
};

export default ServiceCatalogPage;
