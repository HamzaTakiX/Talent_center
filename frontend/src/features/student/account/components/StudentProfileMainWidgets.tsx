import { FunctionComponent, ReactNode, useId } from 'react';
import { motion } from 'framer-motion';
import { Briefcase, Check, Circle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { easePremium } from '../../../admin/dashboard/ui/animations';
import {
  useStudentProfileWidgetData,
  type ProfileWidgetChecklistItem,
} from '../hooks/useStudentProfileWidgetData';

const EMPTY = '—';

const WidgetShell: FunctionComponent<{
  children: ReactNode;
  accent?: 'brand' | 'emerald' | 'violet' | 'cyan';
  delay?: number;
}> = ({ children, accent = 'brand', delay = 0 }) => (
  <motion.article
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.4, ease: easePremium }}
    whileHover={{ y: -2 }}
    className={`student-hero-widget student-hero-widget--${accent}`}
  >
    {children}
  </motion.article>
);

const MiniRadialRing: FunctionComponent<{
  percent: number;
  size?: number;
  gradientId: string;
  accentColor?: string;
}> = ({ percent, size = 52, gradientId, accentColor }) => {
  const stroke = 5;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="student-hero-ring-sm" style={{ width: size, height: size }}>
      <span className="student-hero-ring-sm__glow" aria-hidden />
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={accentColor ?? 'var(--admin-brand)'} />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          className="student-hero-ring-sm__track"
          strokeWidth={stroke}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          stroke={`url(#${gradientId})`}
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: easePremium, delay: 0.1 }}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <span className="student-hero-ring-sm__value">{percent}%</span>
    </div>
  );
};

const WidgetChecklist: FunctionComponent<{
  items: ProfileWidgetChecklistItem[];
  labelKey: string;
  translationPrefix: string;
  compact?: boolean;
}> = ({ items, labelKey, translationPrefix, compact = false }) => {
  const { t } = useTranslation();

  return (
    <ul
      className={`student-hero-checklist${compact ? ' student-hero-checklist--compact' : ''}`}
      aria-label={t(labelKey)}
    >
      {items.map((item) => (
        <li key={item.key} className={item.done ? 'is-done' : ''}>
          {item.done ? (
            <Check className="h-3 w-3" strokeWidth={2.5} aria-hidden />
          ) : (
            <Circle className="h-3 w-3" strokeWidth={2} aria-hidden />
          )}
          <span>{t(`${translationPrefix}.${item.key}`)}</span>
        </li>
      ))}
    </ul>
  );
};

const StudentProfileMainWidgets: FunctionComponent = () => {
  const { t } = useTranslation();
  const uid = useId();
  const data = useStudentProfileWidgetData();

  return (
    <div className="student-dashboard-hero-metrics student-profile-main-widgets w-full">
      <WidgetShell accent="brand" delay={0.05}>
        <div className="student-hero-widget__head">
          <div className="min-w-0">
            <p className="student-hero-widget__label">
              {t('student.profile.widgets.profileCompletion')}
            </p>
            <p className="student-hero-widget__value">{data.profilePercent}%</p>
          </div>
          <MiniRadialRing percent={data.profilePercent} gradientId={`profile-main-ring${uid}`} />
        </div>

        <WidgetChecklist
          items={data.profileChecklist}
          labelKey="student.profile.widgets.profileSections"
          translationPrefix="student.profile.widgets.checklist"
        />

        <p className="student-hero-widget__insight">
          {t('student.profile.widgets.insight.profile', { count: data.profileMissingCount })}
        </p>
      </WidgetShell>

      <WidgetShell accent="cyan" delay={0.1}>
        <div className="student-hero-widget__head">
          <div className="min-w-0">
            <p className="student-hero-widget__label">{t('student.profile.widgets.onboarding')}</p>
            <p className="student-hero-widget__value">{data.onboardingPercent}%</p>
          </div>
          <MiniRadialRing
            percent={data.onboardingPercent}
            gradientId={`onboarding-ring${uid}`}
            accentColor="#06b6d4"
          />
        </div>

        <WidgetChecklist
          items={data.onboardingChecklist}
          labelKey="student.profile.widgets.onboardingSections"
          translationPrefix="student.profile.widgets.onboardingChecklist"
          compact
        />

        <p className="student-hero-widget__insight">
          {t('student.profile.widgets.insight.onboarding', { count: data.onboardingMissingCount })}
        </p>
      </WidgetShell>

      <WidgetShell accent="violet" delay={0.15}>
        <div className="student-hero-widget__head">
          <div className="min-w-0">
            <p className="student-hero-widget__label">{t('student.profile.widgets.internshipTrack')}</p>
            <p className="student-hero-widget__value text-base leading-snug">
              {data.internshipTypeLabel || EMPTY}
            </p>
          </div>
          <span className="student-hero-match-pill flex items-center justify-center">
            <Briefcase className="h-4 w-4" strokeWidth={2} aria-hidden />
          </span>
        </div>

        <div className="student-hero-segments" role="list">
          <div className="student-hero-segments__row" role="listitem">
            <span className="student-hero-segments__label">
              {t('student.profile.widgets.internshipDuration')}
            </span>
            <span className="student-hero-segments__pct ms-auto">
              {data.internshipDurationLabel || EMPTY}
            </span>
          </div>
          {data.internshipCategoryLabel ? (
            <div className="student-hero-segments__row" role="listitem">
              <span className="student-hero-segments__label">
                {t('student.profile.onboarding.fields.internshipCategory')}
              </span>
              <span className="student-hero-segments__pct ms-auto">{data.internshipCategoryLabel}</span>
            </div>
          ) : null}
        </div>

        <div className="student-hero-readiness-bar" aria-hidden>
          <motion.span
            className="student-hero-readiness-bar__fill"
            initial={{ width: 0 }}
            animate={{ width: data.internshipConfigured ? '100%' : '35%' }}
            transition={{ duration: 0.85, ease: easePremium }}
          />
        </div>

        <p className="student-hero-widget__insight">
          {data.internshipConfigured
            ? t('student.profile.widgets.insight.internshipAssigned')
            : t('student.profile.widgets.insight.internshipPending')}
        </p>
      </WidgetShell>

      <WidgetShell accent="emerald" delay={0.2}>
        <div className="student-hero-widget__head">
          <div className="min-w-0">
            <p className="student-hero-widget__label">{t('student.profile.widgets.preferences')}</p>
            <p className="student-hero-widget__value">{data.preferencesPercent}%</p>
          </div>
          <MiniRadialRing
            percent={data.preferencesPercent}
            gradientId={`preferences-ring${uid}`}
            accentColor="#059669"
          />
        </div>

        <WidgetChecklist
          items={data.preferencesChecklist}
          labelKey="student.profile.widgets.preferencesSections"
          translationPrefix="student.profile.widgets.preferencesChecklist"
          compact
        />

        <p className="student-hero-widget__insight">
          {t('student.profile.widgets.insight.preferences', { count: data.preferencesMissingCount })}
        </p>
      </WidgetShell>
    </div>
  );
};

export default StudentProfileMainWidgets;
