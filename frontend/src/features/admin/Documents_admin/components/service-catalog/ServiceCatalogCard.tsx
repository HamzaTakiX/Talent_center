import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, Download, Eye, Pencil, Store } from 'lucide-react';
import type { DocumentServiceCatalogItem } from '../../types/documentServiceCatalog';
import { resolveServiceIcon } from './serviceCatalogIcons';
import { isCustomServiceColor, serviceAccentStyle } from './serviceCatalogColor';

interface Props {
  service: DocumentServiceCatalogItem;
  /** Aperçu studio — masque l’action d’édition */
  preview?: boolean;
  /** Portail étudiant — icône voir en haut à droite (comme l’édition admin) */
  onView?: (id: string) => void;
  viewAriaLabel?: string;
}

const ServiceCatalogCard: FunctionComponent<Props> = ({
  service,
  preview = false,
  onView,
  viewAriaLabel,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const Icon = resolveServiceIcon(service.iconKey);
  const customColor = isCustomServiceColor(service.colorTheme);
  const showAdminEdit = !preview && !onView;
  const showStudentView = !preview && Boolean(onView);

  return (
    <article
      className={`admin-doc-svc-card ${customColor ? '' : `admin-doc-svc-card--${service.colorTheme}`} ${!service.isActive ? 'admin-doc-svc-card--inactive' : ''}`}
    >
      <div className="admin-doc-svc-card__head">
        <span className="admin-doc-svc-card__icon" style={serviceAccentStyle(service.colorTheme)} aria-hidden>
          <Icon className="h-6 w-6" strokeWidth={1.5} />
        </span>
        <div className="admin-doc-svc-card__meta">
          <h3 className="admin-doc-svc-card__title">{service.name}</h3>
          <code className="admin-doc-svc-card__code">{service.code}</code>
        </div>
        {showAdminEdit ? (
          <button
            type="button"
            className="admin-doc-svc-card__edit"
            onClick={() => navigate(`/admin/documents/catalog/${service.id}/edit`)}
            aria-label={t('admin.documentsModule.catalog.actions.edit')}
          >
            <Pencil className="h-4 w-4" />
          </button>
        ) : null}
        {showStudentView ? (
          <button
            type="button"
            className="admin-doc-svc-card__edit"
            onClick={() => onView?.(service.id)}
            aria-label={viewAriaLabel ?? t('student.documents.viewAria')}
          >
            <Eye className="h-4 w-4" />
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
        {showStudentView && service.studentRequest?.mode !== 'auto_generate' && service.studentRequest?.isPending ? (
          <span className="admin-doc-svc-badge admin-doc-svc-badge--pending">
            {t('student.documents.requestStatus.badgePending')}
          </span>
        ) : null}
        {showStudentView && service.studentRequest?.mode !== 'auto_generate' && service.studentRequest?.hasRequest && !service.studentRequest.isPending ? (
          <span className="admin-doc-svc-badge admin-doc-svc-badge--requested">
            {t('student.documents.requestStatus.badgeSubmitted')}
          </span>
        ) : null}
        {showStudentView && service.studentRequest?.mode === 'auto_generate' && service.studentRequest?.hasGeneratedOutput ? (
          <span className="admin-doc-svc-badge admin-doc-svc-badge--ready">
            {t('student.documents.generate.badgeReady')}
          </span>
        ) : null}
      </div>

      <footer className="admin-doc-svc-card__footer">
        <span className="admin-doc-svc-card__sla">
          <Clock className="h-3.5 w-3.5" />
          {t('admin.documentsModule.catalog.estimatedDelay', {
            hours: service.estimatedHours,
          })}
        </span>
        <span className="admin-doc-svc-card__sla-hint">SLA {service.slaHours}h</span>
      </footer>
    </article>
  );
};

export default ServiceCatalogCard;
