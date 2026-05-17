import { FunctionComponent, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { easePremium } from '../ui/animations';
import PlatformHealthOverview from './PlatformHealthOverview';

const localeMap: Record<string, string> = {
  fr: 'fr-FR',
  en: 'en-US',
  ar: 'ar-MA',
};

const DashboardPageHero: FunctionComponent = () => {
  const { t, i18n } = useTranslation();

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
      data-admin-search-id="dashboard-hero"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: easePremium }}
      className="relative overflow-hidden rounded-admin-xl border border-[var(--admin-border)] bg-[var(--admin-bg-elevated)] px-4 py-4 shadow-admin-sm sm:px-6 sm:py-5 md:px-7 md:py-6"
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

      <motion.div className="admin-dashboard-hero-layout">
        <motion.div
          className="admin-dashboard-hero-left min-w-0"
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.05, duration: 0.4, ease: easePremium }}
        >
          <motion.div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[var(--admin-border)] bg-[var(--admin-brand-muted)] px-3 py-1 text-xs font-medium text-[var(--admin-brand)]">
            <Sparkles className="h-3.5 w-3.5" strokeWidth={2} />
            <span>{t('admin.dashboard.hero.badge')}</span>
          </motion.div>
          <h1 className="text-xl font-bold tracking-tight text-[var(--admin-text)] sm:text-2xl">
            {t('admin.dashboard.hero.title')}
          </h1>
          <p className="mt-1 text-xs capitalize text-[var(--admin-text-secondary)] sm:text-sm">{formattedDate}</p>
        </motion.div>

        <motion.div
          className="admin-dashboard-hero-center"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.45, ease: easePremium }}
        >
          <PlatformHealthOverview />
        </motion.div>
      </motion.div>
    </motion.header>
  );
};

export default DashboardPageHero;
