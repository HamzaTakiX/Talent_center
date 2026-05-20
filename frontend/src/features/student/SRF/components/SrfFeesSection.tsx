import { FunctionComponent, useMemo, useState } from 'react';
import { srfFeeRows, srfFeeTabs } from '../data/srfMock';
import type { SrfFeeRow, SrfFeeTabId } from '../types';
import { SRF_SURFACE_CARD } from '../constants/srfLayout';
import { filterFeesByTab } from '../utils/filterFeesByTab';
import SrfFeesTabs from './SrfFeesTabs';
import SrfFeesTable from './SrfFeesTable';
import SrfPaymentModal from './SrfPaymentModal';

const SrfFeesSection: FunctionComponent = () => {
  const [activeTabId, setActiveTabId] = useState<SrfFeeTabId>('all');
  const [paymentFee, setPaymentFee] = useState<SrfFeeRow | null>(null);

  const filteredRows = useMemo(
    () => filterFeesByTab(srfFeeRows, activeTabId),
    [activeTabId]
  );

  return (
    <>
      <section aria-label="Frais et statuts de paiement" className={`${SRF_SURFACE_CARD} min-w-0`}>
        <div className="border-b border-solid border-[var(--admin-border)] px-4 py-4 sm:px-5 sm:py-5">
          <SrfFeesTabs tabs={srfFeeTabs} activeTabId={activeTabId} onTabChange={setActiveTabId} />
        </div>
        <SrfFeesTable rows={filteredRows} onPayClick={setPaymentFee} />
      </section>

      {paymentFee ? <SrfPaymentModal fee={paymentFee} onClose={() => setPaymentFee(null)} /> : null}
    </>
  );
};

export default SrfFeesSection;
