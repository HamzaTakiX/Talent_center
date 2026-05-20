import { FunctionComponent, ReactNode, useEffect, useId, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, Check, Circle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { easePremium } from '../../../../admin/dashboard/ui/animations';
import { studentHeroWidgetData } from '../../data/studentDashboardMock';

const useCountUp = (target: number, duration = 900) => {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - (1 - progress) ** 3;
      setValue(Math.round(target * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, duration]);

  return value;
};

const HeroWidgetShell: FunctionComponent<{
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

const Sparkline: FunctionComponent<{ values: number[]; color?: string; max?: number }> = ({
  values,
  color = 'var(--admin-brand)',
  max: maxOverride,
}) => {
  const max = maxOverride ?? Math.max(...values, 1);
  const w = 100;
  const h = 28;
  const step = w / (values.length - 1 || 1);
  const points = values
    .map((v, i) => `${i * step},${h - (v / max) * (h - 4) - 2}`)
    .join(' ');

  return (
    <svg className="student-hero-sparkline" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" aria-hidden>
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
        opacity={0.35}
      />
      <motion.polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: easePremium }}
      />
    </svg>
  );
};

const TrendBadge: FunctionComponent<{ value: number }> = ({ value }) => (
  <span className="student-hero-trend">
    <ArrowUpRight className="h-3 w-3" strokeWidth={2.5} aria-hidden />
    +{value}%
  </span>
);

const ProfileCompletionWidget: FunctionComponent = () => {
  const { t } = useTranslation();
  const uid = useId();
  const d = studentHeroWidgetData.profile;

  return (
    <HeroWidgetShell accent="brand" delay={0.05}>
      <div className="student-hero-widget__head">
        <div className="min-w-0">
          <p className="student-hero-widget__label">{t('student.dashboard.hero.profileCompletion')}</p>
          <p className="student-hero-widget__value">{d.percent}%</p>
        </div>
        <MiniRadialRing percent={d.percent} gradientId={`profile-ring${uid}`} />
      </div>

      <Sparkline values={d.sparkline} />

      <ul className="student-hero-checklist" aria-label={t('student.dashboard.hero.widgets.profileSections')}>
        {d.checklist.map((item) => (
          <li key={item.key} className={item.done ? 'is-done' : ''}>
            {item.done ? (
              <Check className="h-3 w-3" strokeWidth={2.5} aria-hidden />
            ) : (
              <Circle className="h-3 w-3" strokeWidth={2} aria-hidden />
            )}
            <span>{t(`student.dashboard.hero.widgets.checklist.${item.key}`)}</span>
          </li>
        ))}
      </ul>

      <p className="student-hero-widget__insight">
        <TrendBadge value={d.trendPercent} />
        <span>{t('student.dashboard.hero.widgets.profileInsight', { count: d.totalSections - d.completedSections })}</span>
      </p>
    </HeroWidgetShell>
  );
};

const CvScoreWidget: FunctionComponent = () => {
  const { t } = useTranslation();
  const uid = useId();
  const d = studentHeroWidgetData.cv;

  return (
    <HeroWidgetShell accent="cyan" delay={0.1}>
      <div className="student-hero-widget__head">
        <div className="min-w-0">
          <p className="student-hero-widget__label">{t('student.dashboard.hero.cvScore')}</p>
          <p className="student-hero-widget__value">
            {d.percent}%
            <span className="student-hero-widget__delta">+{d.weeklyDelta}</span>
          </p>
        </div>
        <MiniRadialRing percent={d.percent} gradientId={`cv-ring${uid}`} accentColor="#06b6d4" />
      </div>

      <div className="student-hero-segments" role="list">
        {d.segments.map((seg) => (
          <div key={seg.key} className="student-hero-segments__row" role="listitem">
            <span className="student-hero-segments__label">
              {t(`student.dashboard.hero.widgets.cvSegments.${seg.key}`)}
            </span>
            <span className="student-hero-segments__track" aria-hidden>
              <motion.span
                className="student-hero-segments__fill"
                initial={{ width: 0 }}
                animate={{ width: `${seg.value}%` }}
                transition={{ duration: 0.7, ease: easePremium }}
              />
            </span>
            <span className="student-hero-segments__pct">{seg.value}</span>
          </div>
        ))}
      </div>

      <Sparkline values={d.sparkline} color="#06b6d4" />

      <p className="student-hero-widget__insight">
        {t('student.dashboard.hero.widgets.cvInsight', { percentile: d.percentile })}
      </p>
    </HeroWidgetShell>
  );
};

const InternshipReadyWidget: FunctionComponent = () => {
  const { t } = useTranslation();
  const d = studentHeroWidgetData.readiness;

  return (
    <HeroWidgetShell accent="violet" delay={0.15}>
      <div className="student-hero-widget__head">
        <div className="min-w-0">
          <p className="student-hero-widget__label">{t('student.dashboard.hero.readiness')}</p>
          <p className="student-hero-widget__value">{d.percent}%</p>
        </div>
        <span className="student-hero-match-pill">
          {d.recruiterMatch}%
          <span className="student-hero-match-pill__sub">{t('student.dashboard.hero.widgets.match')}</span>
        </span>
      </div>

      <div className="student-hero-stages" aria-hidden>
        {d.stages.map((stage, i) => (
          <span
            key={stage}
            className={`student-hero-stages__dot ${i <= d.stageIndex ? 'is-active' : ''} ${i === d.stageIndex ? 'is-current' : ''}`}
          />
        ))}
      </div>
      <div className="student-hero-readiness-bar" aria-hidden>
        <motion.span
          className="student-hero-readiness-bar__fill"
          initial={{ width: 0 }}
          animate={{ width: `${d.percent}%` }}
          transition={{ duration: 0.85, ease: easePremium }}
        />
      </div>

      <ul className="student-hero-checklist student-hero-checklist--compact">
        {d.requirements.map((req) => (
          <li key={req.key} className={req.done ? 'is-done' : ''}>
            {req.done ? <Check className="h-3 w-3" strokeWidth={2.5} aria-hidden /> : <Circle className="h-3 w-3" strokeWidth={2} aria-hidden />}
            <span>{t(`student.dashboard.hero.widgets.requirements.${req.key}`)}</span>
          </li>
        ))}
      </ul>

      <p className="student-hero-widget__insight">
        {t('student.dashboard.hero.widgets.readinessInsight', { count: d.missingCount })}
      </p>
    </HeroWidgetShell>
  );
};

const ApplicationsWidget: FunctionComponent = () => {
  const { t } = useTranslation();
  const d = studentHeroWidgetData.applications;
  const animatedTotal = useCountUp(d.weekTotal);
  const ratioSum = d.ratio.accepted + d.ratio.pending + d.ratio.rejected;
  const pct = (n: number) => (ratioSum > 0 ? (n / ratioSum) * 100 : 0);

  return (
    <HeroWidgetShell accent="emerald" delay={0.2}>
      <div className="student-hero-widget__head">
        <div className="min-w-0">
          <p className="student-hero-widget__label">{t('student.dashboard.hero.applicationsWeek')}</p>
          <p className="student-hero-widget__value">{animatedTotal}</p>
        </div>
        <span className="student-hero-rate-pill">
          {d.responseRate}%
          <span className="student-hero-rate-pill__sub">{t('student.dashboard.hero.widgets.responseRate')}</span>
        </span>
      </div>

      <Sparkline values={d.sparkline} color="#059669" max={5} />

      <div
        className="student-hero-stacked-bar"
        role="img"
        aria-label={t('student.dashboard.hero.widgets.ratioAria')}
      >
        <motion.span
          className="student-hero-stacked-bar__accepted"
          initial={{ width: 0 }}
          animate={{ width: `${pct(d.ratio.accepted)}%` }}
          transition={{ duration: 0.6, ease: easePremium }}
        />
        <motion.span
          className="student-hero-stacked-bar__pending"
          initial={{ width: 0 }}
          animate={{ width: `${pct(d.ratio.pending)}%` }}
          transition={{ duration: 0.6, delay: 0.08, ease: easePremium }}
        />
        <motion.span
          className="student-hero-stacked-bar__rejected"
          initial={{ width: 0 }}
          animate={{ width: `${pct(d.ratio.rejected)}%` }}
          transition={{ duration: 0.6, delay: 0.16, ease: easePremium }}
        />
      </div>

      <div className="student-hero-ratio-legend">
        <span><i className="dot dot--accepted" />{d.ratio.accepted}</span>
        <span><i className="dot dot--pending" />{d.ratio.pending}</span>
        <span><i className="dot dot--rejected" />{d.ratio.rejected}</span>
      </div>

      <p className="student-hero-widget__insight">
        <TrendBadge value={d.trendPercent} />
        <span>{t('student.dashboard.hero.widgets.applicationsInsight')}</span>
      </p>
    </HeroWidgetShell>
  );
};

const StudentHeroAnalyticsWidgets: FunctionComponent = () => (
  <div className="student-dashboard-hero-metrics w-full">
    <ProfileCompletionWidget />
    <CvScoreWidget />
    <InternshipReadyWidget />
    <ApplicationsWidget />
  </div>
);

export default StudentHeroAnalyticsWidgets;
