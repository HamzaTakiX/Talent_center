import { FunctionComponent, ReactNode, useEffect, useMemo, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { adminStudentsApi } from '../../api/students';
import type { AdminStudentDetail, AdminStudentRow, StudentIntelligenceScores } from '../../api/types';
import AdminEntityDetailModal from '../../ui/AdminEntityDetailModal';
import type { AdminDetailSection } from '../../ui/AdminDetailGrid';
import AdminBadge from '../../ui/AdminBadge';
import type { AdminBadgeVariant } from '../../ui/AdminBadge';
import { engagementBandTableBadge, tableBadge } from '../../ui/adminStatusBadges';
import { useAdminTableValues } from '../../i18n/useAdminTableValues';
import { resolveMediaUrl } from '../../../../shared/api/mediaUrl';
import { engagementBand } from '../student_cards/shared/utils/studentListFilters';

const FORM_PREFIX = 'admin.forms.createStudent';
const DETAIL_PREFIX = 'admin.common.detailModal';

export interface StudentDetailPreview {
  name?: string;
  email?: string;
  avatarUrl?: string | null;
  initials?: string;
}

interface StudentDetailModalProps {
  open: boolean;
  student?: AdminStudentRow | null;
  studentId?: number | null;
  preview?: StudentDetailPreview;
  onClose: () => void;
  onEdit: (id: number) => void;
}

function nestedLabel(
  value: number | { id: number; name?: string; code?: string } | null | undefined,
): string {
  if (value == null) return '—';
  if (typeof value === 'object') return value.name || value.code || String(value.id);
  return String(value);
}

function riskCategoryVariant(category: string): AdminBadgeVariant {
  switch (category) {
    case 'LOW':
      return 'success';
    case 'MEDIUM':
      return 'warning';
    case 'HIGH':
    case 'CRITICAL':
      return 'danger';
    default:
      return 'neutral';
  }
}

function engagementCategoryVariant(category: string): AdminBadgeVariant {
  switch (category) {
    case 'HIGHLY_ENGAGED':
    case 'ACTIVE':
      return 'success';
    case 'LOW':
      return 'warning';
    case 'INACTIVE':
      return 'neutral';
    default:
      return 'neutral';
  }
}

function healthIndexVariant(index: string): AdminBadgeVariant {
  switch (index) {
    case 'HEALTHY':
      return 'success';
    case 'NEEDS_ATTENTION':
      return 'warning';
    case 'AT_RISK':
    case 'CRITICAL':
      return 'danger';
    default:
      return 'neutral';
  }
}

function translateCode(t: TFunction, group: string, code: string): string {
  return t(`${DETAIL_PREFIX}.${group}.${code}`, {
    defaultValue: code.replace(/_/g, ' '),
  });
}

function formatScore(score: number | null | undefined, suffix = '/100'): string {
  if (score == null) return '—';
  return `${score}${suffix}`;
}

function scoreWithBadge(
  score: number | null | undefined,
  badgeLabel: string,
  badgeVariant: AdminBadgeVariant,
  suffix = '/100',
): ReactNode {
  if (score == null) return '—';
  return (
    <span className="inline-flex flex-wrap items-center gap-2">
      <span>{`${score}${suffix}`}</span>
      <span className={tableBadge(badgeVariant)}>{badgeLabel}</span>
    </span>
  );
}

function buildEngagementSection(
  display: AdminStudentRow,
  t: TFunction,
  formatDate: (iso: string | null | undefined) => string,
): AdminDetailSection {
  const intelligence = display.intelligence;
  const engagementScore = intelligence?.engagement_score ?? display.onboarding_percent ?? null;
  const engagementCategory = intelligence?.engagement_category;
  const band = engagementBand(display);
  const bandKey = band.toLowerCase() as 'high' | 'medium' | 'low';
  const profileCompletion =
    intelligence?.profile_completion_score ?? display.onboarding_percent ?? null;

  return {
    sectionKey: 'activity',
    title: t(`${DETAIL_PREFIX}.sections.engagement`),
    fields: [
      {
        fieldKey: 'engagementScore',
        label: t(`${DETAIL_PREFIX}.fields.engagementScore`),
        value:
          engagementCategory != null
            ? scoreWithBadge(
                engagementScore,
                translateCode(t, 'engagementCategories', engagementCategory),
                engagementCategoryVariant(engagementCategory),
              )
            : formatScore(engagementScore),
      },
      {
        fieldKey: 'engagementBand',
        label: t(`${DETAIL_PREFIX}.fields.engagementBand`),
        value: (
          <span className={engagementBandTableBadge(band)}>
            {t(`admin.tables.engagement.${bandKey}`)}
          </span>
        ),
      },
      {
        fieldKey: 'profileCompletion',
        label: t(`${DETAIL_PREFIX}.fields.profileCompletion`),
        value: formatScore(profileCompletion),
      },
      {
        fieldKey: 'lastLogin',
        label: t(`${DETAIL_PREFIX}.fields.lastLogin`),
        value: formatDate(display.last_login_at),
      },
      {
        fieldKey: 'computedAt',
        label: t(`${DETAIL_PREFIX}.fields.computedAt`),
        value: intelligence?.computed_at
          ? formatDate(intelligence.computed_at)
          : t(`${DETAIL_PREFIX}.fields.intelligencePending`),
      },
    ],
  };
}

function buildRiskSection(
  display: AdminStudentRow,
  t: TFunction,
  formatDate: (iso: string | null | undefined) => string,
): AdminDetailSection {
  const intelligence = display.intelligence;
  const riskFlags = display.risk_flags ?? [];

  return {
    sectionKey: 'security',
    title: t(`${DETAIL_PREFIX}.sections.riskScores`),
    fields: [
      {
        fieldKey: 'riskScore',
        label: t(`${DETAIL_PREFIX}.fields.riskScore`),
        value:
          intelligence != null
            ? scoreWithBadge(
                intelligence.risk_score,
                translateCode(t, 'riskCategories', intelligence.risk_category),
                riskCategoryVariant(intelligence.risk_category),
              )
            : t(`${DETAIL_PREFIX}.fields.intelligencePending`),
      },
      {
        fieldKey: 'healthIndex',
        label: t(`${DETAIL_PREFIX}.fields.healthIndex`),
        value: intelligence ? (
          <span className={tableBadge(healthIndexVariant(intelligence.health_index))}>
            {translateCode(t, 'healthIndex', intelligence.health_index)}
          </span>
        ) : (
          '—'
        ),
      },
      {
        fieldKey: 'healthScore',
        label: t(`${DETAIL_PREFIX}.fields.healthScore`),
        value: intelligence ? formatScore(intelligence.health_score) : '—',
      },
      {
        fieldKey: 'atRisk',
        label: t(`${DETAIL_PREFIX}.fields.atRisk`),
        value: intelligence ? (
          <AdminBadge variant={intelligence.is_at_risk ? 'danger' : 'success'}>
            {intelligence.is_at_risk ? t('admin.common.yes') : t('admin.common.no')}
          </AdminBadge>
        ) : (
          '—'
        ),
      },
      {
        fieldKey: 'riskFlags',
        label: t(`${DETAIL_PREFIX}.fields.riskFlags`),
        value:
          riskFlags.length > 0 ? (
            <span className="inline-flex flex-wrap gap-1.5">
              {riskFlags.map((flag) => (
                <span key={flag} className={tableBadge('warning')}>
                  {translateCode(t, 'riskFlags', flag)}
                </span>
              ))}
            </span>
          ) : (
            t(`${DETAIL_PREFIX}.fields.noRiskFlags`)
          ),
      },
      {
        fieldKey: 'computedAt',
        label: t(`${DETAIL_PREFIX}.fields.computedAt`),
        value: intelligence?.computed_at
          ? formatDate(intelligence.computed_at)
          : t(`${DETAIL_PREFIX}.fields.intelligencePending`),
      },
    ],
  };
}

function buildCareerInsightsSection(
  intelligence: StudentIntelligenceScores,
  t: TFunction,
): AdminDetailSection {
  return {
    sectionKey: 'overview',
    title: t(`${DETAIL_PREFIX}.sections.careerInsights`),
    fields: [
      {
        fieldKey: 'employability',
        label: t(`${DETAIL_PREFIX}.fields.employability`),
        value: formatScore(intelligence.employability_score),
      },
      {
        fieldKey: 'internshipReadiness',
        label: t(`${DETAIL_PREFIX}.fields.internshipReadiness`),
        value: formatScore(intelligence.internship_readiness_score),
      },
      {
        fieldKey: 'careerProgress',
        label: t(`${DETAIL_PREFIX}.fields.careerProgress`),
        value: formatScore(intelligence.career_progress_score),
      },
      {
        fieldKey: 'placementProbability',
        label: t(`${DETAIL_PREFIX}.fields.placementProbability`),
        value: formatScore(intelligence.placement_probability, '%'),
      },
      {
        fieldKey: 'interviewReadiness',
        label: t(`${DETAIL_PREFIX}.fields.interviewReadiness`),
        value: formatScore(intelligence.interview_readiness_score),
      },
    ],
  };
}

function buildInitials(name: string, email?: string): string {
  const trimmed = name.trim();
  const parts = trimmed.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  if (parts.length === 1 && parts[0].length >= 2) return parts[0].slice(0, 2).toUpperCase();
  const local = (email ?? '').split('@')[0] ?? '';
  if (local.length >= 2) return local.slice(0, 2).toUpperCase();
  return '??';
}

const StudentDetailHero: FunctionComponent<{
  name: string;
  email: string;
  avatarUrl?: string | null;
  initials: string;
  program?: string;
  studentClass?: string;
  statusLabel?: string;
}> = ({ name, email, avatarUrl, initials, program, studentClass, statusLabel }) => {
  const [failed, setFailed] = useState(false);
  const resolvedAvatar = avatarUrl?.trim();
  const showImage = Boolean(resolvedAvatar) && !failed;

  return (
    <div className="admin-student-detail-hero">
      <div
        className={`admin-student-detail-hero__avatar${showImage ? ' admin-student-detail-hero__avatar--photo' : ''}`}
      >
        {showImage ? (
          <img
            src={resolvedAvatar}
            alt={name ? `Photo de ${name}` : 'Photo étudiant'}
            className="admin-student-detail-hero__avatar-img"
            onError={() => setFailed(true)}
            loading="lazy"
            referrerPolicy="no-referrer"
          />
        ) : (
          <span className="admin-student-detail-hero__avatar-fallback" aria-hidden>
            {initials}
          </span>
        )}
      </div>
      <div className="admin-student-detail-hero__copy min-w-0">
        <p className="admin-student-detail-hero__name">{name}</p>
        <p className="admin-student-detail-hero__email">{email}</p>
        {(program || studentClass) && (
          <p className="admin-student-detail-hero__meta">
            {[program, studentClass].filter(Boolean).join(' · ')}
          </p>
        )}
        {statusLabel ? (
          <span className="admin-student-detail-hero__status">{statusLabel}</span>
        ) : null}
      </div>
    </div>
  );
};

const StudentDetailModal: FunctionComponent<StudentDetailModalProps> = ({
  open,
  student = null,
  studentId = null,
  preview,
  onClose,
  onEdit,
}) => {
  const { t, i18n } = useTranslation();
  const { accountStatus } = useAdminTableValues();
  const [detail, setDetail] = useState<AdminStudentDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState(false);

  const resolvedId = student?.id ?? studentId ?? null;

  useEffect(() => {
    if (!open || resolvedId == null) {
      setDetail(null);
      setLoadError(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setLoadError(false);
    void adminStudentsApi
      .get(resolvedId)
      .then((data) => {
        if (!cancelled) setDetail(data);
      })
      .catch(() => {
        if (!cancelled) {
          setDetail(student as AdminStudentDetail | null);
          setLoadError(true);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, resolvedId, student]);

  const dateLocale = i18n.language.startsWith('ar')
    ? 'ar-MA'
    : i18n.language.startsWith('en')
      ? 'en-GB'
      : 'fr-FR';

  const formatDate = (iso: string | null | undefined) => {
    if (!iso) return '—';
    try {
      return new Date(iso).toLocaleString(dateLocale);
    } catch {
      return '—';
    }
  };

  const formatDateOnly = (iso: string | null | undefined) => {
    if (!iso) return '—';
    try {
      return new Date(iso).toLocaleDateString(dateLocale);
    } catch {
      return '—';
    }
  };

  const display = detail ?? student;
  const profile = detail?.profile;
  const studentProfile = detail?.student_profile;

  const displayName =
    display?.full_name ||
    preview?.name ||
    [display?.first_name, display?.last_name].filter(Boolean).join(' ') ||
    '—';
  const displayEmail = display?.email || preview?.email || '—';
  const avatarUrl = resolveMediaUrl(
    profile?.avatar ?? student?.avatar_url ?? preview?.avatarUrl ?? null,
  );
  const initials =
    preview?.initials?.trim() || buildInitials(displayName, displayEmail);

  const sections: AdminDetailSection[] = useMemo(() => {
    if (!display) return [];

    const phone = profile?.phone || studentProfile?.phone || '—';
    const program =
      display.program_major ||
      nestedLabel(studentProfile?.filiere) ||
      display.filiere_code ||
      '—';
    const studentClass =
      display.current_class || nestedLabel(studentProfile?.class_group) || '—';

    return [
      {
        sectionKey: 'identity',
        title: t(`${DETAIL_PREFIX}.sections.identity`),
        fields: [
          { fieldKey: 'email', label: t(`${FORM_PREFIX}.fields.email`), value: display.email },
          {
            fieldKey: 'firstName',
            label: t(`${FORM_PREFIX}.fields.firstName`),
            value: display.first_name || profile?.first_name || '—',
          },
          {
            fieldKey: 'lastName',
            label: t(`${FORM_PREFIX}.fields.lastName`),
            value: display.last_name || profile?.last_name || '—',
          },
          {
            fieldKey: 'studentNumber',
            label: t(`${FORM_PREFIX}.fields.studentNumber`),
            value: display.student_number || studentProfile?.student_number || '—',
          },
          { fieldKey: 'phone', label: t(`${DETAIL_PREFIX}.fields.phone`), value: phone },
          {
            fieldKey: 'dateOfBirth',
            label: t(`${DETAIL_PREFIX}.fields.dateOfBirth`),
            value: formatDateOnly(profile?.date_of_birth),
          },
          {
            fieldKey: 'gender',
            label: t(`${DETAIL_PREFIX}.fields.gender`),
            value: profile?.gender || '—',
          },
          { fieldKey: 'city', label: t(`${DETAIL_PREFIX}.fields.city`), value: studentProfile?.city || '—' },
        ],
      },
      {
        sectionKey: 'academic',
        title: t(`${DETAIL_PREFIX}.sections.assignment`),
        fields: [
          { fieldKey: 'filiere', label: t('admin.tables.columns.field'), value: program },
          { fieldKey: 'class', label: t('admin.tables.columns.class'), value: studentClass },
          {
            fieldKey: 'academicLevel',
            label: t(`${DETAIL_PREFIX}.fields.academicLevel`),
            value: nestedLabel(studentProfile?.academic_level),
          },
          {
            fieldKey: 'academicSector',
            label: t(`${DETAIL_PREFIX}.fields.academicSector`),
            value: nestedLabel(studentProfile?.academic_sector),
          },
          {
            fieldKey: 'academicYear',
            label: t(`${FORM_PREFIX}.fields.academicYear`),
            value: display.academic_year || studentProfile?.academic_year || '—',
          },
          {
            fieldKey: 'internshipType',
            label: t(`${DETAIL_PREFIX}.fields.internshipType`),
            value:
              display.internship_type_name ||
              nestedLabel(studentProfile?.internship_type) ||
              '—',
          },
          {
            fieldKey: 'internshipDuration',
            label: t(`${DETAIL_PREFIX}.fields.internshipDuration`),
            value: display.internship_duration || studentProfile?.internship_duration || '—',
          },
          {
            fieldKey: 'internshipCategory',
            label: t(`${DETAIL_PREFIX}.fields.internshipCategory`),
            value: display.internship_category || studentProfile?.internship_category || '—',
          },
          {
            fieldKey: 'hasInternship',
            label: t(`${DETAIL_PREFIX}.fields.hasInternshipAssignment`),
            value: display.has_internship_assignment ? t('admin.common.yes') : t('admin.common.no'),
          },
          {
            fieldKey: 'onboarding',
            label: t(`${DETAIL_PREFIX}.fields.onboardingPercent`),
            value: `${display.onboarding_percent}%`,
          },
        ],
      },
      {
        sectionKey: 'profile',
        title: t(`${DETAIL_PREFIX}.sections.profile`),
        fields: [
          {
            fieldKey: 'bio',
            label: t(`${DETAIL_PREFIX}.fields.bio`),
            value: profile?.bio || studentProfile?.professional_summary || '—',
          },
          {
            fieldKey: 'careerObjective',
            label: t(`${DETAIL_PREFIX}.fields.careerObjective`),
            value: studentProfile?.career_objective || '—',
          },
          {
            fieldKey: 'linkedin',
            label: t(`${DETAIL_PREFIX}.fields.linkedin`),
            value: studentProfile?.linkedin_url || '—',
          },
          {
            fieldKey: 'availability',
            label: t(`${DETAIL_PREFIX}.fields.availability`),
            value: studentProfile?.availability || '—',
          },
          {
            fieldKey: 'mobility',
            label: t(`${DETAIL_PREFIX}.fields.mobility`),
            value: studentProfile?.mobility || '—',
          },
          {
            fieldKey: 'identityConfirmed',
            label: t(`${DETAIL_PREFIX}.fields.identityConfirmed`),
            value: display.identity_confirmed ? t('admin.common.yes') : t('admin.common.no'),
          },
          {
            fieldKey: 'profileCompleted',
            label: t(`${DETAIL_PREFIX}.fields.profileCompleted`),
            value: display.profile_completed ? t('admin.common.yes') : t('admin.common.no'),
          },
        ],
      },
      buildEngagementSection(display, t, formatDate),
      buildRiskSection(display, t, formatDate),
      ...(display.intelligence
        ? [buildCareerInsightsSection(display.intelligence, t)]
        : []),
      {
        sectionKey: 'access',
        title: t(`${DETAIL_PREFIX}.sections.access`),
        fields: [
          {
            fieldKey: 'status',
            label: t('admin.tables.columns.status'),
            value: accountStatus(display.account_status),
          },
          {
            fieldKey: 'sso',
            label: t(`${DETAIL_PREFIX}.fields.sso`),
            value: display.sso_enabled ? t('admin.common.yes') : t('admin.common.no'),
          },
          {
            fieldKey: 'platformAccess',
            label: t(`${DETAIL_PREFIX}.fields.platformAccess`),
            value: display.platform_access_granted ? t('admin.common.yes') : t('admin.common.no'),
          },
          {
            fieldKey: 'active',
            label: t(`${DETAIL_PREFIX}.fields.active`),
            value: display.is_active ? t('admin.common.yes') : t('admin.common.no'),
          },
          {
            fieldKey: 'firstLogin',
            label: t(`${FORM_PREFIX}.credentials.firstLogin`),
            value: display.first_login_completed ? t('admin.common.yes') : t('admin.common.no'),
          },
          {
            fieldKey: 'lastLogin',
            label: t(`${DETAIL_PREFIX}.fields.lastLogin`),
            value: formatDate(display.last_login_at),
          },
          {
            fieldKey: 'createdAt',
            label: t(`${DETAIL_PREFIX}.fields.createdAt`),
            value: formatDate(display.created_at),
          },
          {
            fieldKey: 'language',
            label: t(`${DETAIL_PREFIX}.fields.language`),
            value: profile?.language || '—',
          },
          {
            fieldKey: 'timezone',
            label: t(`${DETAIL_PREFIX}.fields.timezone`),
            value: profile?.timezone || '—',
          },
        ],
      },
    ];
  }, [display, profile, studentProfile, t, accountStatus, dateLocale]);

  if (!open || resolvedId == null) return null;

  const programLabel =
    display?.program_major || nestedLabel(studentProfile?.filiere) || display?.filiere_code;
  const classLabel = display?.current_class || nestedLabel(studentProfile?.class_group);

  return (
    <AdminEntityDetailModal
      open={open}
      onClose={onClose}
      title={t(`${DETAIL_PREFIX}.student.title`)}
      description={displayEmail}
      sections={sections}
      onEdit={() => onEdit(resolvedId)}
      maxWidthClass="max-w-[760px]"
      headerContent={
        <div className="admin-student-detail-hero-wrap">
          <StudentDetailHero
            name={displayName}
            email={displayEmail}
            avatarUrl={avatarUrl}
            initials={initials}
            program={programLabel || undefined}
            studentClass={classLabel || undefined}
            statusLabel={display ? accountStatus(display.account_status) : undefined}
          />
          {loading ? (
            <p className="admin-student-detail-hero__loading">
              <Loader2 className="inline size-4 animate-spin" aria-hidden />
              {t(`${DETAIL_PREFIX}.loading`)}
            </p>
          ) : null}
          {loadError ? (
            <p className="admin-student-detail-hero__error">{t(`${DETAIL_PREFIX}.loadError`)}</p>
          ) : null}
        </div>
      }
    />
  );
};

export default StudentDetailModal;
