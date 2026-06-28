import type { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { Building2, ExternalLink, MapPin } from 'lucide-react';
import type { StageOfferImportPreview } from '../../../../../../shared/types/stageTypes';
import { OFFER_IMPORT_PLATFORM_LABELS } from '../../../utils/mapOfferImportPreview';

interface SimulatorOfferExtractedPreviewProps {
  preview: StageOfferImportPreview;
}

const PREFIX = 'student.internshipOffers.interviewSim.config.offerData';

const SimulatorOfferExtractedPreview: FunctionComponent<SimulatorOfferExtractedPreviewProps> = ({
  preview,
}) => {
  const { t } = useTranslation();
  const platformLabel =
    OFFER_IMPORT_PLATFORM_LABELS[preview.source_platform] ?? preview.source_platform;

  const hasBasics = Boolean(preview.title || preview.company_name || preview.location_city);
  const hasDescription = Boolean(preview.description?.trim());
  const hasRequirements = Boolean(preview.requirements?.trim());
  const hasBenefits = Boolean(preview.benefits?.trim());
  const hasSkills = preview.required_skills.length > 0;

  return (
    <div className="sr-is-config-offer-preview sr-is-panel">
      <div className="sr-is-config-offer-preview__head">
        <p className="sr-is-config-offer-preview__eyebrow">{t(`${PREFIX}.preview`)}</p>
        {platformLabel ? (
          <span className="sr-is-config-offer-preview__platform">{platformLabel}</span>
        ) : null}
      </div>

      {hasBasics ? (
        <section className="sr-is-config-offer-preview__section">
          <h3 className="sr-is-config-offer-preview__section-title">{t(`${PREFIX}.previewSections.basic`)}</h3>
          <dl className="sr-is-config-offer-preview__meta">
            {preview.company_name ? (
              <div className="sr-is-config-offer-preview__meta-row">
                <dt>
                  <Building2 className="h-3.5 w-3.5" aria-hidden />
                  {t(`${PREFIX}.previewFields.company`)}
                </dt>
                <dd className="sr-is-config-offer-preview__meta-value">
                  {preview.company_logo ? (
                    <img
                      src={preview.company_logo}
                      alt=""
                      className="sr-is-config-offer-preview__logo"
                    />
                  ) : null}
                  <span>{preview.company_name}</span>
                </dd>
              </div>
            ) : null}
            {preview.title ? (
              <div className="sr-is-config-offer-preview__meta-row">
                <dt>{t(`${PREFIX}.previewFields.title`)}</dt>
                <dd>{preview.title}</dd>
              </div>
            ) : null}
            {preview.location_city ? (
              <div className="sr-is-config-offer-preview__meta-row">
                <dt>
                  <MapPin className="h-3.5 w-3.5" aria-hidden />
                  {t(`${PREFIX}.previewFields.location`)}
                </dt>
                <dd>{preview.location_city}</dd>
              </div>
            ) : null}
          </dl>
        </section>
      ) : null}

      {hasDescription || hasRequirements || hasBenefits ? (
        <section className="sr-is-config-offer-preview__section">
          <h3 className="sr-is-config-offer-preview__section-title">
            {t(`${PREFIX}.previewSections.description`)}
          </h3>
          {hasDescription ? (
            <div className="sr-is-config-offer-preview__block">
              <p className="sr-is-config-offer-preview__block-label">{t(`${PREFIX}.previewFields.description`)}</p>
              <p className="sr-is-config-offer-preview__text">{preview.description}</p>
            </div>
          ) : null}
          {hasRequirements ? (
            <div className="sr-is-config-offer-preview__block">
              <p className="sr-is-config-offer-preview__block-label">{t(`${PREFIX}.previewFields.requirements`)}</p>
              <p className="sr-is-config-offer-preview__text">{preview.requirements}</p>
            </div>
          ) : null}
          {hasBenefits ? (
            <div className="sr-is-config-offer-preview__block">
              <p className="sr-is-config-offer-preview__block-label">{t(`${PREFIX}.previewFields.benefits`)}</p>
              <p className="sr-is-config-offer-preview__text">{preview.benefits}</p>
            </div>
          ) : null}
        </section>
      ) : null}

      {hasSkills ? (
        <section className="sr-is-config-offer-preview__section">
          <h3 className="sr-is-config-offer-preview__section-title">{t(`${PREFIX}.previewSections.skills`)}</h3>
          <div className="sr-is-config-offer-preview__skills">
            {preview.required_skills.map((skill) => (
              <span key={skill} className="sr-is-config-offer-preview__skill">
                {skill}
              </span>
            ))}
          </div>
        </section>
      ) : null}

      {preview.source_url ? (
        <section className="sr-is-config-offer-preview__section sr-is-config-offer-preview__section--source">
          <h3 className="sr-is-config-offer-preview__section-title">{t(`${PREFIX}.previewSections.source`)}</h3>
          <a
            href={preview.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="sr-is-config-offer-preview__source-link"
          >
            <span className="sr-is-config-offer-preview__source-text">{preview.source_url}</span>
            <ExternalLink className="h-3.5 w-3.5 shrink-0" aria-hidden />
          </a>
        </section>
      ) : null}
    </div>
  );
};

export default SimulatorOfferExtractedPreview;
