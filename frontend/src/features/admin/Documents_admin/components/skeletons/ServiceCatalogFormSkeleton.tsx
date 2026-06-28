import { FunctionComponent } from 'react';
import { motion } from 'framer-motion';
import { STUDIO_STEPS } from '../service-catalog/serviceCatalogStudioSteps';

const Shimmer: FunctionComponent<{ className?: string }> = ({ className = '' }) => (
  <div className={`admin-shimmer rounded-lg ${className}`} aria-hidden />
);

const ServiceCatalogFormSkeleton: FunctionComponent = () => (
  <motion.div
    className="admin-doc-studio-page admin-doc-studio-skeleton"
    role="status"
    aria-busy="true"
    aria-live="polite"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.2 }}
  >
    <Shimmer className="admin-doc-studio-skeleton__back h-9 w-44 rounded-lg" />

    <div className="admin-doc-studio">
      <header className="admin-doc-studio-hero admin-doc-studio-skeleton__hero" aria-hidden>
        <div className="admin-doc-studio-hero__grid">
          <div className="admin-doc-studio-hero__identity">
            <Shimmer className="admin-doc-studio-skeleton__hero-icon shrink-0 rounded-2xl" />
            <div className="admin-doc-studio-hero__identity-copy space-y-2">
              <Shimmer className="h-3 w-24" />
              <Shimmer className="h-6 w-56 max-w-full" />
              <div className="flex flex-wrap gap-2 pt-1">
                <Shimmer className="h-5 w-20 rounded-full" />
                <Shimmer className="h-5 w-16 rounded-full" />
              </div>
              <Shimmer className="h-3.5 w-full max-w-md" />
            </div>
          </div>

          <div className="admin-doc-studio-hero__kpi-grid">
            {Array.from({ length: 4 }).map((_, i) => (
              <Shimmer key={i} className="admin-doc-studio-skeleton__kpi" />
            ))}
          </div>

          <div className="admin-doc-studio-hero__progress space-y-2">
            <div className="flex items-center justify-between gap-3">
              <Shimmer className="h-3 w-28" />
              <Shimmer className="h-4 w-10" />
            </div>
            <Shimmer className="admin-doc-studio-skeleton__progress-track h-2 w-full rounded-full" />
            <Shimmer className="h-3 w-36" />
          </div>
        </div>
      </header>

      <div className="admin-doc-studio-helpers" aria-hidden>
        {Array.from({ length: 3 }).map((_, i) => (
          <Shimmer key={i} className="admin-doc-studio-skeleton__helper" />
        ))}
      </div>

      <div className="admin-doc-studio__layout">
        <div className="admin-doc-studio__nav-col">
          <nav className="admin-doc-studio-steps" aria-hidden>
            <Shimmer className="admin-doc-studio-skeleton__steps-label h-3 w-24" />
            <ul className="admin-doc-studio-steps__list">
              {STUDIO_STEPS.map((step) => (
                <li key={step.key}>
                  <Shimmer className="admin-doc-studio-skeleton__step" />
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="admin-doc-studio__main">
          <section className="admin-doc-studio-panel" aria-hidden>
            <header className="admin-doc-studio-panel__head">
              <Shimmer className="h-5 w-5 shrink-0 rounded-md" />
              <div className="min-w-0 flex-1 space-y-2">
                <Shimmer className="h-4 w-36" />
                <Shimmer className="h-3 w-64 max-w-full" />
              </div>
            </header>
            <div className="admin-doc-studio-panel__body space-y-5">
              <div className="space-y-2">
                <Shimmer className="h-3 w-24" />
                <Shimmer className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Shimmer className="h-3 w-28" />
                <Shimmer className="h-20 w-full" />
              </div>
              <div className="space-y-2">
                <Shimmer className="h-3 w-20" />
                <div className="admin-doc-studio-skeleton__card-grid">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Shimmer key={i} className="admin-doc-studio-skeleton__card" />
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Shimmer className="h-3 w-24" />
                <div className="admin-doc-studio-skeleton__swatch-row">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Shimmer key={i} className="admin-doc-studio-skeleton__swatch rounded-full" />
                  ))}
                </div>
              </div>
            </div>
          </section>

          <footer className="admin-doc-studio-footer" aria-hidden>
            <Shimmer className="h-3 w-48 max-w-full" />
            <div className="admin-doc-studio-footer__actions">
              <Shimmer className="admin-doc-studio-skeleton__footer-btn" />
              <Shimmer className="admin-doc-studio-skeleton__footer-btn admin-doc-studio-skeleton__footer-btn--primary" />
            </div>
          </footer>
        </div>
      </div>
    </div>
  </motion.div>
);

export default ServiceCatalogFormSkeleton;
