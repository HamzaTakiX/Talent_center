import { FunctionComponent, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Mail } from 'lucide-react';
import type { OfferDetailViewModel } from '../../utils/offerDetailViewModel';
import { buildOfferEmailBodyHtml } from '../../utils/offerEmailPreview';
import { getInternshipOfferDetailsPath } from '../../../../student/internship_offers/constants/routes';
import DetailsSectionCard from '../../../../student/internship_offers/components/details/DetailsSectionCard';
import { DETAILS_SECTION_SUBTITLE, DETAILS_SECTION_TITLE } from '../../../../student/internship_offers/constants/internshipOfferDetailsStyles';

const PREFIX = 'admin.modules.offers.detailPage.emailPreview';
const STUDIO_PREFIX = 'admin.forms.createOfferStudio';
const SAMPLE_STUDENT = { name: 'Amina Benali', email: 'amina.benali@etu.emsi.ma' };

interface InternshipOfferEmailPreviewProps {
  viewModel: OfferDetailViewModel;
}

function resolveInternshipTypeLabel(type: string, t: (key: string) => string): string {
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
}

function resolveWorkModeLabel(
  mode: OfferDetailViewModel['workMode'],
  t: (key: string) => string,
): string {
  if (!mode) return '';
  return t(`${STUDIO_PREFIX}.workModes.${mode}`);
}

const InternshipOfferEmailPreview: FunctionComponent<InternshipOfferEmailPreviewProps> = ({
  viewModel,
}) => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language?.slice(0, 2) || 'fr';

  const preview = useMemo(() => {
    const subject = t(`${PREFIX}.subject`, { title: viewModel.title, company: viewModel.company });
    const intro = t(`${PREFIX}.intro`, { company: viewModel.company });
    const ctaHint = t(`${PREFIX}.ctaHint`);
    const ctaLabel = t(`${PREFIX}.cta`);
    const footerText = t(`${PREFIX}.footer`);
    const offerPageUrl =
      typeof window !== 'undefined'
        ? `${window.location.origin}${getInternshipOfferDetailsPath(viewModel.id)}`
        : getInternshipOfferDetailsPath(viewModel.id);

    const labels = {
      internshipType: t(`${PREFIX}.fields.internshipType`),
      workMode: t(`${PREFIX}.fields.workMode`),
      duration: t(`${PREFIX}.fields.duration`),
      compensation: t(`${PREFIX}.fields.compensation`),
      deadline: t(`${PREFIX}.fields.deadline`),
      startDate: t(`${PREFIX}.fields.startDate`),
      endDate: t(`${PREFIX}.fields.endDate`),
      minEducation: t(`${PREFIX}.fields.minEducation`),
      yearsExperience: t(`${PREFIX}.fields.yearsExperience`),
      externalUrl: t(`${PREFIX}.fields.externalUrl`),
      offerUrl: t(`${PREFIX}.fields.offerUrl`),
      overview: t(`${PREFIX}.sections.overview`),
      responsibilities: t(`${PREFIX}.sections.responsibilities`),
      requirements: t(`${PREFIX}.sections.requirements`),
      benefits: t(`${PREFIX}.sections.benefits`),
      additionalNotes: t(`${PREFIX}.sections.additionalNotes`),
      requiredSkills: t(`${PREFIX}.sections.requiredSkills`),
      preferredSkills: t(`${PREFIX}.sections.preferredSkills`),
      languages: t(`${PREFIX}.sections.languages`),
      softSkills: t(`${PREFIX}.sections.softSkills`),
      certifications: t(`${PREFIX}.sections.certifications`),
    };

    const durationLabel =
      viewModel.durationMonths != null
        ? t(`${STUDIO_PREFIX}.review.duration.months`, { count: viewModel.durationMonths })
        : '';

    return {
      subject,
      body_html: buildOfferEmailBodyHtml({
        viewModel,
        intro,
        ctaHint,
        offerPageUrl,
        labels,
        internshipTypeLabel: resolveInternshipTypeLabel(viewModel.internshipType, t),
        workModeLabel: resolveWorkModeLabel(viewModel.workMode, t),
        durationLabel,
      }),
      sender_name: t(`${PREFIX}.senderName`),
      sender_email: t(`${PREFIX}.senderEmail`),
      language: lang,
      ctaLabel,
      footerText,
      offerPageUrl,
    };
  }, [viewModel, t, lang]);

  return (
    <DetailsSectionCard id="offer-detail-email-preview" className="scroll-mt-24">
      <div className="mb-4 flex items-start gap-2.5">
        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--admin-brand)_12%,var(--admin-surface))] text-[var(--admin-brand)]">
          <Mail className="h-4 w-4" strokeWidth={1.75} aria-hidden />
        </span>
        <div className="min-w-0">
          <h2 className={`${DETAILS_SECTION_TITLE} m-0`}>{t(`${PREFIX}.title`)}</h2>
          <p className={`${DETAILS_SECTION_SUBTITLE} m-0 mt-1`}>{t(`${PREFIX}.subtitle`)}</p>
        </div>
      </div>

      <div className="admin-ann-email-preview__frame !mx-0 !max-w-none">
        <div className="admin-ann-email-preview__envelope">
          <div className="admin-ann-email-preview__meta">
            <div className="admin-ann-email-preview__meta-row">
              <span className="admin-ann-email-preview__meta-label">{t(`${PREFIX}.from`)}</span>
              <span className="admin-ann-email-preview__meta-value">
                {preview.sender_name} &lt;{preview.sender_email}&gt;
              </span>
            </div>
            <div className="admin-ann-email-preview__meta-row">
              <span className="admin-ann-email-preview__meta-label">{t(`${PREFIX}.to`)}</span>
              <span className="admin-ann-email-preview__meta-value">
                {SAMPLE_STUDENT.name} &lt;{SAMPLE_STUDENT.email}&gt;
              </span>
            </div>
            <div className="admin-ann-email-preview__meta-row">
              <span className="admin-ann-email-preview__meta-label">{t(`${PREFIX}.subjectLabel`)}</span>
              <span className="admin-ann-email-preview__meta-value admin-ann-email-preview__subject">
                {preview.subject}
              </span>
            </div>
          </div>

          <div className="admin-ann-email-preview__letter">
            <div className="admin-ann-email-preview__letter-header">
              <h3 className="admin-ann-email-preview__platform">{preview.sender_name}</h3>
            </div>
            <div
              className="admin-ann-email-preview__letter-body admin-ann-email-preview__letter-body--rich"
              dangerouslySetInnerHTML={{ __html: preview.body_html }}
            />
            <div className="admin-ann-email-preview__cta-wrap">
              <a
                href={preview.offerPageUrl}
                className="admin-ann-email-preview__cta"
                target="_blank"
                rel="noopener noreferrer"
              >
                {preview.ctaLabel}
              </a>
            </div>
            <div className="admin-ann-email-preview__letter-footer">{preview.footerText}</div>
          </div>
        </div>
      </div>
    </DetailsSectionCard>
  );
};

export default InternshipOfferEmailPreview;
