import { FunctionComponent } from 'react';
import type { DocumentsStatItem } from '../types';
import { documentsStatColorMap, documentsStatIconMap } from '../data/documentsMock';

interface DocumentsStatCardProps {
  stat: DocumentsStatItem;
}

/** Même structure visuelle que `AnnouncementsStatCard`. */
const DocumentsStatCard: FunctionComponent<DocumentsStatCardProps> = ({ stat }) => {
  const Icon = documentsStatIconMap[stat.iconKey];
  const bgColor = documentsStatColorMap[stat.iconKey];

  return (
    <div className="group relative box-border flex min-h-[114px] w-full min-w-0 max-w-full flex-col items-stretch overflow-hidden rounded-[14px] border border-[var(--admin-border)] bg-[var(--admin-bg-elevated)] text-left text-sm text-[var(--admin-text-muted)] shadow-[0_1px_2px_rgba(16,24,40,0.04)] sm:h-[114px]">
      <span
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#155dfc]/20 to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100"
        aria-hidden
      />
      <div className="box-border flex min-h-0 w-full min-w-0 flex-1 items-center justify-between gap-2.5 p-3.5 sm:gap-5 sm:p-6">
        <div className="flex min-w-0 flex-1 flex-col items-start gap-0.5 sm:gap-1">
          <span className="line-clamp-2 min-w-0 break-words text-[13px] font-medium leading-5 sm:text-sm">
            {stat.label}
          </span>
          <span className="text-[28px] font-bold tabular-nums leading-8 tracking-tight text-[var(--admin-text)] sm:text-3xl sm:leading-9">
            {stat.value}
          </span>
          <span className="line-clamp-1 min-w-0 break-words text-[11px] font-medium leading-4 text-[var(--admin-text-muted)] sm:text-[12px] sm:leading-5">
            {stat.subtitle}
          </span>
        </div>
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] shadow-[0_4px_12px_rgba(0,0,0,0.12)] ring-1 ring-white/20 sm:h-12 sm:w-12 ${bgColor}`}
        >
          <Icon className="h-5 w-5 text-white sm:h-6 sm:w-6" strokeWidth={1.75} aria-hidden />
        </div>
      </div>
    </div>
  );
};

export default DocumentsStatCard;
