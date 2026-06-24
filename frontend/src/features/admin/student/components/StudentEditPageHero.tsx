import { FunctionComponent, useState } from 'react';
import { motion } from 'framer-motion';
import { Hash, Mail, UserCog } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { AdminStudentDetail } from '../../api/types';
import { easePremium } from '../../dashboard/ui/animations';
import { getAdminUserInitials, resolveAvatarUrl } from '../../dashboard/utils/adminUserDisplay';

const FORM_PREFIX = 'admin.forms.createStudent';

interface StudentEditPageHeroProps {
  student: AdminStudentDetail;
}

const StudentEditPageHero: FunctionComponent<StudentEditPageHeroProps> = ({ student }) => {
  const { t } = useTranslation();
  const [avatarFailed, setAvatarFailed] = useState(false);
  const avatarUrl = resolveAvatarUrl(student.profile?.avatar);
  const showAvatar = Boolean(avatarUrl) && !avatarFailed;
  const displayName = student.full_name?.trim() || student.email || '—';
  const initials = getAdminUserInitials(displayName, student.email);
  const statusLabel = t(`${FORM_PREFIX}.accountStatus.${student.account_status}`);

  return (
    <motion.header
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: easePremium }}
      className="admin-student-edit-hero"
    >
      <div className="admin-student-edit-hero__mesh admin-student-edit-hero__mesh--primary" aria-hidden />
      <div className="admin-student-edit-hero__mesh admin-student-edit-hero__mesh--secondary" aria-hidden />
      <div className="admin-student-edit-hero__shine" aria-hidden />

      <div className="admin-student-edit-hero__inner">
        <div
          className={`admin-student-edit-hero__avatar${showAvatar ? ' admin-student-edit-hero__avatar--photo' : ''}`}
        >
          {showAvatar ? (
            <img
              src={avatarUrl!}
              alt={displayName ? `Photo de ${displayName}` : 'Photo étudiant'}
              className="admin-student-edit-hero__avatar-img"
              onError={() => setAvatarFailed(true)}
              loading="lazy"
              referrerPolicy="no-referrer"
            />
          ) : (
            <span className="admin-student-edit-hero__avatar-fallback" aria-hidden>
              {initials}
            </span>
          )}
        </div>

        <div className="admin-student-edit-hero__copy min-w-0">
          <span className="admin-student-edit-hero__badge">
            <UserCog className="h-3.5 w-3.5 shrink-0" strokeWidth={2} aria-hidden />
            {t(`${FORM_PREFIX}.editTitle`)}
          </span>
          <h1 className="admin-student-edit-hero__title">{displayName}</h1>
          <p className="admin-student-edit-hero__subtitle">{t(`${FORM_PREFIX}.editSubtitle`)}</p>

          <div className="admin-student-edit-hero__meta">
            <span className="admin-student-edit-hero__chip">
              <Mail className="h-3.5 w-3.5 shrink-0 opacity-80" strokeWidth={2} aria-hidden />
              <span className="truncate">{student.email}</span>
            </span>
            {student.student_number ? (
              <span className="admin-student-edit-hero__chip">
                <Hash className="h-3.5 w-3.5 shrink-0 opacity-80" strokeWidth={2} aria-hidden />
                <span>{student.student_number}</span>
              </span>
            ) : null}
            <span className="admin-student-edit-hero__status">{statusLabel}</span>
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default StudentEditPageHero;
