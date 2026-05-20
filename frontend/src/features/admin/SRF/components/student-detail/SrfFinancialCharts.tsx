import { FunctionComponent } from 'react';

const BRAND = 'var(--admin-brand)';
const BRAND_MUTED = 'var(--admin-brand-muted)';
const TRACK = 'var(--admin-border)';

interface DonutProps {
  paid: number;
  remaining: number;
  size?: number;
  paidLabel: string;
  remainingLabel: string;
}

export const SrfPaymentDonut: FunctionComponent<DonutProps> = ({
  paid,
  remaining,
  size = 160,
  paidLabel,
  remainingLabel,
}) => {
  const total = Math.max(paid + remaining, 1);
  const paidPct = paid / total;
  const r = (size - 16) / 2;
  const c = 2 * Math.PI * r;
  const paidOffset = c * (1 - paidPct);

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:gap-8">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={TRACK} strokeWidth={12} />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={BRAND}
            strokeWidth={12}
            strokeDasharray={c}
            strokeDashoffset={paidOffset}
            strokeLinecap="round"
            className="transition-[stroke-dashoffset] duration-700 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-2xl font-bold tabular-nums text-[var(--admin-text)]">
            {Math.round(paidPct * 100)}%
          </span>
          <span className="text-[10px] uppercase tracking-wide text-[var(--admin-text-secondary)]">
            {paidLabel}
          </span>
        </div>
      </div>
      <ul className="space-y-2 text-sm">
        <li className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-[var(--admin-brand)]" />
          <span className="text-[var(--admin-text-secondary)]">{paidLabel}</span>
          <span className="ms-auto font-semibold tabular-nums">{paid.toLocaleString()} MAD</span>
        </li>
        <li className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-[var(--admin-border)]" />
          <span className="text-[var(--admin-text-secondary)]">{remainingLabel}</span>
          <span className="ms-auto font-semibold tabular-nums">{remaining.toLocaleString()} MAD</span>
        </li>
      </ul>
    </div>
  );
};

interface RadialProps {
  value: number;
  label: string;
  sublabel?: string;
  size?: number;
}

export const SrfRadialGauge: FunctionComponent<RadialProps> = ({
  value,
  label,
  sublabel,
  size = 120,
}) => {
  const r = (size - 12) / 2;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - Math.min(100, Math.max(0, value)) / 100);

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={TRACK} strokeWidth={8} />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={BRAND}
            strokeWidth={8}
            strokeDasharray={c}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-[stroke-dashoffset] duration-700"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-bold tabular-nums">{Math.round(value)}%</span>
        </div>
      </div>
      <p className="mt-2 text-center text-xs font-semibold text-[var(--admin-text)]">{label}</p>
      {sublabel ? (
        <p className="text-center text-[10px] text-[var(--admin-text-secondary)]">{sublabel}</p>
      ) : null}
    </div>
  );
};

interface RiskMeterProps {
  score: number;
  lowLabel: string;
  highLabel: string;
}

export const SrfRiskMeter: FunctionComponent<RiskMeterProps> = ({ score, lowLabel, highLabel }) => {
  const tone =
    score >= 70 ? 'from-red-500/80 to-red-600/40' : score >= 40 ? 'from-amber-500/70 to-amber-600/30' : 'from-emerald-500/60 to-[var(--admin-brand)]/40';

  return (
    <div>
      <div className="mb-2 flex justify-between text-[10px] uppercase tracking-wide text-[var(--admin-text-secondary)]">
        <span>{lowLabel}</span>
        <span>{highLabel}</span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-[var(--admin-bg-subtle)] ring-1 ring-[var(--admin-border)]">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${tone} transition-all duration-700`}
          style={{ width: `${score}%` }}
        />
      </div>
      <p className="mt-2 text-end text-2xl font-bold tabular-nums text-[var(--admin-text)]">{score}</p>
    </div>
  );
};

interface InstallmentBar {
  label: string;
  amount: number;
  status: string;
  pct: number;
}

export const SrfInstallmentBars: FunctionComponent<{ items: InstallmentBar[] }> = ({ items }) => {
  if (items.length === 0) return null;

  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item.label}>
          <div className="mb-1 flex justify-between text-xs">
            <span className="font-medium text-[var(--admin-text)]">{item.label}</span>
            <span className="tabular-nums text-[var(--admin-text-secondary)]">
              {item.amount.toLocaleString()} MAD · {item.status}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-[var(--admin-bg-subtle)]">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                item.pct >= 100
                  ? 'bg-emerald-500'
                  : item.status === 'OVERDUE'
                    ? 'bg-red-500'
                    : 'bg-[var(--admin-brand)]'
              }`}
              style={{ width: `${item.pct}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
};
