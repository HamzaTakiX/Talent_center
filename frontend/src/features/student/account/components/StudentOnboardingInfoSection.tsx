import { FunctionComponent, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../auth/hooks/useAuth';
import type { StudentProfile } from '../../../auth/types';
import AccountSection from '../../../admin/account/components/AccountSection';
import AdminDetailGrid, { type AdminDetailSection } from '../../../admin/ui/AdminDetailGrid';

const EMPTY = '—';

const MOBILITY_LABEL_BY_API: Record<string, string> = {
  'Within City': 'withinCity',
  National: 'national',
  International: 'international',
  Remote: 'remote',
};

function displayText(value: string | null | undefined, fallback = EMPTY): string {
  const trimmed = value?.trim();
  return trimmed ? trimmed : fallback;
}

function formatDate(value: string | null | undefined, locale: string, fallback = EMPTY): string {
  if (!value?.trim()) return fallback;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric' });
}

function formatAvailability(
  profile: StudentProfile,
  t: (key: string) => string,
  locale: string,
  fallback: string,
): string {
  const availability = profile.availability?.trim();
  if (!availability) return fallback;
  if (availability === 'immediately') {
    return t('auth.completeProfile.availability.immediately');
  }
  if (availability === 'specific') {
    const dateLabel = formatDate(profile.start_date, locale, '');
    const base = t('auth.completeProfile.availability.specificDate');
    return dateLabel ? `${base} — ${dateLabel}` : base;
  }
  return availability;
}

function formatMobility(
  mobility: string[] | undefined,
  t: (key: string) => string,
  fallback: string,
): string {
  if (!mobility?.length) return fallback;
  const labels = mobility
    .map((item) => {
      const key = MOBILITY_LABEL_BY_API[item.trim()];
      return key ? t(`auth.completeProfile.mobility.${key}`) : item.trim();
    })
    .filter(Boolean);
  return labels.length ? labels.join(', ') : fallback;
}

function formatSkills(skills: string[] | undefined, fallback: string): string {
  if (!skills?.length) return fallback;
  const labels = skills.map((skill) => skill.trim()).filter(Boolean);
  return labels.length ? labels.join(', ') : fallback;
}

const StudentOnboardingInfoSection: FunctionComponent = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const profile = user?.student_profile;
  const emptyLabel = t('auth.confirmIdentity.placeholders.emptyValue', { defaultValue: EMPTY });
  const dateLocale = i18n.language.startsWith('ar')
    ? 'ar-MA'
    : i18n.language.startsWith('en')
      ? 'en-GB'
      : 'fr-FR';

  const sections = useMemo((): AdminDetailSection[] => {
    if (!profile) return [];

    const identityFields = [
      {
        label: t('auth.confirmIdentity.fields.firstName'),
        value: displayText(profile.first_name, emptyLabel),
        fieldKey: 'firstName' as const,
      },
      {
        label: t('auth.confirmIdentity.fields.lastName'),
        value: displayText(profile.last_name, emptyLabel),
        fieldKey: 'lastName' as const,
      },
      {
        label: t('auth.confirmIdentity.fields.dateOfBirth'),
        value: formatDate(profile.date_of_birth, dateLocale, emptyLabel),
      },
      {
        label: t('student.profile.onboarding.fields.academicYear'),
        value: displayText(profile.academic_year, emptyLabel),
        fieldKey: 'academicYear' as const,
      },
      {
        label: t('auth.confirmIdentity.fields.programMajor'),
        value: displayText(profile.program_major, emptyLabel),
        fieldKey: 'filiere' as const,
      },
      {
        label: t('auth.confirmIdentity.fields.currentClass'),
        value: displayText(profile.current_class, emptyLabel),
        fieldKey: 'class' as const,
      },
    ];

    const professionalFields = [
      {
        label: t('auth.completeProfile.fields.linkedin'),
        value: profile.linkedin_url?.trim() ? (
          <a
            href={profile.linkedin_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--admin-brand)] underline-offset-2 hover:underline break-all"
          >
            {profile.linkedin_url}
          </a>
        ) : (
          emptyLabel
        ),
      },
      {
        label: t('auth.completeProfile.fields.professionalSummary'),
        value: (
          <span className="whitespace-pre-wrap">
            {displayText(profile.professional_summary, emptyLabel)}
          </span>
        ),
        fieldKey: 'message' as const,
      },
      {
        label: t('auth.completeProfile.fields.careerObjective'),
        value: (
          <span className="whitespace-pre-wrap">
            {displayText(profile.internship_type_name || profile.career_objective, emptyLabel)}
          </span>
        ),
        fieldKey: 'offerTitle' as const,
      },
      {
        label: t('auth.completeProfile.fields.skills'),
        value: formatSkills(profile.skills, emptyLabel),
        fieldKey: 'skills' as const,
      },
    ];

    const preferencesFields = [
      {
        label: t('auth.completeProfile.fields.whenStart'),
        value: formatAvailability(profile, t, dateLocale, emptyLabel),
        fieldKey: 'duration' as const,
      },
      {
        label: t('auth.completeProfile.fields.city'),
        value: displayText(profile.city, emptyLabel),
        fieldKey: 'location' as const,
      },
      {
        label: t('auth.completeProfile.fields.mobility'),
        value: formatMobility(profile.mobility, t, emptyLabel),
      },
    ];

    const internshipFields = [
      {
        label: t('student.profile.onboarding.fields.academicLevel'),
        value: displayText(profile.academic_level_name, emptyLabel),
        fieldKey: 'specialization' as const,
      },
      ...(profile.academic_sector_name?.trim()
        ? [
            {
              label: t('student.profile.onboarding.fields.academicSector'),
              value: displayText(profile.academic_sector_name, emptyLabel),
              fieldKey: 'specialization' as const,
            },
          ]
        : []),
      {
        label: t('student.profile.onboarding.fields.internshipType'),
        value: displayText(profile.internship_type_name, emptyLabel),
        fieldKey: 'type' as const,
      },
      {
        label: t('student.profile.onboarding.fields.internshipDuration'),
        value: displayText(profile.internship_duration, emptyLabel),
        fieldKey: 'duration' as const,
      },
    ];

    return [
      {
        sectionKey: 'identity' as const,
        title: t('student.profile.onboarding.sections.identity'),
        fields: identityFields,
      },
      {
        sectionKey: 'offer' as const,
        title: t('student.profile.onboarding.sections.internship'),
        fields: internshipFields,
      },
      {
        sectionKey: 'bio' as const,
        title: t('auth.completeProfile.sections.professional'),
        fields: professionalFields,
      },
      {
        sectionKey: 'overview' as const,
        title: t('auth.completeProfile.sections.availability'),
        fields: preferencesFields,
      },
    ];
  }, [profile, t, dateLocale, emptyLabel]);

  if (!profile) return null;

  return (
    <AccountSection
      sectionKey="academic"
      sectionId="profile-onboarding-info"
      title={t('student.profile.onboarding.title')}
      description={t('student.profile.onboarding.description')}
    >
      <AdminDetailGrid sections={sections} className="admin-detail-grid--profile" />
    </AccountSection>
  );
};

export default StudentOnboardingInfoSection;
