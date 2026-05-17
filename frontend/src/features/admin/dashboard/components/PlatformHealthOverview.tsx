import { FunctionComponent, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Activity, AlertTriangle, TrendingUp, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { easePremium } from '../ui/animations';

const HEALTH_SCORE = 92;
const CRITICAL_ALERTS = 23;
const STUDENTS_AT_RISK = 18;
const ACTIVE_USERS = 1284;

const RISK_TREND = [0.35, 0.55, 0.7, 0.55, 0.4];
const ACTIVITY_TREND = [0.4, 0.5, 0.65, 0.85, 0.75];

const localeMap: Record<string, string> = {
  fr: 'fr-FR',
  en: 'en-US',
  ar: 'ar-MA',
};

const HealthRing: FunctionComponent<{ score: number; label: string }> = ({ score, label }) => {
  const size = 96;
  const stroke = 7;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <motion.div
      className="admin-health-ring"
      whileHover={{ scale: 1.04 }}
      transition={{ type: 'spring', stiffness: 420, damping: 26 }}
    >
      <div className="admin-health-ring-glow" aria-hidden />
      <motion.div
        className="admin-health-ring-pulse"
        animate={{ scale: [1, 1.08, 1], opacity: [0.5, 0.85, 0.5] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        aria-hidden
      />
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="admin-health-ring-svg"
        role="img"
        aria-label={`${label}: ${score}%`}
      >
        <defs>
          <linearGradient id="admin-health-ring-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--admin-brand)" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          className="admin-health-ring-track"
          strokeWidth={stroke}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          className="admin-health-ring-progress"
          strokeWidth={stroke}
          strokeLinecap="round"
          stroke="url(#admin-health-ring-gradient)"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.1, ease: easePremium, delay: 0.15 }}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <motion.div
        className="admin-health-ring-center"
        initial={{ opacity: 0, scale: 0.88 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.25, duration: 0.45, ease: easePremium }}
      >
        <span className="admin-health-ring-value">{score}%</span>
        <span className="admin-health-ring-label">{label}</span>
      </motion.div>
    </motion.div>
  );
};

const TrendBars: FunctionComponent<{ values: number[]; variant: 'risk' | 'activity' }> = ({
  values,
  variant,
}) => (
  <span className={`admin-health-trend-bars admin-health-trend-bars--${variant}`} aria-hidden>
    {values.map((h, i) => (
      <motion.span
        key={i}
        className="admin-health-trend-bar"
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: `${Math.round(h * 100)}%`, opacity: 1 }}
        transition={{ delay: 0.35 + i * 0.05, duration: 0.35, ease: easePremium }}
        style={{ height: `${Math.round(h * 100)}%` }}
      />
    ))}
  </span>
);

const PlatformHealthOverview: FunctionComponent = () => {
  const { t, i18n } = useTranslation();

  const formattedUsers = useMemo(() => {
    const locale = localeMap[i18n.language] ?? 'fr-FR';
    return new Intl.NumberFormat(locale).format(ACTIVE_USERS);
  }, [i18n.language]);

  const indicators = [
    {
      id: 'critical',
      tone: 'critical' as const,
      icon: AlertTriangle,
      value: CRITICAL_ALERTS,
      label: t('admin.dashboard.health.criticalAlerts'),
    },
    {
      id: 'risk',
      tone: 'warning' as const,
      icon: Users,
      value: STUDENTS_AT_RISK,
      label: t('admin.dashboard.health.studentsAtRisk'),
    },
    {
      id: 'active',
      tone: 'success' as const,
      icon: Activity,
      value: formattedUsers,
      label: t('admin.dashboard.health.activeUsers'),
    },
  ];

  return (
    <motion.section
      className="admin-health-overview admin-health-overview--embedded"
      aria-label={t('admin.dashboard.health.aria')}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.12, duration: 0.45, ease: easePremium }}
    >
      <motion.div className="admin-health-overview-main">
        <HealthRing score={HEALTH_SCORE} label={t('admin.dashboard.health.platformHealth')} />

        <motion.div
          className="admin-health-divider"
          aria-hidden
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ delay: 0.2, duration: 0.35 }}
        />

        <div className="admin-health-overview-body">
          <ul className="admin-health-indicators">
            {indicators.map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.li
                  key={item.id}
                  className={`admin-health-indicator admin-health-indicator--${item.tone}`}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.07, duration: 0.38, ease: easePremium }}
                  whileHover={{ y: -1 }}
                >
                  <span className={`admin-health-indicator-icon admin-health-indicator-icon--${item.tone}`}>
                    <Icon className="h-3.5 w-3.5" strokeWidth={2.25} aria-hidden />
                  </span>
                  <span className="admin-health-indicator-text">
                    <span className="admin-health-indicator-value">{item.value}</span>
                    <span className="admin-health-indicator-label">{item.label}</span>
                  </span>
                </motion.li>
              );
            })}
          </ul>

          <motion.div
            className="admin-health-divider admin-health-divider--horizontal"
            aria-hidden
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.28, duration: 0.35 }}
          />

          <div className="admin-health-trends">
            <motion.div
              className="admin-health-trend-card admin-health-trend-card--risk"
              whileHover={{ y: -3, boxShadow: 'var(--admin-shadow-md)' }}
              transition={{ duration: 0.22 }}
            >
              <span className="admin-health-trend-head">
                <TrendingUp className="h-3.5 w-3.5 text-amber-500" strokeWidth={2} aria-hidden />
                <span className="admin-health-trend-label">{t('admin.dashboard.health.riskTrend')}</span>
              </span>
              <TrendBars values={RISK_TREND} variant="risk" />
            </motion.div>
            <motion.div
              className="admin-health-trend-card admin-health-trend-card--activity"
              whileHover={{ y: -3, boxShadow: 'var(--admin-shadow-md)' }}
              transition={{ duration: 0.22 }}
            >
              <span className="admin-health-trend-head">
                <Activity className="h-3.5 w-3.5 text-[var(--admin-brand)]" strokeWidth={2} aria-hidden />
                <span className="admin-health-trend-label">
                  {t('admin.dashboard.health.activityTrend')}
                </span>
              </span>
              <TrendBars values={ACTIVITY_TREND} variant="activity" />
            </motion.div>
          </div>
        </div>
      </motion.div>
    </motion.section>
  );
};

export default PlatformHealthOverview;
