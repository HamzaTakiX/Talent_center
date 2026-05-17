import { FunctionComponent } from 'react';

interface DraftOffersListCardHeaderProps {
  totalFormatted: string;
}

const DraftOffersListCardHeader: FunctionComponent<DraftOffersListCardHeaderProps> = ({
  totalFormatted,
}) => {
  return (
    <div className="w-full px-6 pt-6 font-inter text-left">
      <div className="text-base font-semibold leading-4 text-[var(--admin-text)]">Draft Offers ({totalFormatted})</div>
      <div className="mt-1 text-base leading-6 text-[var(--admin-text-secondary)]">Filtered list of internship offers</div>
    </div>
  );
};

export default DraftOffersListCardHeader;
