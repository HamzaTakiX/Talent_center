import {
  FunctionComponent,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Eye, ExternalLink, Loader2, Pencil } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import AdminModal from '../../ui/AdminModal';
import { adminBadgeClass } from '../../ui/adminStatusBadges';
import {
  adminFormBtnPrimaryClass,
  adminFormBtnSecondaryClass,
} from '../../shared/forms/adminFormClasses';
import { stageApi } from '../../../shared/api/stageApi';
import type { StageApplication, StageOfferDetail } from '../../../shared/types/stageTypes';
import type { InternshipOffer } from '../types';
import {
  buildOfferDetailViewModel,
  type OfferDetailNavSection,
  type OfferDetailViewModel,
} from '../utils/offerDetailViewModel';
import { parseAdminApiError } from '../../shared/utils/parseAdminApiError';
import '../styles/offer-detail-modal.css';

const PREFIX = 'admin.modules.offers.viewDetail';
const STUDIO_PREFIX = 'admin.forms.createOfferStudio';

interface InternshipOfferDetailModalProps {
  open: boolean;
  offer: InternshipOffer | null;
  onClose: () => void;
  onEdit: (id: string) => void;
}

const NAV_SECTIONS: OfferDetailNavSection[] = [
  'overview',
  'description',
  'skills',
  'targeting',
  'recruitment',
  'publication',
  'applications',
  'import',
  'audit',
];

const PUBLICATION_BADGE: Record<string, 'success' | 'warning' | 'danger' | 'neutral' | 'info'> = {
  published: 'success',
  draft: 'warning',
  expired: 'danger',
  closed: 'neutral',
  archived: 'neutral',
};

function DetailField({
  label,
  value,
  emptyLabel,
  fullWidth = false,
  rich = false,
}: {
  label: string;
  value: string;
  emptyLabel: string;
  fullWidth?: boolean;
  rich?: boolean;
}) {
  const isEmpty = !value.trim();
  return (
    <div className={`offer-detail-field ${fullWidth ? 'offer-detail-field--full' : ''}`}>
      <span className="offer-detail-field__label">{label}</span>
      <span
        className={`offer-detail-field__value ${isEmpty ? 'offer-detail-field__value--empty' : ''} ${rich && !isEmpty ? 'offer-detail-field__value--rich' : ''}`}
      >
        {isEmpty ? emptyLabel : value}
      </span>
    </div>
  );
}

function BadgeList({
  items,
  emptyLabel,
}: {
  items: string[];
  emptyLabel: string;
}) {
  if (!items.length) {
    return <span className="offer-detail-field__value offer-detail-field__value--empty">{emptyLabel}</span>;
  }
  return (
    <div className="offer-detail-badge-list">
      {items.map((item) => (
        <span key={item} className="offer-detail-badge">
          {item}
        </span>
      ))}
    </div>
  );
}

function DetailSection({
  id,
  title,
  children,
}: {
  id: OfferDetailNavSection;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={`offer-detail-${id}`} className="offer-detail-section">
      <h4 className="offer-detail-section__title">{title}</h4>
      {children}
    </section>
  );
}

const InternshipOfferDetailModal: FunctionComponent<InternshipOfferDetailModalProps> = ({
  open,
  offer,
  onClose,
  onEdit,
}) => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === 'rtl';
  const bodyRef = useRef<HTMLDivElement>(null);
  const [detail, setDetail] = useState<StageOfferDetail | null>(null);
  const [applications, setApplications] = useState<StageApplication[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<OfferDetailNavSection>('overview');

  const empty = useCallback(
    (key: string) => t(`${PREFIX}.empty.${key}`),
    [t],
  );

  useEffect(() => {
    if (!open || !offer?.id) {
      setDetail(null);
      setApplications([]);
      setError(null);
      setActiveSection('overview');
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    Promise.all([stageApi.detail(offer.id), stageApi.applications(offer.id)])
      .then(([offerDetail, apps]) => {
        if (cancelled) return;
        setDetail(offerDetail);
        setApplications(apps);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(parseAdminApiError(err, 'offer_not_found').message);
        setDetail(null);
        setApplications([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, offer?.id]);

  const viewModel = useMemo(
    (): OfferDetailViewModel | null => (detail ? buildOfferDetailViewModel(detail, applications) : null),
    [detail, applications],
  );

  const visibleNavSections = useMemo(() => {
    if (!viewModel) return NAV_SECTIONS;
    return NAV_SECTIONS.filter((section) => section !== 'import' || viewModel.importInfo != null);
  }, [viewModel]);

  const scrollToSection = useCallback((section: OfferDetailNavSection) => {
    setActiveSection(section);
    const el = document.getElementById(`offer-detail-${section}`);
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const workModeLabel = (mode: OfferDetailViewModel['workMode']) => {
    if (!mode) return '';
    return t(`${STUDIO_PREFIX}.workModes.${mode}`);
  };

  const internshipTypeLabel = (type: string) => {
    if (!type) return '';
    const normalized = type.toLowerCase().replace(/_/g, '');
    const map: Record<string, string> = {
      internship: 'internship',
      pfe: 'pfe',
      pfa: 'pfa',
      alternance: 'alternance',
      summer: 'summer',
      observation: 'observation',
      job: 'internship',
      other: 'internship',
    };
    const key = map[normalized] ?? map[type.toLowerCase()];
    return key ? t(`${STUDIO_PREFIX}.types.${key}`) : type;
  };

  const applicationMethodLabel = (method: string) => {
    if (!method) return '';
    const key = method.toLowerCase();
    if (key === 'internal' || key === 'external' || key === 'email') {
      return t(`${STUDIO_PREFIX}.recruitment.methodOptions.${key}`);
    }
    return method;
  };

  const footer = (
    <>
      <button type="button" className={adminFormBtnSecondaryClass} onClick={onClose}>
        {t('admin.common.detailModal.close')}
      </button>
      {offer ? (
        <button
          type="button"
          className={adminFormBtnPrimaryClass}
          onClick={() => {
            onClose();
            onEdit(offer.id);
          }}
        >
          <Pencil className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
          {t('admin.common.actions.edit')}
        </button>
      ) : null}
    </>
  );

  return (
    <AdminModal
      open={open}
      onClose={onClose}
      title={t('admin.common.detailModal.offer.title')}
      description={offer?.title}
      footer={footer}
      maxWidthClass="admin-modal--offer-detail"
      dir={isRtl ? 'rtl' : 'ltr'}
      closeAriaLabel={t('admin.common.detailModal.close')}
    >
      <div ref={bodyRef} className="offer-detail-modal__layout">
        <div className="offer-detail-modal__banner">
          <span className="offer-detail-modal__banner-icon" aria-hidden>
            <Eye className="h-4 w-4" strokeWidth={1.75} />
          </span>
          <p className="offer-detail-modal__banner-text">{t('admin.common.detailModal.readOnlyHint')}</p>
        </div>

        {loading ? (
          <div className="offer-detail-modal__loading" role="status">
            <Loader2 className="mx-auto mb-2 h-5 w-5 animate-spin" aria-hidden />
            {t(`${PREFIX}.loading`)}
          </div>
        ) : error ? (
          <p className="offer-detail-modal__error" role="alert">
            {error}
          </p>
        ) : viewModel ? (
          <>
            <header className="offer-detail-modal__header">
              <div className="offer-detail-modal__header-top">
                <div className="min-w-0">
                  <h2 className="offer-detail-modal__title">{viewModel.title}</h2>
                  <p className="offer-detail-modal__subtitle">
                    {viewModel.company}
                    {viewModel.location ? ` · ${viewModel.location}` : ''}
                  </p>
                </div>
                <div className="offer-detail-modal__badges">
                  <span className={adminBadgeClass(PUBLICATION_BADGE[viewModel.publicationStatus] ?? 'neutral')}>
                    {t(`${PREFIX}.status.${viewModel.publicationStatus}`)}
                  </span>
                  <span className={adminBadgeClass('info')}>{viewModel.status}</span>
                </div>
              </div>
              <div className="offer-detail-modal__meta-grid">
                <div className="offer-detail-modal__meta-item">
                  <span className="offer-detail-modal__meta-label">{t(`${PREFIX}.header.offerId`)}</span>
                  <span className="offer-detail-modal__meta-value">{viewModel.id}</span>
                </div>
                <div className="offer-detail-modal__meta-item">
                  <span className="offer-detail-modal__meta-label">{t(`${PREFIX}.header.source`)}</span>
                  <span className="offer-detail-modal__meta-value">
                    {t(`${PREFIX}.source.${viewModel.source}`, { defaultValue: viewModel.source })}
                  </span>
                </div>
                <div className="offer-detail-modal__meta-item">
                  <span className="offer-detail-modal__meta-label">{t(`${PREFIX}.header.created`)}</span>
                  <span className="offer-detail-modal__meta-value">
                    {viewModel.createdAt || empty('notConfigured')}
                  </span>
                </div>
              </div>
            </header>

            <nav className="offer-detail-modal__nav" aria-label={t(`${PREFIX}.navigation`)}>
              {visibleNavSections.map((section) => (
                <button
                  key={section}
                  type="button"
                  className={`offer-detail-modal__nav-btn ${activeSection === section ? 'offer-detail-modal__nav-btn--active' : ''}`}
                  onClick={() => scrollToSection(section)}
                >
                  {t(`${PREFIX}.nav.${section}`)}
                </button>
              ))}
            </nav>

            <div className="offer-detail-modal__sections">
              <DetailSection id="overview" title={t(`${PREFIX}.sections.overview`)}>
                <div className="offer-detail-section__grid">
                  <DetailField label={t(`${STUDIO_PREFIX}.fields.title`)} value={viewModel.title} emptyLabel={empty('notSpecified')} />
                  <DetailField label={t(`${STUDIO_PREFIX}.fields.company`)} value={viewModel.company} emptyLabel={empty('notSpecified')} />
                  <DetailField label={t(`${STUDIO_PREFIX}.fields.location`)} value={viewModel.location} emptyLabel={empty('notSpecified')} />
                  <DetailField
                    label={t(`${STUDIO_PREFIX}.fields.department`)}
                    value={viewModel.department}
                    emptyLabel={empty('notConfigured')}
                  />
                  <DetailField
                    label={t(`${STUDIO_PREFIX}.fields.internshipType`)}
                    value={internshipTypeLabel(viewModel.internshipType)}
                    emptyLabel={empty('notSpecified')}
                  />
                  <DetailField
                    label={t(`${STUDIO_PREFIX}.fields.workMode`)}
                    value={workModeLabel(viewModel.workMode)}
                    emptyLabel={empty('notConfigured')}
                  />
                  <DetailField
                    label={t(`${PREFIX}.fields.positionsAvailable`)}
                    value={viewModel.positionsAvailable != null ? String(viewModel.positionsAvailable) : ''}
                    emptyLabel={empty('notConfigured')}
                  />
                  <DetailField
                    label={t(`${PREFIX}.fields.duration`)}
                    value={
                      viewModel.durationMonths != null
                        ? t(`${STUDIO_PREFIX}.review.duration.months`, { count: viewModel.durationMonths })
                        : ''
                    }
                    emptyLabel={empty('notConfigured')}
                  />
                  <DetailField
                    label={t(`${PREFIX}.fields.referenceCode`)}
                    value={viewModel.referenceCode}
                    emptyLabel={empty('notConfigured')}
                  />
                  <DetailField
                    label={t(`${PREFIX}.fields.language`)}
                    value={viewModel.languages.length ? viewModel.languages.join(', ') : viewModel.languageRequirement}
                    emptyLabel={empty('notSpecified')}
                  />
                  <DetailField
                    label={t(`${PREFIX}.fields.createdBy`)}
                    value={viewModel.createdBy}
                    emptyLabel={t(`${STUDIO_PREFIX}.review.publication.defaultAuthor`)}
                  />
                  <DetailField
                    label={t(`${PREFIX}.fields.lastUpdated`)}
                    value={viewModel.updatedAt}
                    emptyLabel={empty('notConfigured')}
                  />
                </div>
              </DetailSection>

              <DetailSection id="description" title={t(`${PREFIX}.sections.description`)}>
                <div className="offer-detail-section__grid">
                  <DetailField
                    label={t(`${STUDIO_PREFIX}.description.overview`)}
                    value={viewModel.description.overview}
                    emptyLabel={empty('notSpecified')}
                    fullWidth
                    rich
                  />
                  <DetailField
                    label={t(`${STUDIO_PREFIX}.description.responsibilities`)}
                    value={viewModel.description.responsibilities}
                    emptyLabel={empty('notSpecified')}
                    fullWidth
                    rich
                  />
                  <DetailField
                    label={t(`${STUDIO_PREFIX}.description.requirements`)}
                    value={viewModel.description.requirements}
                    emptyLabel={empty('notSpecified')}
                    fullWidth
                    rich
                  />
                  <DetailField
                    label={t(`${STUDIO_PREFIX}.description.benefits`)}
                    value={viewModel.description.benefits}
                    emptyLabel={empty('notSpecified')}
                    fullWidth
                    rich
                  />
                  <DetailField
                    label={t(`${PREFIX}.fields.additionalNotes`)}
                    value={viewModel.description.additionalNotes}
                    emptyLabel={empty('notSpecified')}
                    fullWidth
                    rich
                  />
                </div>
              </DetailSection>

              <DetailSection id="skills" title={t(`${PREFIX}.sections.skills`)}>
                <div className="offer-detail-section__grid">
                  <div className="offer-detail-field offer-detail-field--full">
                    <span className="offer-detail-field__label">{t(`${STUDIO_PREFIX}.skills.required`)}</span>
                    <BadgeList items={viewModel.requiredSkills} emptyLabel={empty('noRequiredSkills')} />
                  </div>
                  <div className="offer-detail-field offer-detail-field--full">
                    <span className="offer-detail-field__label">{t(`${STUDIO_PREFIX}.skills.preferred`)}</span>
                    <BadgeList items={viewModel.preferredSkills} emptyLabel={empty('noPreferredSkills')} />
                  </div>
                  <div className="offer-detail-field">
                    <span className="offer-detail-field__label">{t(`${STUDIO_PREFIX}.skills.languages`)}</span>
                    <BadgeList items={viewModel.languages} emptyLabel={empty('notSpecified')} />
                  </div>
                  <div className="offer-detail-field">
                    <span className="offer-detail-field__label">{t(`${STUDIO_PREFIX}.skills.certifications`)}</span>
                    <BadgeList items={viewModel.certifications} emptyLabel={empty('notConfigured')} />
                  </div>
                  <div className="offer-detail-field">
                    <span className="offer-detail-field__label">{t(`${STUDIO_PREFIX}.skills.softSkills`)}</span>
                    <BadgeList items={viewModel.softSkills} emptyLabel={empty('notConfigured')} />
                  </div>
                  <DetailField
                    label={t(`${STUDIO_PREFIX}.skills.experience`)}
                    value={viewModel.yearsExperience}
                    emptyLabel={empty('notConfigured')}
                  />
                </div>
              </DetailSection>

              <DetailSection id="targeting" title={t(`${PREFIX}.sections.targeting`)}>
                <div className="offer-detail-section__grid">
                  <div className="offer-detail-field offer-detail-field--full">
                    <span className="offer-detail-field__label">{t(`${STUDIO_PREFIX}.targeting.program`)}</span>
                    <BadgeList items={viewModel.targeting.programs} emptyLabel={empty('noTargeting')} />
                  </div>
                  <div className="offer-detail-field">
                    <span className="offer-detail-field__label">{t(`${STUDIO_PREFIX}.targeting.level`)}</span>
                    <BadgeList items={viewModel.targeting.levels} emptyLabel={empty('notConfigured')} />
                  </div>
                  <div className="offer-detail-field">
                    <span className="offer-detail-field__label">{t(`${STUDIO_PREFIX}.targeting.class`)}</span>
                    <BadgeList items={viewModel.targeting.classes} emptyLabel={empty('notConfigured')} />
                  </div>
                  <div className="offer-detail-field">
                    <span className="offer-detail-field__label">{t(`${STUDIO_PREFIX}.targeting.department`)}</span>
                    <BadgeList items={viewModel.targeting.departments} emptyLabel={empty('notConfigured')} />
                  </div>
                  <div className="offer-detail-field">
                    <span className="offer-detail-field__label">{t(`${STUDIO_PREFIX}.targeting.category`)}</span>
                    <BadgeList items={viewModel.targeting.categories} emptyLabel={empty('notConfigured')} />
                  </div>
                  <DetailField
                    label={t(`${PREFIX}.fields.targetRules`)}
                    value={String(viewModel.targetingRuleCount)}
                    emptyLabel={empty('noTargeting')}
                  />
                  <DetailField
                    label={t(`${PREFIX}.fields.expectedReach`)}
                    value={viewModel.viewCount > 0 ? String(viewModel.viewCount) : ''}
                    emptyLabel={empty('notConfigured')}
                  />
                </div>
              </DetailSection>

              <DetailSection id="recruitment" title={t(`${PREFIX}.sections.recruitment`)}>
                <div className="offer-detail-section__grid">
                  <DetailField
                    label={t(`${STUDIO_PREFIX}.recruitment.deadline`)}
                    value={viewModel.applicationDeadline}
                    emptyLabel={empty('notConfigured')}
                  />
                  <DetailField
                    label={t(`${STUDIO_PREFIX}.recruitment.startDate`)}
                    value={viewModel.startDate}
                    emptyLabel={empty('notConfigured')}
                  />
                  <DetailField
                    label={t(`${STUDIO_PREFIX}.recruitment.endDate`)}
                    value={viewModel.endDate}
                    emptyLabel={empty('notConfigured')}
                  />
                  <DetailField
                    label={t(`${STUDIO_PREFIX}.recruitment.profilesNeeded`)}
                    value={viewModel.positionsAvailable != null ? String(viewModel.positionsAvailable) : ''}
                    emptyLabel={empty('notConfigured')}
                  />
                  <DetailField
                    label={t(`${PREFIX}.fields.recruitmentProcess`)}
                    value={applicationMethodLabel(viewModel.applicationMethod)}
                    emptyLabel={empty('notConfigured')}
                  />
                  <DetailField
                    label={t(`${PREFIX}.fields.compensation`)}
                    value={viewModel.compensation}
                    emptyLabel={empty('notConfigured')}
                  />
                  <DetailField
                    label={t(`${PREFIX}.fields.minEducation`)}
                    value={viewModel.minEducationLevel}
                    emptyLabel={empty('notConfigured')}
                  />
                  {viewModel.externalUrl ? (
                    <div className="offer-detail-field offer-detail-field--full">
                      <span className="offer-detail-field__label">{t(`${STUDIO_PREFIX}.recruitment.externalUrl`)}</span>
                      <a
                        href={viewModel.externalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="offer-detail-field__value inline-flex items-center gap-1 text-[var(--admin-brand)] hover:underline"
                      >
                        {viewModel.externalUrl}
                        <ExternalLink className="h-3.5 w-3.5 shrink-0" aria-hidden />
                      </a>
                    </div>
                  ) : null}
                </div>
              </DetailSection>

              <DetailSection id="publication" title={t(`${PREFIX}.sections.publication`)}>
                <div className="offer-detail-section__grid">
                  <DetailField
                    label={t(`${STUDIO_PREFIX}.recruitment.visibility`)}
                    value={t(`${STUDIO_PREFIX}.recruitment.visibilityOptions.${viewModel.visibility}`, {
                      defaultValue: viewModel.visibility,
                    })}
                    emptyLabel={empty('notConfigured')}
                  />
                  <DetailField
                    label={t(`${PREFIX}.fields.publicationType`)}
                    value={t(`${PREFIX}.source.${viewModel.source}`, { defaultValue: viewModel.source })}
                    emptyLabel={empty('notConfigured')}
                  />
                  <DetailField
                    label={t(`${PREFIX}.fields.publishedDate`)}
                    value={viewModel.publishedAt}
                    emptyLabel={empty('notConfigured')}
                  />
                  <DetailField
                    label={t(`${PREFIX}.fields.expirationDate`)}
                    value={viewModel.applicationDeadline}
                    emptyLabel={empty('notConfigured')}
                  />
                  <DetailField
                    label={t(`${PREFIX}.fields.currentStatus`)}
                    value={t(`${PREFIX}.status.${viewModel.publicationStatus}`)}
                    emptyLabel={empty('notConfigured')}
                  />
                  <DetailField
                    label={t(`${PREFIX}.fields.targetAudience`)}
                    value={
                      viewModel.hasTargeting
                        ? t(`${STUDIO_PREFIX}.review.audience.targeted`)
                        : t(`${STUDIO_PREFIX}.recruitment.visibilityOptions.public`)
                    }
                    emptyLabel={empty('notConfigured')}
                  />
                  <DetailField
                    label={t(`${PREFIX}.fields.autoExpiration`)}
                    value={
                      viewModel.autoExpiration == null
                        ? ''
                        : viewModel.autoExpiration
                          ? t(`${PREFIX}.values.yes`)
                          : t(`${PREFIX}.values.no`)
                    }
                    emptyLabel={empty('notConfigured')}
                  />
                </div>
              </DetailSection>

              <DetailSection id="applications" title={t(`${PREFIX}.sections.applications`)}>
                <div className="offer-detail-insights">
                  <div className="offer-detail-insight">
                    <div className="offer-detail-insight__value">{viewModel.applicationInsights.total}</div>
                    <div className="offer-detail-insight__label">{t(`${PREFIX}.insights.total`)}</div>
                  </div>
                  <div className="offer-detail-insight">
                    <div className="offer-detail-insight__value">{viewModel.applicationInsights.accepted}</div>
                    <div className="offer-detail-insight__label">{t(`${PREFIX}.insights.accepted`)}</div>
                  </div>
                  <div className="offer-detail-insight">
                    <div className="offer-detail-insight__value">{viewModel.applicationInsights.rejected}</div>
                    <div className="offer-detail-insight__label">{t(`${PREFIX}.insights.rejected`)}</div>
                  </div>
                  <div className="offer-detail-insight">
                    <div className="offer-detail-insight__value">{viewModel.applicationInsights.pending}</div>
                    <div className="offer-detail-insight__label">{t(`${PREFIX}.insights.pending`)}</div>
                  </div>
                  <div className="offer-detail-insight">
                    <div className="offer-detail-insight__value">{viewModel.applicationInsights.interviewing}</div>
                    <div className="offer-detail-insight__label">{t(`${PREFIX}.insights.interviewing`)}</div>
                  </div>
                  <div className="offer-detail-insight">
                    <div className="offer-detail-insight__value">
                      {viewModel.applicationInsights.conversionRate != null
                        ? `${viewModel.applicationInsights.conversionRate}%`
                        : '—'}
                    </div>
                    <div className="offer-detail-insight__label">{t(`${PREFIX}.insights.conversion`)}</div>
                  </div>
                </div>
              </DetailSection>

              {viewModel.importInfo ? (
                <DetailSection id="import" title={t(`${PREFIX}.sections.import`)}>
                  <div className="offer-detail-section__grid">
                    <DetailField
                      label={t(`${PREFIX}.fields.sourcePlatform`)}
                      value={viewModel.importInfo.platform}
                      emptyLabel={empty('notConfigured')}
                    />
                    <DetailField
                      label={t(`${PREFIX}.fields.importDate`)}
                      value={viewModel.importInfo.importDate}
                      emptyLabel={empty('notConfigured')}
                    />
                    <DetailField
                      label={t(`${PREFIX}.fields.importedBy`)}
                      value={viewModel.importInfo.importedBy}
                      emptyLabel={t(`${STUDIO_PREFIX}.review.publication.defaultAuthor`)}
                    />
                    <DetailField
                      label={t(`${PREFIX}.fields.parserUsed`)}
                      value={viewModel.importInfo.parserUsed}
                      emptyLabel={empty('notConfigured')}
                    />
                    {viewModel.importInfo.url ? (
                      <div className="offer-detail-field offer-detail-field--full">
                        <span className="offer-detail-field__label">{t(`${PREFIX}.fields.sourceUrl`)}</span>
                        <a
                          href={viewModel.importInfo.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="offer-detail-field__value inline-flex items-center gap-1 text-[var(--admin-brand)] hover:underline"
                        >
                          {viewModel.importInfo.url}
                          <ExternalLink className="h-3.5 w-3.5 shrink-0" aria-hidden />
                        </a>
                      </div>
                    ) : null}
                  </div>
                </DetailSection>
              ) : null}

              <DetailSection id="audit" title={t(`${PREFIX}.sections.audit`)}>
                <div className="offer-detail-timeline">
                  {[
                    { label: t(`${PREFIX}.audit.created`), date: viewModel.audit.created },
                    { label: t(`${PREFIX}.audit.updated`), date: viewModel.audit.updated },
                    { label: t(`${PREFIX}.audit.published`), date: viewModel.audit.published },
                    { label: t(`${PREFIX}.audit.archived`), date: viewModel.audit.archived },
                    { label: t(`${PREFIX}.audit.lastActivity`), date: viewModel.audit.lastActivity },
                  ].map((item) => (
                    <div key={item.label} className="offer-detail-timeline__item">
                      <span className="offer-detail-timeline__dot" aria-hidden />
                      <div className="offer-detail-timeline__content">
                        <div className="offer-detail-timeline__label">{item.label}</div>
                        <div className="offer-detail-timeline__date">
                          {item.date || empty('notConfigured')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </DetailSection>
            </div>
          </>
        ) : null}
      </div>
    </AdminModal>
  );
};

export default InternshipOfferDetailModal;
