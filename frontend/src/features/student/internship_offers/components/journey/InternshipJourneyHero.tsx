import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { GraduationCap } from 'lucide-react';
import type { JourneyAcademicProfile, JourneyProfileCompletion } from '../../types/journeyTypes';

interface InternshipJourneyHeroProps {
  academicProfile: JourneyAcademicProfile;
  profileCompletion: JourneyProfileCompletion;
  cvScore: number | null;
}

const InternshipJourneyHero: FunctionComponent<InternshipJourneyHeroProps> = ({
  academicProfile,
  profileCompletion,
  cvScore,
}) => {
  const { t } = useTranslation();

  const chips = [
    academicProfile.program && { label: t('student.internshipOffers.journey.program'), value: academicProfile.program },
    academicProfile.level && { label: t('student.internshipOffers.journey.level'), value: academicProfile.level },
    academicProfile.class_name && { label: t('student.internshipOffers.journey.class'), value: academicProfile.class_name },
    academicProfile.internship_type && {
      label: t('student.internshipOffers.journey.internshipType'),
      value: academicProfile.internship_type,
    },
  ].filter(Boolean) as { label: string; value: string }[];

  return (
    <section
      aria-label={t('student.internshipOffers.journey.heroAria')}
      className="relative overflow-hidden rounded-2xl border border-[color-mix(in_srgb,var(--admin-brand)_28%,var(--admin-border))] bg-gradient-to-br from-[color-mix(in_srgb,var(--admin-brand)_12%,var(--admin-bg-elevated))] to-[var(--admin-bg-elevated)] p-4 sm:p-6"
    >
      <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-[color-mix(in_srgb,var(--admin-brand)_15%,transparent)] blur-2xl" aria-hidden />

      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-[var(--admin-brand)]" strokeWidth={1.75} aria-hidden />
            <h1 className="m-0 text-lg font-bold tracking-tight text-[var(--admin-text)] sm:text-xl">
              {t('student.internshipOffers.journey.heroTitle')}
            </h1>
          </div>
          <p className="m-0 max-w-xl text-sm text-[var(--admin-text-secondary)]">
            {t('student.internshipOffers.journey.heroSubtitle')}
          </p>

          {chips.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {chips.map((chip) => (
                <span
                  key={chip.label}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--admin-border)] bg-[var(--admin-bg-elevated)] px-2.5 py-1 text-xs"
                >
                  <span className="text-[var(--admin-text-muted)]">{chip.label}</span>
                  <span className="font-semibold text-[var(--admin-text)]">{chip.value}</span>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex shrink-0 gap-3">
          <div className="rounded-xl border border-[var(--admin-border)] bg-[var(--admin-bg-elevated)] px-4 py-3 text-center">
            <p className="m-0 text-2xl font-bold tabular-nums text-[var(--admin-brand)]">
              {profileCompletion.percent}%
            </p>
            <p className="m-0 mt-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--admin-text-muted)]">
              {t('student.internshipOffers.journey.profileCompletion')}
            </p>
          </div>
          {cvScore !== null && (
            <div className="rounded-xl border border-[var(--admin-border)] bg-[var(--admin-bg-elevated)] px-4 py-3 text-center">
              <p className="m-0 text-2xl font-bold tabular-nums text-emerald-600">{cvScore}%</p>
              <p className="m-0 mt-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--admin-text-muted)]">
                {t('student.internshipOffers.journey.cvStrength')}
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default InternshipJourneyHero;
