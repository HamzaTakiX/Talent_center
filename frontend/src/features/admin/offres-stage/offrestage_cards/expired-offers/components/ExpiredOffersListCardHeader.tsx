import { FunctionComponent } from 'react';

interface ExpiredOffersListCardHeaderProps {
  totalFormatted: string;
}

const ExpiredOffersListCardHeader: FunctionComponent<ExpiredOffersListCardHeaderProps> = ({
  totalFormatted,
}) => {
  return (
    <div className="w-full px-6 pt-6 font-inter text-left">
      <div className="text-base font-semibold leading-4 text-[var(--admin-text)]">Expired Offers ({totalFormatted})</div>
      <div className="mt-1 text-base leading-6 text-[var(--admin-text-secondary)]">Filtered list of internship offers</div>
    </div>
  );
};

export default ExpiredOffersListCardHeader;
