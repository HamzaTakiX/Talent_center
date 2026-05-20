import { FunctionComponent } from 'react';
import { Filter, Search } from 'lucide-react';
import type { InternshipOfferCategoryFilter } from '../constants/internshipOfferCategories';
import { internshipOfferCategoryOptions } from '../constants/internshipOfferCategories';

const chevronSvg = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23717182' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`;

interface InternshipOffersSearchToolbarProps {
  query: string;
  onQueryChange: (value: string) => void;
  category: InternshipOfferCategoryFilter;
  onCategoryChange: (value: InternshipOfferCategoryFilter) => void;
}

const InternshipOffersSearchToolbar: FunctionComponent<InternshipOffersSearchToolbarProps> = ({
  query,
  onQueryChange,
  category,
  onCategoryChange,
}) => {
  return (
    <div
      className="flex w-full min-w-0 max-w-full flex-col gap-3 max-[429px]:gap-2.5 sm:flex-row sm:items-stretch sm:gap-4"
      role="search"
    >
      <div className="relative min-h-10 w-full min-w-0 max-w-full flex-1 sm:min-w-[12rem]">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6a7282]"
          strokeWidth={1.75}
          aria-hidden
        />
        <input
          type="search"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Search internships (marketing, finance, business...)"
          className="box-border h-10 w-full max-w-full min-w-0 rounded-lg border border-solid border-[#e5e7eb] bg-[var(--admin-bg-elevated)] py-2 pl-10 pr-3 font-inter text-base leading-5 text-[var(--admin-text)] placeholder:text-[#6a7282] focus:outline-none focus:ring-2 focus:ring-[#155dfc]/20 sm:pr-4 sm:text-sm"
        />
      </div>

      <div className="relative w-full max-w-full min-w-0 shrink-0 sm:w-auto sm:min-w-[11.5rem]">
        <Filter
          className="pointer-events-none absolute right-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-[#6a7282]"
          strokeWidth={1.75}
          aria-hidden
        />
        <select
          aria-label="Filter by category"
          value={category}
          onChange={(e) => onCategoryChange(e.target.value as InternshipOfferCategoryFilter)}
          className="box-border h-10 w-full min-w-0 cursor-pointer appearance-none rounded-lg border border-solid border-[#e5e7eb] bg-[var(--admin-bg-elevated)] py-2 pl-3 pr-10 font-inter text-sm font-medium leading-5 text-[var(--admin-text)] bg-[length:1rem] bg-[right_0.75rem_center] bg-no-repeat focus:outline-none focus:ring-2 focus:ring-[#155dfc]/20"
          style={{ backgroundImage: chevronSvg }}
        >
          {internshipOfferCategoryOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default InternshipOffersSearchToolbar;
