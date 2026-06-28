import { FunctionComponent } from 'react';

const Shimmer: FunctionComponent<{ className?: string }> = ({ className = '' }) => (
  <div className={`admin-shimmer rounded-xl ${className}`} aria-hidden />
);

const PANEL = 'admin-module-panel rounded-2xl border border-[var(--admin-border)] p-5 shadow-sm';

const PaymentValidationSkeleton: FunctionComponent = () => (
  <div className="space-y-6" aria-busy aria-label="Loading payment validation">
    <Shimmer className="h-9 w-40 rounded-lg" />

    <div className="admin-page-hero relative overflow-hidden">
      <span
        className="admin-page-hero-mesh -start-8 -top-12 h-40 w-40"
        style={{ background: 'var(--admin-mesh-1)' }}
        aria-hidden
      />
      <span
        className="admin-page-hero-mesh end-0 top-0 h-32 w-32"
        style={{ background: 'var(--admin-mesh-3)' }}
        aria-hidden
      />
      <div className="relative z-10 flex flex-wrap items-center gap-4">
        <Shimmer className="h-14 w-14 shrink-0 rounded-2xl" />
        <div className="min-w-0 flex-1 space-y-2.5">
          <Shimmer className="h-3 w-28 rounded-full" />
          <Shimmer className="h-7 w-56 max-w-full rounded-lg" />
          <Shimmer className="h-3.5 w-40 rounded-full" />
        </div>
        <Shimmer className="h-7 w-24 shrink-0 rounded-full" />
      </div>
    </div>

    <div className="grid gap-6 xl:grid-cols-2">
      <div className="space-y-6">
        <section className={PANEL}>
          <Shimmer className="mb-4 h-3.5 w-32 rounded-full" />
          <div className="grid gap-3 sm:grid-cols-2">
            <Shimmer className="h-12 rounded-lg" />
            <Shimmer className="h-12 rounded-lg" />
            <Shimmer className="h-12 rounded-lg" />
            <Shimmer className="h-12 rounded-lg" />
          </div>
        </section>

        <section className={PANEL}>
          <Shimmer className="mb-4 h-3.5 w-28 rounded-full" />
          <Shimmer className="h-8 w-36 rounded-lg" />
          <Shimmer className="mt-3 h-4 w-48 rounded-full" />
          <Shimmer className="mt-2 h-4 w-56 rounded-full" />
        </section>

        <section className={PANEL}>
          <Shimmer className="mb-4 h-3.5 w-36 rounded-full" />
          <Shimmer className="mb-3 h-10 w-full rounded-lg" />
          <Shimmer className="mb-3 h-20 w-full rounded-lg" />
          <Shimmer className="mb-4 h-16 w-full rounded-lg" />
          <div className="flex flex-wrap gap-2">
            <Shimmer className="h-10 w-32 rounded-lg" />
            <Shimmer className="h-10 w-36 rounded-lg" />
            <Shimmer className="h-10 w-24 rounded-lg" />
            <Shimmer className="h-10 w-28 rounded-lg" />
          </div>
        </section>
      </div>

      <Shimmer className="min-h-[420px] rounded-2xl" />
    </div>
  </div>
);

export default PaymentValidationSkeleton;
