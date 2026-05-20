import type { ReportSectionItem } from '../types';
import {
  reportSectionStatusBadgeClass,
  reportSectionStatusLabels,
} from '../data/reportBadgeMaps';
import { REPORT_SURFACE_CARD } from '../constants/reportLayout';

interface ReportSectionsCardProps {
  sections: ReportSectionItem[];
  activeSectionId: string;
  onSelectSection: (id: string) => void;
}

export default function ReportSectionsCard({
  sections,
  activeSectionId,
  onSelectSection,
}: ReportSectionsCardProps) {
  return (
    <section className={`${REPORT_SURFACE_CARD} p-4`}>
      <h2 className="m-0 font-inter text-[15px] font-semibold leading-5 text-[var(--admin-text)]">
        Sections
      </h2>
      <ul className="m-0 mt-3 flex list-none flex-col gap-1 p-0">
        {sections.map((section) => {
          const isActive = section.id === activeSectionId;
          return (
            <li key={section.id}>
              <button
                type="button"
                onClick={() => onSelectSection(section.id)}
                className={`relative flex w-full min-w-0 cursor-pointer items-center justify-between gap-2 rounded-lg border-0 px-3 py-2.5 text-left transition-colors ${
                  isActive
                    ? 'bg-[#eff6ff] pl-[14px] before:absolute before:left-0 before:top-1 before:bottom-1 before:w-[3px] before:rounded-full before:bg-[#2563eb] before:content-[""]'
                    : 'bg-transparent hover:bg-[var(--admin-surface-muted)]'
                }`}
              >
                <div className="min-w-0 flex-1">
                  <p className="m-0 truncate font-inter text-[13px] font-medium leading-5 text-[var(--admin-text)]">
                    {section.title}
                  </p>
                  <p className="m-0 mt-0.5 font-inter text-[12px] leading-4 text-[var(--admin-text-muted)]">
                    {section.wordCount} mots
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-md px-2 py-0.5 font-inter text-[11px] font-medium leading-4 ${reportSectionStatusBadgeClass[section.status]}`}
                >
                  {reportSectionStatusLabels[section.status]}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
