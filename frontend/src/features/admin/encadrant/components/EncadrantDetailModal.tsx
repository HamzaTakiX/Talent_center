import { FunctionComponent, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  AlertCircle,
  Eye,
  GraduationCap,
  Loader2,
  Mail,
  UserCog,
  Users,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { adminEncadrantsApi } from '../../api/encadrants';
import type { AdminEncadrantDetail, AdminEncadrantRow } from '../../api/types';
import AdminCredentialReveal from '../../ui/AdminCredentialReveal';
import AdminEntityDetailHero from '../../ui/AdminEntityDetailHero';
import AdminEntityDetailModal from '../../ui/AdminEntityDetailModal';
import type { AdminDetailSection } from '../../ui/AdminDetailGrid';
import { useAdminTableValues } from '../../i18n/useAdminTableValues';
import { buildEntityInitials } from '../../shared/utils/buildEntityInitials';
import { scopeProgramsPreview } from '../../shared/utils/programDisplay';
import { resolveMediaUrl } from '../../../../shared/api/mediaUrl';
import {
  adminEncadrantDeskChatPath,
  openAdminEncadrantDeskChat,
} from '../../shared/platform-desk-chat/utils/openAdminPlatformDeskChat';
import { specializationDomainLabel, isSpecializationDomainOption } from '../utils/specializationDomainDisplay';

const FORM_PREFIX = 'admin.forms.createEncadrant';
const SCOPE_PREFIX = `${FORM_PREFIX}.academicScope`;
const DETAIL_PREFIX = 'admin.common.detailModal';

function copyableText(value: string | null | undefined, skip: Set<string>): string | undefined {
  const text = value?.trim();
  if (!text || skip.has(text)) return undefined;
  return text;
}

interface EncadrantDetailModalProps {
  open: boolean;
  encadrant?: AdminEncadrantRow | null;
  encadrantId?: number | null;
  onClose: () => void;
  onEdit: (id: number) => void;
}

function workloadLabel(
  current: number,
  max: number,
  translate: (key: string, options?: Record<string, number>) => string,
): string {
  if (max <= 0) return `${current}`;
  const pct = Math.round((current / max) * 100);
  if (pct >= 100) return translate(`${FORM_PREFIX}.detail.workloadFull`, { current, max });
  if (pct >= 80) return translate(`${FORM_PREFIX}.detail.workloadHigh`, { current, max });
  return translate(`${FORM_PREFIX}.detail.workloadOk`, { current, max });
}

const EncadrantDetailModal: FunctionComponent<EncadrantDetailModalProps> = ({
  open,
  encadrant = null,
  encadrantId = null,
  onClose,
  onEdit,
}) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { accountStatus } = useAdminTableValues();
  const [detail, setDetail] = useState<AdminEncadrantDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [chatError, setChatError] = useState('');
  const [openingChat, setOpeningChat] = useState(false);

  const resolvedId = encadrant?.id ?? encadrantId ?? null;

  useEffect(() => {
    if (!open || resolvedId == null) {
      setDetail(null);
      setLoadError(false);
      setChatError('');
      setOpeningChat(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setLoadError(false);
    void adminEncadrantsApi
      .get(resolvedId)
      .then((data) => {
        if (!cancelled) setDetail(data);
      })
      .catch(() => {
        if (!cancelled) {
          setDetail(encadrant as AdminEncadrantDetail | null);
          setLoadError(true);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, resolvedId, encadrant]);

  const display = detail ?? encadrant;
  const profile = detail?.profile;
  const neverLogin = t('admin.tables.administrators.neverLoggedIn');
  const dateLocale = i18n.language.startsWith('ar')
    ? 'ar-MA'
    : i18n.language.startsWith('en')
      ? 'en-GB'
      : 'fr-FR';

  const formatDate = (iso: string | null | undefined) => {
    if (!iso) return neverLogin;
    try {
      return new Date(iso).toLocaleString(dateLocale);
    } catch {
      return neverLogin;
    }
  };

  const sections: AdminDetailSection[] = useMemo(() => {
    if (!display) return [];
    const scopes = display.scopes;
    const allDomains = display.specialization_domains ?? [];
    const businessDomains = allDomains.filter(
      (d) => !isSpecializationDomainOption(d) || d.category === 'BUSINESS',
    );
    const techDomains = allDomains.filter(
      (d) => isSpecializationDomainOption(d) && d.category === 'TECH',
    );
    const formatDomains = (domains: typeof allDomains) =>
      domains.length === 0
        ? '—'
        : domains.map((d) => specializationDomainLabel(d, t)).join(', ');

    const supervisedTypeList = display.supervised_internship_types ?? [];
    const supervisedTypes =
      supervisedTypeList.length === 0
        ? '—'
        : supervisedTypeList
            .map((item) =>
              item.duration_hint ? `${item.name} (${item.duration_hint})` : item.name,
            )
            .join(', ');

    const skipCopy = new Set([
      '—',
      neverLogin,
      t('admin.common.yes'),
      t('admin.common.no'),
    ]);
    const copy = (value: string | null | undefined) => copyableText(value, skipCopy);

    const academicFields: AdminDetailSection['fields'] = [
      {
        fieldKey: 'filiere',
        label: t(`${SCOPE_PREFIX}.filiere`),
        value: scopes?.filiere_labels?.length
          ? scopes.filiere_labels.join(', ')
          : t('admin.tables.administrators.scopeGlobal'),
        copyValue: copy(
          scopes?.filiere_labels?.length ? scopes.filiere_labels.join(', ') : undefined,
        ),
      },
      {
        fieldKey: 'levels',
        label: t(`${SCOPE_PREFIX}.levels`),
        value: scopes?.level_labels?.length ? scopes.level_labels.join(', ') : '—',
        copyValue: copy(
          scopes?.level_labels?.length ? scopes.level_labels.join(', ') : undefined,
        ),
      },
      {
        fieldKey: 'academicYear',
        label: t(`${SCOPE_PREFIX}.academicYears`),
        value: scopes?.academic_years?.length ? scopes.academic_years.join(', ') : '—',
        copyValue: copy(
          scopes?.academic_years?.length ? scopes.academic_years.join(', ') : undefined,
        ),
      },
      {
        fieldKey: 'specializationDomains',
        label: t(`${SCOPE_PREFIX}.specializationDomains`),
        value: formatDomains(businessDomains),
        copyValue: copy(businessDomains.length ? formatDomains(businessDomains) : undefined),
      },
    ];

    if (techDomains.length > 0) {
      academicFields.push({
        fieldKey: 'technicalSpecializationDomains',
        label: t(`${SCOPE_PREFIX}.technicalSpecializationDomains`),
        value: formatDomains(techDomains),
        copyValue: copy(formatDomains(techDomains)),
      });
    }

    if (scopes?.sector_labels?.length || scopes?.sector_ids?.length) {
      academicFields.push({
        fieldKey: 'sectors',
        label: t(`${SCOPE_PREFIX}.sectors`),
        value: scopes?.sector_labels?.length ? scopes.sector_labels.join(', ') : '—',
        copyValue: copy(
          scopes?.sector_labels?.length ? scopes.sector_labels.join(', ') : undefined,
        ),
      });
    }

    return [
      {
        sectionKey: 'identity',
        title: t('admin.common.detailModal.sections.identity'),
        fields: [
          {
            fieldKey: 'fullName',
            label: t(`${FORM_PREFIX}.fields.fullName`),
            value: display.full_name,
            copyValue: copy(display.full_name),
          },
          {
            fieldKey: 'email',
            label: t(`${FORM_PREFIX}.fields.email`),
            value: display.email,
            copyValue: copy(display.email),
          },
          {
            fieldKey: 'createdAt',
            label: t('admin.common.detailModal.fields.createdAt'),
            value: formatDate(display.created_at),
            copyValue: copy(formatDate(display.created_at)),
          },
        ],
      },
      {
        sectionKey: 'academic',
        title: t('admin.common.detailModal.sections.academicScope'),
        fields: academicFields,
      },
      {
        sectionKey: 'overview',
        title: t(`${FORM_PREFIX}.sections.supervision`),
        fields: [
          {
            fieldKey: 'supervisedInternships',
            label: t(`${FORM_PREFIX}.supervisedInternships.label`),
            value: supervisedTypes,
            copyValue: copy(supervisedTypes !== '—' ? supervisedTypes : undefined),
          },
          {
            fieldKey: 'maxStudents',
            label: t(`${FORM_PREFIX}.fields.maxStudents`),
            value: String(display.max_students),
            copyValue: copy(String(display.max_students)),
          },
          {
            fieldKey: 'student',
            label: t(`${FORM_PREFIX}.detail.assignedStudents`),
            value: workloadLabel(display.current_students, display.max_students, (key, opts) =>
              t(key, opts as Record<string, number>),
            ),
            copyValue: copy(
              workloadLabel(display.current_students, display.max_students, (key, opts) =>
                t(key, opts as Record<string, number>),
              ),
            ),
          },
        ],
      },
      {
        sectionKey: 'access',
        title: t('admin.common.detailModal.sections.access'),
        fields: [
          {
            fieldKey: 'status',
            label: t(`${FORM_PREFIX}.detail.accountStatus`),
            value: accountStatus(display.account_status),
            copyValue: copy(accountStatus(display.account_status)),
          },
          {
            fieldKey: 'platformAccess',
            label: t(`${FORM_PREFIX}.fields.grantAccess`),
            value: display.platform_access_granted ? t('admin.common.yes') : t('admin.common.no'),
          },
          {
            fieldKey: 'active',
            label: t(`${FORM_PREFIX}.fields.isActive`),
            value: display.is_encadrant_active ? t('admin.common.yes') : t('admin.common.no'),
          },
          {
            fieldKey: 'sso',
            label: t('admin.common.detailModal.fields.sso'),
            value: display.sso_enabled ? t('admin.common.yes') : t('admin.common.no'),
          },
          {
            fieldKey: 'lastLogin',
            label: t('admin.common.detailModal.fields.lastLogin'),
            value: formatDate(display.last_login_at),
            copyValue: copy(formatDate(display.last_login_at)),
          },
          {
            fieldKey: 'onboarding',
            label: t(`${FORM_PREFIX}.detail.firstLoginCompleted`),
            value: display.first_login_completed
              ? t('admin.common.yes')
              : t('admin.common.no'),
          },
        ],
      },
    ];
  }, [display, t, accountStatus, neverLogin, dateLocale]);

  if (!open || resolvedId == null || !display) return null;

  const displayName =
    display.full_name ||
    [display.first_name, display.last_name].filter(Boolean).join(' ') ||
    '—';
  const displayEmail = display.email || '—';
  const avatarUrl = resolveMediaUrl(profile?.avatar ?? null);
  const initials = buildEntityInitials(displayName, displayEmail);
  const scopeLabel = scopeProgramsPreview(
    display.scopes?.filiere_codes,
    display.scopes?.filiere_labels,
    t('admin.tables.administrators.scopeGlobal'),
    3,
  );
  const workloadChip = `${display.current_students} / ${display.max_students}`;

  const showChatButton = Boolean(encadrant?.is_active ?? display.is_active);

  const handleOpenChat = () => {
    if (!resolvedId || !showChatButton || openingChat) return;
    setChatError('');
    setOpeningChat(true);
    void openAdminEncadrantDeskChat(resolvedId)
      .then((conversationId) => {
        onClose();
        navigate(adminEncadrantDeskChatPath(conversationId));
      })
      .catch(() => {
        setChatError(t(`${DETAIL_PREFIX}.student.chatOpenError`));
      })
      .finally(() => {
        setOpeningChat(false);
      });
  };

  return (
    <AdminEntityDetailModal
      open={open}
      onClose={onClose}
      title={t(`${DETAIL_PREFIX}.encadrant.title`)}
      description={displayEmail}
      sections={sections}
      onEdit={() => onEdit(resolvedId)}
      maxWidthClass="max-w-[780px]"
      showReadOnlyBanner={false}
      headerIcon={UserCog}
      onSendMessage={showChatButton ? handleOpenChat : undefined}
      sendMessageLoading={openingChat}
      sendMessageLabel={t(`${DETAIL_PREFIX}.encadrant.sendMessage`)}
      afterSections={
        <AdminCredentialReveal kind="encadrant" userId={resolvedId} enabled={open} />
      }
      headerContent={
        <div className="admin-student-detail-hero-wrap">
          <AdminEntityDetailHero
            name={displayName}
            avatarUrl={avatarUrl}
            initials={initials}
            statusLabel={accountStatus(display.account_status)}
            avatarAlt={displayName ? `Photo de ${displayName}` : undefined}
            chips={[
              { icon: Mail, label: displayEmail },
              { icon: GraduationCap, label: scopeLabel },
              { icon: Users, label: workloadChip },
            ]}
          />

          {loading ? (
            <div className="student-detail-load-bar" role="status" aria-label={t(`${DETAIL_PREFIX}.loading`)}>
              <motion.div
                className="student-detail-load-bar__fill"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 1.6, ease: 'easeOut' }}
                style={{ transformOrigin: 'left' }}
              />
              <span className="student-detail-load-bar__label" aria-hidden>
                <Loader2 className="h-3 w-3 shrink-0 animate-spin" strokeWidth={2} />
                {t(`${DETAIL_PREFIX}.loading`)}
              </span>
            </div>
          ) : null}

          {loadError ? (
            <div className="student-detail-alert student-detail-alert--error" role="alert">
              <AlertCircle className="student-detail-alert__icon" strokeWidth={1.75} aria-hidden />
              <span>{t(`${DETAIL_PREFIX}.loadError`)}</span>
            </div>
          ) : null}

          {chatError ? (
            <div className="student-detail-alert student-detail-alert--error" role="alert">
              <AlertCircle className="student-detail-alert__icon" strokeWidth={1.75} aria-hidden />
              <span>{chatError}</span>
            </div>
          ) : null}

          <div className="student-detail-readonly-notice">
            <Eye className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} aria-hidden />
            <span>{t('admin.common.detailModal.readOnlyHint')}</span>
          </div>
        </div>
      }
    />
  );
};

export default EncadrantDetailModal;
