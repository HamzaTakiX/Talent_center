import { FunctionComponent } from 'react';
import { useAdminCopy } from '../../../../i18n/useAdminCopy';

interface AllOffersCardHeaderProps {
  totalFormatted: string;
}

const AllOffersCardHeader: FunctionComponent<AllOffersCardHeaderProps> = ({ totalFormatted }) => {
  const { pageTitle, filterSubtitle } = useAdminCopy();

  return (
    <div className="w-full px-6 pt-6 font-inter text-left">
      <div className="text-base font-semibold leading-4 text-[var(--admin-text)]">
        {pageTitle('offers.all.title', { count: totalFormatted })}
      </div>
      <div className="mt-1 text-base leading-6 text-[var(--admin-text-secondary)]">{filterSubtitle('offers')}</div>
    </div>
  );
};

export default AllOffersCardHeader;
