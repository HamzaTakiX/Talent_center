import { FunctionComponent } from 'react';
import { Menu } from 'lucide-react';
import NotificationBell from '../../shared/notifications/components/NotificationBell';

interface EncadrantHeaderProps {
  onMenuClick?: () => void;
  title?: string;
  subtitle?: string;
  userName?: string;
  userRole?: string;
  userInitials?: string;
}

const EncadrantHeader: FunctionComponent<EncadrantHeaderProps> = ({
  onMenuClick,
  title = 'Dashboard',
  subtitle = 'Encadrant Portal',
  userName = 'Encadrant',
  userRole = 'Encadrant',
  userInitials = 'EN',
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
      <NotificationBell variant="encadrant" centerPath="/notifications" />

      <div className="hidden min-w-0 flex-col items-end gap-0.5 text-right text-sm text-[#101828] min-[480px]:flex">
        <span className="max-w-[120px] truncate font-medium leading-5 min-[640px]:max-w-[200px]">
          {userName}
        </span>
        <span className="max-w-[120px] truncate text-xs font-normal leading-5 text-[#6a7282] min-[640px]:max-w-[200px]">
          {userRole}
        </span>
      </div>

      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#7c3aed] text-white"
        aria-label={`${userName}, ${userRole}`}
      >
        <span className="text-sm font-medium leading-5">{userInitials}</span>
      </div>
    </div>
  </header>
);

export default EncadrantHeader;
