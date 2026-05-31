import { FunctionComponent, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Briefcase, FileText, Sparkles, Bell } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { easePremium } from '../../../admin/dashboard/ui/animations';
import StudentHeroAnalyticsWidgets from './hero/StudentHeroAnalyticsWidgets';
import { STUDENT_INTERNSHIP_OFFERS_PATH } from '../../internship_offers/constants/routes';
import { STUDENT_ANNOUNCEMENTS_PATH } from '../../Annoucements/constants/routes';
import { STUDENT_DASHBOARD_PATH } from '../../config/studentNavConfig';

const localeMap: Record<string, string> = {
  fr: 'fr-FR',
  en: 'en-US',
  ar: 'ar-MA',
};

const StudentDashboardPageHero: FunctionComponent = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const formattedDate = useMemo(() => {
    const locale = localeMap[i18n.language] ?? 'fr-FR';
    return new Intl.DateTimeFormat(locale, {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date());
  }, [i18n.language]);

  return (
    <motion.header
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: easePremium }}
      className="student-dashboard-hero relative overflow-hidden rounded-admin-xl border border-[var(--admin-border)] bg-[var(--admin-bg-elevated)] px-4 py-4 shadow-admin-sm sm:px-6 sm:py-5 md:px-7 md:py-6"
    >
      <motion.div
        className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full opacity-60 blur-3xl"
        style={{ background: 'var(--admin-brand-muted)' }}
        aria-hidden
      />
      <motion.div
        className="pointer-events-none absolute -bottom-12 left-1/3 h-32 w-32 rounded-full opacity-40 blur-3xl"
        style={{ background: 'var(--admin-mesh-2)' }}
        aria-hidden
      />

      <div className="admin-dashboard-hero-layout">
        <motion.div
          className="admin-dashboard-hero-left min-w-0"
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.05, duration: 0.4, ease: easePremium }}
        >
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[var(--admin-border)] bg-[var(--admin-brand-muted)] px-3 py-1 text-xs font-medium text-[var(--admin-brand)]">
            <Sparkles className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
            <span>{t('student.dashboard.hero.badge')}</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-[var(--admin-text)] sm:text-2xl">
            {t('student.dashboard.hero.title')}
          </h1>
          <p className="mt-1 text-xs text-[var(--admin-text-secondary)] sm:text-sm">
            {t('student.dashboard.hero.subtitle')}
          </p>
          <p className="mt-0.5 text-xs capitalize text-[var(--admin-text-muted)] sm:text-[13px]">
            {formattedDate}
          </p>

          <div className="student-hero-quick-actions">
            <button
              type="button"
              className="admin-btn admin-btn-primary admin-btn--sm"
              onClick={() => navigate(STUDENT_INTERNSHIP_OFFERS_PATH)}
            >
              <Briefcase className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
              {t('student.dashboard.hero.quickActions.browseOffers')}
            </button>
            <button
              type="button"
              className="admin-btn admin-btn-secondary admin-btn--sm"
              onClick={() =>
                navigate('/cv-editor', { state: { returnTo: STUDENT_DASHBOARD_PATH } })
              }
            >
              <FileText className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
              {t('student.dashboard.hero.quickActions.improveCv')}
            </button>
            <button
              type="button"
              className="admin-btn admin-btn-outline admin-btn--sm"
              onClick={() => navigate(STUDENT_ANNOUNCEMENTS_PATH)}
            >
              <Bell className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
              {t('student.dashboard.hero.quickActions.viewAnnouncements')}
            </button>
          </div>
        </motion.div>

        <motion.div
          className="admin-dashboard-hero-center"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.45, ease: easePremium }}
        >
          <StudentHeroAnalyticsWidgets />
        </motion.div>
      </div>
    </motion.header>
  );
};

export default StudentDashboardPageHero;
