import type { OfferDetailViewModel } from './offerDetailViewModel';

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export interface OfferEmailPreviewLabels {
  internshipType: string;
  workMode: string;
  duration: string;
  compensation: string;
  deadline: string;
  startDate: string;
  endDate: string;
  minEducation: string;
  yearsExperience: string;
  externalUrl: string;
  offerUrl: string;
  overview: string;
  responsibilities: string;
  requirements: string;
  benefits: string;
  additionalNotes: string;
  requiredSkills: string;
  preferredSkills: string;
  languages: string;
  softSkills: string;
  certifications: string;
}

export interface OfferEmailPreviewContext {
  viewModel: OfferDetailViewModel;
  intro: string;
  ctaHint: string;
  offerPageUrl: string;
  labels: OfferEmailPreviewLabels;
  internshipTypeLabel: string;
  workModeLabel: string;
  durationLabel: string;
}

function splitTextToItems(text: string): string[] {
  if (!text.trim()) return [];
  return text
    .split(/\n+/)
    .map((line) => line.replace(/^[\s•\-*]+/, '').trim())
    .filter(Boolean);
}

function paragraphHtml(text: string): string {
  if (!text.trim()) return '';
  return `<p style="margin:0 0 10px;font-size:14px;line-height:1.55;color:#334155;white-space:pre-wrap">${escapeHtml(text)}</p>`;
}

function listHtml(items: string[]): string {
  if (!items.length) return '';
  const rows = items
    .map(
      (item) =>
        `<li style="margin:0 0 6px;font-size:14px;line-height:1.5;color:#334155">${escapeHtml(item)}</li>`,
    )
    .join('');
  return `<ul style="margin:0 0 12px;padding-left:18px">${rows}</ul>`;
}

function sectionHtml(title: string, body: string): string {
  if (!body.trim()) return '';
  return `
    <div style="margin:0 0 16px">
      <p style="margin:0 0 8px;font-size:13px;font-weight:700;letter-spacing:0.02em;text-transform:uppercase;color:#64748b">${escapeHtml(title)}</p>
      ${body}
    </div>
  `.trim();
}

function badgeListHtml(items: string[]): string {
  if (!items.length) return '';
  const badges = items
    .map(
      (item) =>
        `<span style="display:inline-block;margin:0 6px 6px 0;padding:4px 10px;border-radius:999px;background:#e2e8f0;font-size:12px;color:#334155">${escapeHtml(item)}</span>`,
    )
    .join('');
  return `<p style="margin:0 0 4px;font-size:14px;line-height:1.6">${badges}</p>`;
}

function metaRowHtml(label: string, value: string): string {
  if (!value.trim()) return '';
  return `<p style="margin:0 0 4px;font-size:13px;color:#475569"><strong>${escapeHtml(label)}:</strong> ${escapeHtml(value)}</p>`;
}

function linkRowHtml(label: string, url: string): string {
  if (!url.trim()) return '';
  const safeUrl = escapeHtml(url);
  return `<p style="margin:0 0 4px;font-size:13px;color:#475569"><strong>${escapeHtml(label)}:</strong> <a href="${safeUrl}" style="color:#2563eb;text-decoration:underline;word-break:break-all">${safeUrl}</a></p>`;
}

function descriptionSectionHtml(
  title: string,
  text: string,
  asList = false,
): string {
  if (!text.trim()) return '';
  const body = asList ? listHtml(splitTextToItems(text)) : paragraphHtml(text);
  if (!body) return '';
  return sectionHtml(title, body);
}

export function buildOfferEmailBodyHtml({
  viewModel,
  intro,
  ctaHint,
  offerPageUrl,
  labels,
  internshipTypeLabel,
  workModeLabel,
  durationLabel,
}: OfferEmailPreviewContext): string {
  const duration = durationLabel;

  const logoHtml = viewModel.companyLogoUrl
    ? `<img src="${escapeHtml(viewModel.companyLogoUrl)}" alt="${escapeHtml(viewModel.company)}" width="56" height="56" style="display:block;width:56px;height:56px;border-radius:12px;object-fit:cover;border:1px solid #e2e8f0;background:#fff" />`
    : '';

  const headerMeta = [
    metaRowHtml(labels.internshipType, internshipTypeLabel),
    metaRowHtml(labels.workMode, workModeLabel),
    metaRowHtml(labels.duration, duration),
    metaRowHtml(labels.compensation, viewModel.compensation),
    metaRowHtml(labels.deadline, viewModel.applicationDeadline),
    metaRowHtml(labels.startDate, viewModel.startDate),
    metaRowHtml(labels.endDate, viewModel.endDate),
    metaRowHtml(labels.minEducation, viewModel.minEducationLevel),
    metaRowHtml(labels.yearsExperience, viewModel.yearsExperience),
    linkRowHtml(labels.externalUrl, viewModel.externalUrl),
    linkRowHtml(labels.offerUrl, offerPageUrl),
  ].join('');

  const skillsHtml = [
    viewModel.requiredSkills.length
      ? sectionHtml(labels.requiredSkills, badgeListHtml(viewModel.requiredSkills))
      : '',
    viewModel.preferredSkills.length
      ? sectionHtml(labels.preferredSkills, badgeListHtml(viewModel.preferredSkills))
      : '',
    viewModel.languages.length
      ? sectionHtml(labels.languages, badgeListHtml(viewModel.languages))
      : '',
    viewModel.softSkills.length
      ? sectionHtml(labels.softSkills, badgeListHtml(viewModel.softSkills))
      : '',
    viewModel.certifications.length
      ? sectionHtml(labels.certifications, badgeListHtml(viewModel.certifications))
      : '',
  ].join('');

  return `
    <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#1e293b">${escapeHtml(intro)}</p>
    <div style="margin:0 0 20px;padding:16px 18px;border-radius:12px;border:1px solid #e2e8f0;background:#f8fafc">
      <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse">
        <tr>
          ${logoHtml ? `<td style="width:68px;vertical-align:top;padding-right:12px">${logoHtml}</td>` : ''}
          <td style="vertical-align:top">
            <p style="margin:0 0 6px;font-size:17px;font-weight:700;color:#0f172a">${escapeHtml(viewModel.title)}</p>
            <p style="margin:0 0 8px;font-size:14px;color:#475569">${escapeHtml(viewModel.company)}${viewModel.location ? ` · ${escapeHtml(viewModel.location)}` : ''}</p>
            ${headerMeta}
          </td>
        </tr>
      </table>
    </div>
    ${descriptionSectionHtml(labels.overview, viewModel.description.overview)}
    ${descriptionSectionHtml(labels.responsibilities, viewModel.description.responsibilities, true)}
    ${descriptionSectionHtml(labels.requirements, viewModel.description.requirements, true)}
    ${descriptionSectionHtml(labels.benefits, viewModel.description.benefits)}
    ${descriptionSectionHtml(labels.additionalNotes, viewModel.description.additionalNotes)}
    ${skillsHtml}
    <p style="margin:0;font-size:13px;color:#64748b">${escapeHtml(ctaHint)}</p>
    ${offerPageUrl ? `<p style="margin:8px 0 0;font-size:13px"><a href="${escapeHtml(offerPageUrl)}" style="color:#2563eb;text-decoration:underline;word-break:break-all">${escapeHtml(offerPageUrl)}</a></p>` : ''}
  `.trim();
}
