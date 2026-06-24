import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { Briefcase, Download, GraduationCap, Languages, Sparkles, User } from 'lucide-react';
import { resolveMediaUrl } from '../../../../../../shared/api/mediaUrl';
import type { ImportedCvPreview } from '../../types/cvAnalysisDashboard';
import type { CvBuilderSnapshot } from '../../utils/cvDraftReader';
import CvPdfPreview from './CvPdfPreview';

interface CvFullPreviewProps {
  snapshot?: CvBuilderSnapshot;
  importedPreview?: ImportedCvPreview;
  cvFileUrl?: string;
  fileName?: string;
}

const text = (value: unknown) => (typeof value === 'string' ? value.trim() : '');

const splitDescription = (value: unknown): string[] => {
  if (typeof value !== 'string') return [];
  return value
    .split('\n')
    .map((line) => line.replace(/^[-•]\s*/, '').trim())
    .filter(Boolean);
};

const CvFullPreview: FunctionComponent<CvFullPreviewProps> = ({
  snapshot,
  importedPreview,
  cvFileUrl,
  fileName,
}) => {
  const { t } = useTranslation();

  if (importedPreview) {
    const title = importedPreview.fileName || fileName || t('student.internshipOffers.cvDashboard.hero.fullPreview');

    if (importedPreview.kind === 'pdf' && importedPreview.objectUrl) {
      return (
        <div className="sr-cva-cv-preview">
          <h3 className="sr-cva-cv-preview__title">{t('student.internshipOffers.cvDashboard.hero.fullPreview')}</h3>
          <div className="sr-cva-cv-preview__paper sr-cva-cv-preview__paper--pdf">
            <CvPdfPreview src={importedPreview.objectUrl} title={title} />
          </div>
        </div>
      );
    }

    if (importedPreview.kind === 'docx' && importedPreview.htmlContent) {
      return (
        <div className="sr-cva-cv-preview">
          <h3 className="sr-cva-cv-preview__title">{t('student.internshipOffers.cvDashboard.hero.fullPreview')}</h3>
          <div className="sr-cva-cv-preview__paper">
            <div
              className="sr-cva-cv-preview__doc sr-cva-cv-preview__docx"
              dangerouslySetInnerHTML={{ __html: importedPreview.htmlContent }}
            />
          </div>
        </div>
      );
    }

    if (importedPreview.kind === 'doc' && importedPreview.objectUrl) {
      return (
        <div className="sr-cva-cv-preview">
          <h3 className="sr-cva-cv-preview__title">{t('student.internshipOffers.cvDashboard.hero.fullPreview')}</h3>
          <div className="sr-cva-cv-preview__paper sr-cva-cv-preview__paper--fallback">
            <p className="sr-cva-cv-preview__fallback-text">
              {t('student.internshipOffers.cvDashboard.preview.docFallback')}
            </p>
            <a
              href={importedPreview.objectUrl}
              download={importedPreview.fileName}
              className="sr-cva-btn sr-cva-btn--secondary mt-3 inline-flex"
            >
              <Download className="h-4 w-4" aria-hidden />
              {t('student.internshipOffers.cvDashboard.preview.downloadImported')}
            </a>
          </div>
        </div>
      );
    }

    return (
      <div className="sr-cva-cv-preview">
        <h3 className="sr-cva-cv-preview__title">{t('student.internshipOffers.cvDashboard.hero.fullPreview')}</h3>
        <div className="sr-cva-cv-preview__paper sr-cva-cv-preview__paper--fallback">
          <p className="sr-cva-cv-preview__fallback-text">
            {t('student.internshipOffers.cvDashboard.preview.unsupported')}
          </p>
        </div>
      </div>
    );
  }

  if (!snapshot) {
    return null;
  }

  const { details, workExp, education, projects, skills, languages } = snapshot;
  const mediaUrl = resolveMediaUrl(cvFileUrl);
  const isPdfPreview = Boolean(
    mediaUrl && (fileName?.toLowerCase().endsWith('.pdf') || mediaUrl.toLowerCase().includes('.pdf')),
  );

  if (isPdfPreview && mediaUrl) {
    return (
      <div className="sr-cva-cv-preview">
        <h3 className="sr-cva-cv-preview__title">{t('student.internshipOffers.cvDashboard.hero.fullPreview')}</h3>
        <div className="sr-cva-cv-preview__paper sr-cva-cv-preview__paper--pdf">
          <CvPdfPreview
            src={mediaUrl}
            title={fileName || t('student.internshipOffers.cvDashboard.hero.fullPreview')}
          />
        </div>
      </div>
    );
  }

  const name = text(details.name);
  const nameParts = name.split(/\s+/).filter(Boolean);
  const firstName = nameParts[0] ?? '';
  const lastName = nameParts.slice(1).join(' ');

  const contactItems = [
    text(details.phone),
    text(details.email),
    text(details.location),
    text(details.linkedin),
    text(details.github) ? `@${text(details.github)}` : '',
  ].filter(Boolean);

  const hasAbout = text(details.about);
  const hasExperience = workExp.some((item) => text(item.title) || text(item.company));
  const hasEducation = education.some((item) => text(item.institution) || text(item.qualification));
  const hasLanguages = languages.some((item) => text(item.name));
  const hasSkills = skills.some((item) => text(item.name));
  const hasProjects = projects.some((item) => text(item.name) || text(item.desc));

  return (
    <div className="sr-cva-cv-preview">
      <h3 className="sr-cva-cv-preview__title">{t('student.internshipOffers.cvDashboard.hero.fullPreview')}</h3>
      <div className="sr-cva-cv-preview__paper">
        <div id="resume" className="doc sr-cva-cv-preview__doc">
          <header className="sr-cva-cv-preview__header">
            <div className="sr-cva-cv-preview__name-row">
              {firstName ? <h1 className="sr-cva-cv-preview__name">{firstName}</h1> : null}
              {lastName ? <h1 className="sr-cva-cv-preview__name sr-cva-cv-preview__name--accent">{lastName}</h1> : null}
            </div>
            {text(details.role) ? <p className="sr-cva-cv-preview__role">{text(details.role)}</p> : null}
            {contactItems.length > 0 ? (
              <div className="sr-cva-cv-preview__contacts">
                {contactItems.map((item) => (
                  <span key={item}>{item}</span>
                ))}
              </div>
            ) : null}
          </header>

          {hasAbout ? (
            <section className="sr-cva-cv-preview__section">
              <h2 className="sr-cva-cv-preview__section-title">
                <User className="h-4 w-4" aria-hidden />
                {t('student.internshipOffers.cvDashboard.preview.about')}
              </h2>
              <p className="sr-cva-cv-preview__paragraph">{text(details.about)}</p>
            </section>
          ) : null}

          {hasExperience ? (
            <section className="sr-cva-cv-preview__section">
              <h2 className="sr-cva-cv-preview__section-title">
                <Briefcase className="h-4 w-4" aria-hidden />
                {t('student.internshipOffers.cvDashboard.preview.experience')}
              </h2>
              <div className="sr-cva-cv-preview__stack">
                {workExp.map((item, index) => {
                  const title = text(item.title);
                  const company = text(item.company);
                  const date = text(item.date);
                  const bullets = splitDescription(item.desc);
                  if (!title && !company && bullets.length === 0) return null;
                  return (
                    <article key={`exp-${index}`} className="sr-cva-cv-preview__entry">
                      <div className="sr-cva-cv-preview__entry-head">
                        <p className="sr-cva-cv-preview__entry-title">
                          {title ? <strong>{title}</strong> : null}
                          {title && company ? ' · ' : null}
                          {company}
                        </p>
                        {date ? <span className="sr-cva-cv-preview__badge">{date}</span> : null}
                      </div>
                      {bullets.length > 0 ? (
                        <ul className="sr-cva-cv-preview__list">
                          {bullets.map((bullet) => (
                            <li key={bullet}>{bullet}</li>
                          ))}
                        </ul>
                      ) : null}
                    </article>
                  );
                })}
              </div>
            </section>
          ) : null}

          {hasEducation ? (
            <section className="sr-cva-cv-preview__section">
              <h2 className="sr-cva-cv-preview__section-title">
                <GraduationCap className="h-4 w-4" aria-hidden />
                {t('student.internshipOffers.cvDashboard.preview.education')}
              </h2>
              <div className="sr-cva-cv-preview__grid">
                {education.map((item, index) => {
                  const institution = text(item.institution);
                  const qualification = text(item.qualification);
                  const date = text(item.date);
                  if (!institution && !qualification) return null;
                  return (
                    <article key={`edu-${index}`} className="sr-cva-cv-preview__entry">
                      <div className="sr-cva-cv-preview__entry-head">
                        <p className="sr-cva-cv-preview__entry-title">{institution}</p>
                        {date ? <span className="sr-cva-cv-preview__badge">{date}</span> : null}
                      </div>
                      {qualification ? <p className="sr-cva-cv-preview__muted">{qualification}</p> : null}
                    </article>
                  );
                })}
              </div>
            </section>
          ) : null}

          {hasLanguages ? (
            <section className="sr-cva-cv-preview__section">
              <h2 className="sr-cva-cv-preview__section-title">
                <Languages className="h-4 w-4" aria-hidden />
                {t('student.internshipOffers.cvDashboard.preview.languages')}
              </h2>
              <div className="sr-cva-cv-preview__tags">
                {languages.map((item, index) => {
                  const langName = text(item.name);
                  const level = text(item.level);
                  if (!langName) return null;
                  return (
                    <span key={`lang-${index}`} className="sr-cva-cv-preview__tag">
                      {langName}
                      {level ? ` · ${level}` : ''}
                    </span>
                  );
                })}
              </div>
            </section>
          ) : null}

          {hasSkills ? (
            <section className="sr-cva-cv-preview__section">
              <h2 className="sr-cva-cv-preview__section-title">
                <Sparkles className="h-4 w-4" aria-hidden />
                {t('student.internshipOffers.cvDashboard.preview.skills')}
              </h2>
              <div className="sr-cva-cv-preview__tags">
                {skills.map((item, index) => {
                  const skillName = text(item.name);
                  if (!skillName) return null;
                  return (
                    <span key={`skill-${index}`} className="sr-cva-cv-preview__tag">
                      {skillName}
                    </span>
                  );
                })}
              </div>
            </section>
          ) : null}

          {hasProjects ? (
            <section className="sr-cva-cv-preview__section">
              <h2 className="sr-cva-cv-preview__section-title">
                <Sparkles className="h-4 w-4" aria-hidden />
                {t('student.internshipOffers.cvDashboard.preview.projects')}
              </h2>
              <div className="sr-cva-cv-preview__stack">
                {projects.map((item, index) => {
                  const projectName = text(item.name);
                  const desc = text(item.desc);
                  const link = text(item.link);
                  if (!projectName && !desc) return null;
                  return (
                    <article key={`proj-${index}`} className="sr-cva-cv-preview__entry">
                      <div className="sr-cva-cv-preview__entry-head">
                        {projectName ? (
                          <p className="sr-cva-cv-preview__entry-title">
                            <strong>{projectName}</strong>
                          </p>
                        ) : null}
                        {link ? (
                          <a href={link} target="_blank" rel="noreferrer" className="sr-cva-cv-preview__link">
                            {t('student.internshipOffers.cvDashboard.preview.projectLink')}
                          </a>
                        ) : null}
                      </div>
                      {desc ? <p className="sr-cva-cv-preview__paragraph">{desc}</p> : null}
                    </article>
                  );
                })}
              </div>
            </section>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default CvFullPreview;
