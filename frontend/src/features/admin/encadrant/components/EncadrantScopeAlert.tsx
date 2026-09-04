import { FunctionComponent, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, RefreshCw, X } from 'lucide-react';

interface EncadrantScopeAlertProps {
  count: number;
  repairing: boolean;
  onRepair: () => void;
}

const EncadrantScopeAlert: FunctionComponent<EncadrantScopeAlertProps> = ({
  count,
  repairing,
  onRepair,
}) => {
  const { t } = useTranslation();
  const [dismissed, setDismissed] = useState(false);
  const PREFIX = 'admin.modules.encadrants.scopeAlert';

  return (
    <AnimatePresence initial={false}>
      {count > 0 && !dismissed ? (
        <motion.div
          initial={{ opacity: 0, y: -6, height: 0 }}
          animate={{ opacity: 1, y: 0, height: 'auto' }}
          exit={{ opacity: 0, y: -6, height: 0 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          className="overflow-hidden px-4 pt-4 sm:px-6"
        >
          <div
            role="status"
            aria-live="polite"
            className="relative flex flex-col gap-4 overflow-hidden rounded-[var(--admin-radius-lg)] border border-amber-500/25 bg-gradient-to-r from-amber-500/[0.12] via-amber-500/[0.06] to-transparent p-4 shadow-[var(--admin-shadow-sm)] backdrop-blur-[2px] sm:flex-row sm:items-center sm:gap-5 sm:p-5"
          >
            <span
              className="absolute inset-y-3 start-0 w-[3px] rounded-e-full bg-amber-500"
              aria-hidden
            />

            <span
              className="grid h-11 w-11 shrink-0 place-items-center rounded-[var(--admin-radius-sm)] bg-amber-500/15 text-amber-600 ring-1 ring-inset ring-amber-500/20 dark:text-amber-400"
              aria-hidden
            >
              <AlertTriangle className="h-5 w-5" strokeWidth={2} />
            </span>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                <h3 className="text-sm font-semibold leading-5 text-[var(--admin-text)]">
                  {t(`${PREFIX}.title`)}
                </h3>
                <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide tabular-nums text-amber-700 dark:text-amber-300">
                  {t(`${PREFIX}.badge`, { count })}
                </span>
              </div>
              <p className="mt-1 text-[13px] leading-relaxed text-[var(--admin-text-secondary)]">
                {t(`${PREFIX}.description`, { count })}
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                disabled={repairing}
                onClick={onRepair}
                aria-busy={repairing}
                className="inline-flex items-center justify-center gap-2 rounded-[var(--admin-radius-sm)] bg-amber-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:bg-amber-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--admin-surface)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RefreshCw
                  className={`h-3.5 w-3.5 shrink-0 ${repairing ? 'animate-spin' : ''}`}
                  strokeWidth={2}
                  aria-hidden
                />
                <span>{t('admin.modules.encadrants.repairScopes')}</span>
              </button>

              <button
                type="button"
                onClick={() => setDismissed(true)}
                aria-label={t(`${PREFIX}.dismiss`)}
                className="grid h-8 w-8 shrink-0 place-items-center rounded-[var(--admin-radius-sm)] text-[var(--admin-text-muted)] transition-colors hover:bg-amber-500/10 hover:text-[var(--admin-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/40"
              >
                <X className="h-4 w-4" strokeWidth={2} aria-hidden />
              </button>
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};

export default EncadrantScopeAlert;
