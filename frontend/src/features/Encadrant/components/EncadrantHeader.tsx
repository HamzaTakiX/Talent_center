import { FunctionComponent } from 'react';
import { Bell, Menu } from 'lucide-react';

interface EncadrantHeaderProps {
  onMenuClick?: () => void;
  title?: string;
  subtitle?: string;
}

const ENCADRANT_NOTIFICATION_COUNT = 3;
const ENCADRANT_USER_NAME = 'Dr. Ahmed Bennani';
const ENCADRANT_USER_ROLE = 'Encadrant';
const ENCADRANT_USER_INITIALS = 'AB';

const EncadrantHeader: FunctionComponent<EncadrantHeaderProps> = ({
  onMenuClick,
  title = 'Dashboard',
  subtitle = 'Encadrant Portal',
}) => (
  <header className="relative z-10 box-border flex min-h-[76px] w-full shrink-0 flex-none items-center justify-between gap-3 border-b border-solid border-neutral-200 bg-white px-4 py-2 font-inter text-left sm:h-[76px] sm:gap-5 sm:px-8 sm:py-0">
    <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
      <button
        type="button"
        onClick={onMenuClick}
        className="-ml-1 inline-flex shrink-0 items-center justify-center rounded-lg p-2 text-[#101828] hover:bg-neutral-100 lg:hidden"
        aria-label="Open navigation menu"
      >
        <Menu className="h-6 w-6" strokeWidth={2} />
      </button>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col items-start gap-1 text-[#101828]">
        <h1 className="m-0 min-h-0 w-full whitespace-normal break-words text-lg font-semibold leading-7 text-[#101828] sm:text-xl">
          {title}
        </h1>
        <p className="m-0 hidden min-h-0 w-full truncate text-xs font-normal leading-5 text-[#6a7282] sm:block">
          {subtitle}
        </p>
      </div>
    </div>

    <div className="relative flex h-10 shrink-0 items-center justify-end gap-2 sm:gap-3">
      <button
        type="button"
        aria-label={`Notifications (${ENCADRANT_NOTIFICATION_COUNT} unread)`}
        className="relative flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-[10px] text-[#101828] transition-colors hover:bg-neutral-100"
      >
        <Bell className="h-5 w-5" strokeWidth={2} />
        <span className="absolute left-4 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#fb2c36] text-center text-xs font-medium leading-4 text-white">
          {ENCADRANT_NOTIFICATION_COUNT}
        </span>
      </button>

      <div className="hidden min-w-0 flex-col items-end gap-0.5 text-right text-sm text-[#101828] min-[480px]:flex">
        <span className="max-w-[120px] truncate font-medium leading-5 min-[640px]:max-w-[200px]">
          {ENCADRANT_USER_NAME}
        </span>
        <span className="max-w-[120px] truncate text-xs font-normal leading-5 text-[#6a7282] min-[640px]:max-w-[200px]">
          {ENCADRANT_USER_ROLE}
        </span>
      </div>

      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#7c3aed] text-white"
        aria-label={`${ENCADRANT_USER_NAME}, ${ENCADRANT_USER_ROLE}`}
      >
        <span className="text-sm font-medium leading-5">{ENCADRANT_USER_INITIALS}</span>
      </div>
    </div>
  </header>
);

export default EncadrantHeader;
