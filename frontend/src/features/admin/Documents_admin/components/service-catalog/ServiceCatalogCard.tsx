import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, Download, Pencil, Store } from 'lucide-react';
import type { DocumentServiceCatalogItem } from '../../types/documentServiceCatalog';
import { resolveServiceIcon } from './serviceCatalogIcons';

interface Props {
  service: DocumentServiceCatalogItem;
  /** Aperçu studio — masque l’action d’édition */
  preview?: boolean;
}

const ServiceCatalogCard: FunctionComponent<Props> = ({ service, preview = false }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const Icon = resolveServiceIcon(service.iconKey);

  return (
    <article
      className={`admin-doc-svc-card admin-doc-svc-card--${service.colorTheme} ${!service.isActive ? 'admin-doc-svc-card--inactive' : ''}`}
    >
      <div className="admin-doc-svc-card__head">
        <span className="admin-doc-svc-card__icon" aria-hidden>
          <Icon className="h-6 w-6" strokeWidth={1.5} />
        </span>
        <div className="admin-doc-svc-card__meta">
          <h3 className="admin-doc-svc-card__title">{service.name}</h3>
          <code className="admin-doc-svc-card__code">{service.code}</code>
        </div>
        {!preview ? (
          <button
            type="button"
            className="admin-doc-svc-card__edit"
            onClick={() => navigate(`/admin/documents/catalog/${service.id}/edit`)}
            aria-label={t('admin.documentsModule.catalog.actions.edit')}
          >
            <Pencil className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      <p className="admin-doc-svc-card__desc">{service.description}</p>

      <div className="admin-doc-svc-card__badges">
        {service.onlineEnabled && (
          <span className="admin-doc-svc-badge admin-doc-svc-badge--online">
            <Download className="h-3 w-3" />
            {t('admin.documentsModule.catalog.badges.online')}
          </span>
        )}
        {service.physicalEnabled && (
          <span className="admin-doc-svc-badge admin-doc-svc-badge--physical">
            <Store className="h-3 w-3" />
            {t('admin.documentsModule.catalog.badges.physical')}
          </span>
        )}
        {service.reservationRequired && (
          <span className="admin-doc-svc-badge admin-doc-svc-badge--reserve">
            <Calendar className="h-3 w-3" />
            {t('admin.documentsModule.catalog.badges.reservation')}
          </span>
        )}
        {service.autoGenerate && (
          <span className="admin-doc-svc-badge admin-doc-svc-badge--auto">
            {t('admin.documentsModule.catalog.badges.autoGen')}
          </span>
        )}
      </div>

      <footer className="admin-doc-svc-card__footer">
        <span className="admin-doc-svc-card__sla">
          <Clock className="h-3.5 w-3.5" />
          {t('admin.documentsModule.catalog.estimatedDelay', {
            hours: service.estimatedHours,
          })}
        </span>
        <span className="admin-doc-svc-card__sla-hint">
          SLA {service.slaHours}h
        </span>
      </footer>
    </article>
  );
};

export default ServiceCatalogCard;
