import { FunctionComponent } from 'react';

interface ActiveAnnouncementsCardHeaderProps {
  totalFormatted: string;
}

const ActiveAnnouncementsCardHeader: FunctionComponent<ActiveAnnouncementsCardHeaderProps> = ({
  totalFormatted,
}) => {
  return (
    <div className="w-full px-6 pt-6 text-left font-inter">
      <div className="text-base font-semibold leading-4 text-[var(--admin-text)]">
        Active Announcements ({totalFormatted})
      </div>
      <div className="mt-1 text-base leading-6 text-[var(--admin-text-secondary)]">Filtered list of announcements</div>
    </div>
  );
};

export default ActiveAnnouncementsCardHeader;
