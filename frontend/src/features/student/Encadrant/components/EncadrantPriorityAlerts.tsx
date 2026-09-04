import { CSSProperties, FunctionComponent } from 'react';
import { AlertCircle, AlertTriangle, BellRing, CheckCircle, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { easePremium } from '../../../admin/dashboard/ui/animations';
import { encadrantPriorityAlerts } from '../data/encadrantMock';
import { ENCADRANT_SURFACE_CARD } from '../constants/encadrantLayout';
import type { EncadrantAlertSeverity } from '../types';

const ALERT_ICONS: Record<EncadrantAlertSeverity, typeof AlertCircle> = {
  danger: AlertCircle,
  warning: AlertTriangle,
  success: CheckCircle,
  info: Info,
};

const ALERT_ACCENTS: Record<EncadrantAlertSeverity, { accent: string; accentBg: string }> = {
  danger: { accent: '#ef4444', accentBg: 'rgba(239, 68, 68, 0.16)' },
  warning: { accent: '#eab308', accentBg: 'rgba(234, 179, 8, 0.16)' },
  success: { accent: '#22c55e', accentBg: 'rgba(34, 197, 94, 0.16)' },
  info: { accent: '#3b82f6', accentBg: 'rgba(59, 130, 246, 0.16)' },
};

const SEVERITY_BADGE_KEYS: Record<EncadrantAlertSeverity, string> = {
  danger: 'student.encadrant.alerts.severity.danger',
  warning: 'student.encadrant.alerts.severity.warning',
  success: 'student.encadrant.alerts.severity.success',
  info: 'student.encadrant.alerts.severity.info',
};

const EncadrantPriorityAlerts: FunctionComponent = () => {
  const { t } = useTranslation();
  const count = encadrantPriorityAlerts.length;

  return (
    <section
      id="student-encadrant-alerts"
      aria-label={t('student.encadrant.alerts.title')}
      className={`${ENCADRANT_SURFACE_CARD} student-encadrant-alerts min-w-0`}
    >
      <div className="student-encadrant-alerts__header">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="student-encadrant-alerts__header-icon" aria-hidden>
            <BellRing className="h-[18px] w-[18px]" strokeWidth={1.75} />
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="m-0 font-inter text-lg font-bold leading-7 text-[var(--admin-text)]">
                {t('student.encadrant.alerts.title')}
              </h2>
              <span className="student-encadrant-alerts__count" aria-hidden>
                {count}
              </span>
            </div>
            <p className="m-0 mt-0.5 font-inter text-[13px] leading-5 text-[var(--admin-text-muted)] sm:text-sm">
              {t('student.encadrant.alerts.subtitle')}
            </p>
          </div>
        </div>
      </div>

      <div className="student-encadrant-alerts__grid">
        {encadrantPriorityAlerts.map((alert, index) => {
          const Icon = ALERT_ICONS[alert.severity];
          const colors = ALERT_ACCENTS[alert.severity];

          return (
            <motion.article
              key={alert.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.35, ease: easePremium }}
              whileHover={{ y: -2 }}
              className="student-encadrant-alert-card"
              style={
                {
                  '--encadrant-alert-accent': colors.accent,
                  '--encadrant-alert-accent-bg': colors.accentBg,
                } as CSSProperties
              }
            >
              <div className="student-encadrant-alert-card__top">
                <span className="student-encadrant-alert-card__icon" aria-hidden>
                  <Icon className="h-4 w-4" strokeWidth={1.85} />
                </span>
                <span className="student-encadrant-alert-card__badge">
                  {t(SEVERITY_BADGE_KEYS[alert.severity])}
                </span>
              </div>
              <p className="student-encadrant-alert-card__title">{t(alert.titleKey)}</p>
              <p className="student-encadrant-alert-card__message">{t(alert.messageKey)}</p>
            </motion.article>
          );
        })}
      </div>
    </section>
  );
};

export default EncadrantPriorityAlerts;
