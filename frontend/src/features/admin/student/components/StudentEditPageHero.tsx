import { FunctionComponent } from 'react';
import { motion } from 'framer-motion';
import { Hash, Mail, UserCog } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { AdminStudentDetail } from '../../api/types';
import { easePremium } from '../../dashboard/ui/animations';

const FORM_PREFIX = 'admin.forms.createStudent';

interface StudentEditPageHeroProps {
  student: AdminStudentDetail;
}

const StudentEditPageHero: FunctionComponent<StudentEditPageHeroProps> = ({ student }) => {
  const { t } = useTranslation();
  const displayName = student.full_name?.trim() || student.email || '—';
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
        <div className="admin-student-edit-hero__copy min-w-0">
          <motion.span
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35, ease: easePremium, delay: 0.1 }}
            className="admin-student-edit-hero__badge"
          >
            <UserCog className="h-3.5 w-3.5 shrink-0" strokeWidth={2} aria-hidden />
            {t(`${FORM_PREFIX}.editTitle`)}
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.38, ease: easePremium, delay: 0.15 }}
            className="admin-student-edit-hero__title"
          >
            {displayName}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.35, ease: easePremium, delay: 0.22 }}
            className="admin-student-edit-hero__subtitle"
          >
            {t(`${FORM_PREFIX}.editSubtitle`)}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: easePremium, delay: 0.28 }}
            className="admin-student-edit-hero__meta"
          >
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
          </motion.div>
        </div>

        {/* Decorative icon — visible on medium+ screens */}
        <div className="admin-student-edit-hero__deco" aria-hidden>
          <UserCog className="admin-student-edit-hero__deco-icon" strokeWidth={0.75} />
        </div>
      </div>
    </motion.header>
  );
};

export default StudentEditPageHero;
