import { FunctionComponent, useMemo, type CSSProperties } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Check, Circle, Clock, GitBranch, GraduationCap, Sparkles, Truck } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { DocumentServiceWritePayload } from '../../types/documentServiceCatalog';
import { resolveServiceIcon } from './serviceCatalogIcons';
import { buildServiceCatalogHeroViewModel } from './serviceCatalogHeroViewModel';
import type { ServiceColorTheme } from './serviceCatalogStudioSteps';

interface Props {
  value: DocumentServiceWritePayload;
  isEdit: boolean;
}

const chipTransition = { duration: 0.22, ease: 'easeOut' as const };

const HERO_KPI_META: Record<
  string,
  { icon: LucideIcon; accent: string; accentBg: string; pulseWhenOnline?: boolean }
> = {
  workflow: {
    icon: GitBranch,
    accent: 'var(--admin-brand)',
    accentBg: 'color-mix(in srgb, var(--admin-brand) 14%, transparent)',
  },
  sla: {
    icon: Clock,
    accent: '#0891b2',
    accentBg: 'color-mix(in srgb, #0891b2 14%, transparent)',
  },
  delivery: {
    icon: Truck,
    accent: '#7c3aed',
    accentBg: 'color-mix(in srgb, #7c3aed 14%, transparent)',
    pulseWhenOnline: true,
  },
  eligibility: {
    icon: GraduationCap,
    accent: '#059669',
    accentBg: 'color-mix(in srgb, #059669 14%, transparent)',
  },
};

const ServiceCatalogStudioHero: FunctionComponent<Props> = ({ value, isEdit }) => {
  const { t } = useTranslation();
  const cfg = value.config;
  const theme = (value.colorTheme ?? 'brand') as ServiceColorTheme;
  const Icon = resolveServiceIcon(value.iconKey ?? 'file-text');

  const vm = useMemo(() => buildServiceCatalogHeroViewModel(value, t), [value, t]);

  const title =
    value.name.trim() ||
    (isEdit
      ? t('admin.documentsModule.catalog.form.editTitle')
      : t('admin.documentsModule.catalog.form.createTitle'));

  const description =
    value.description?.trim() || t('admin.documentsModule.catalog.form.studio.heroHelper');

  return (
    <motion.header
      className="admin-doc-studio-hero"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
    >
      <motion.div
        className="admin-doc-studio-hero__glow"
        aria-hidden
        animate={{ opacity: [0.4, 0.65, 0.4] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="admin-doc-studio-hero__grid">
        <motion.div
          className="admin-doc-studio-hero__identity"
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.04, duration: 0.4 }}
        >
          <span className={`admin-doc-studio-hero__icon admin-doc-studio-hero__icon--${theme}`}>
            <Icon className="h-8 w-8" strokeWidth={1.5} aria-hidden />
          </span>

          <div className="admin-doc-studio-hero__identity-copy">
            <span className="admin-doc-studio-hero__eyebrow">
              <Sparkles className="h-3 w-3" aria-hidden />
              {t('admin.documentsModule.catalog.form.studio.badge')}
            </span>

            <h1 className="admin-doc-studio-hero__title">{title}</h1>

            <div className="admin-doc-studio-hero__badges">
              <motion.span className="admin-doc-studio-hero__badge admin-doc-studio-hero__badge--category" layout>
                {t(`admin.documentsModule.catalog.categories.${value.category}`)}
              </motion.span>
              {cfg.availability.isActive ? (
                <motion.span
                  className="admin-doc-studio-hero__badge admin-doc-studio-hero__badge--active"
                  layout
                  initial={{ scale: 0.95 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 420, damping: 24 }}
                >
                  <span className="admin-doc-studio-hero__status-dot" aria-hidden />
                  {t('admin.documentsModule.catalog.form.studio.statusActive')}
                </motion.span>
              ) : (
                <motion.span className="admin-doc-studio-hero__badge admin-doc-studio-hero__badge--draft" layout>
                  {t('admin.documentsModule.catalog.form.studio.statusDraft')}
                </motion.span>
              )}
            </div>

            <p className="admin-doc-studio-hero__subtitle">{description}</p>
          </div>
        </motion.div>

        <motion.section
          className="admin-doc-studio-hero__summary"
          aria-labelledby="studio-hero-summary-title"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.4 }}
        >
          <h2 id="studio-hero-summary-title" className="admin-doc-studio-hero__section-label">
            {t('admin.documentsModule.catalog.form.studio.configSummary')}
          </h2>

          {vm.summaryChips.length > 0 ? (
            <motion.div className="admin-doc-studio-hero__summary-chips" layout>
              <AnimatePresence mode="popLayout">
                {vm.summaryChips.map((chip) => (
                  <motion.span
                    key={chip.id}
                    className="admin-doc-studio-hero__summary-chip"
                    layout
                    initial={{ opacity: 0, scale: 0.92, y: 4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.92, y: -4 }}
                    transition={chipTransition}
                  >
                    <Check className="h-3 w-3 shrink-0" strokeWidth={2.5} aria-hidden />
                    {chip.label}
                  </motion.span>
                ))}
              </AnimatePresence>
            </motion.div>
          ) : (
            <p className="admin-doc-studio-hero__summary-empty">
              {t('admin.documentsModule.catalog.form.studio.configSummaryEmpty')}
            </p>
          )}
        </motion.section>

        <motion.aside
          className="admin-doc-studio-hero__progress"
          aria-labelledby="studio-hero-progress-title"
          initial={{ opacity: 0, x: 8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.12, duration: 0.4 }}
        >
          <div className="admin-doc-studio-hero__progress-head">
            <h2 id="studio-hero-progress-title" className="admin-doc-studio-hero__section-label">
              {t('admin.documentsModule.catalog.form.studio.progressLabel')}
            </h2>
            <span className="admin-doc-studio-hero__progress-pct">{vm.progressPercent}%</span>
          </div>

          <div
            className="admin-doc-studio-hero__progress-track"
            role="progressbar"
            aria-valuenow={vm.progressPercent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={t('admin.documentsModule.catalog.form.studio.estimatedCompletion')}
          >
            <motion.div
              className="admin-doc-studio-hero__progress-fill"
              initial={{ width: 0 }}
              animate={{ width: `${vm.progressPercent}%` }}
              transition={{ type: 'spring', stiffness: 120, damping: 20, mass: 0.8 }}
            />
          </div>

          <div className="admin-doc-studio-hero__progress-meta">
            <span className="admin-doc-studio-hero__progress-count">
              {t('admin.documentsModule.catalog.form.studio.completedSections', {
                done: vm.completedSteps,
                total: vm.totalSteps,
              })}
            </span>
            <span className="admin-doc-studio-hero__progress-estimate">
              {t('admin.documentsModule.catalog.form.studio.estimatedCompletion')}: {vm.progressPercent}%
            </span>
          </div>

          <ul className="admin-doc-studio-hero__step-list" aria-label={t('admin.documentsModule.catalog.form.studio.completedSectionsLabel')}>
            {vm.stepProgress.map((step) => (
              <motion.li
                key={step.key}
                className={`admin-doc-studio-hero__step-item ${step.complete ? 'admin-doc-studio-hero__step-item--done' : ''}`}
                layout
                initial={false}
                animate={{ opacity: 1 }}
              >
                {step.complete ? (
                  <Check className="h-3.5 w-3.5 shrink-0" strokeWidth={2.5} aria-hidden />
                ) : (
                  <Circle className="h-3.5 w-3.5 shrink-0" strokeWidth={2} aria-hidden />
                )}
                <span>{step.label}</span>
              </motion.li>
            ))}
          </ul>

          <div className="admin-doc-studio-hero__kpi-grid">
            {vm.kpis.map((kpi, index) => {
              const meta = HERO_KPI_META[kpi.id];
              const Icon = meta?.icon;
              const showPulse = meta?.pulseWhenOnline && kpi.highlight;

              return (
                <motion.div
                  key={kpi.id}
                  className="admin-doc-studio-hero__kpi"
                  style={
                    meta
                      ? ({
                          '--kpi-accent': meta.accent,
                          '--kpi-accent-bg': meta.accentBg,
                        } as CSSProperties)
                      : undefined
                  }
                  layout
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.14 + index * 0.04, duration: 0.3 }}
                  whileHover={{ y: -1 }}
                >
                  {meta ? <span className="admin-doc-studio-hero__kpi-accent" aria-hidden /> : null}
                  {Icon ? (
                    <span className="admin-doc-studio-hero__kpi-icon">
                      <Icon className="h-4 w-4" strokeWidth={2} aria-hidden />
                    </span>
                  ) : null}
                  <div className="admin-doc-studio-hero__kpi-body">
                    <span className="admin-doc-studio-hero__kpi-label">{kpi.label}</span>
                    <strong className="admin-doc-studio-hero__kpi-value">
                      {showPulse ? (
                        <span className="admin-doc-studio-hero__kpi-pulse" aria-hidden />
                      ) : null}
                      <span>{kpi.value}</span>
                    </strong>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.aside>
      </div>
    </motion.header>
  );
};

export default ServiceCatalogStudioHero;
