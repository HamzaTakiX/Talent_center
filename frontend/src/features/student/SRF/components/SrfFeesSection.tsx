import { FunctionComponent, useMemo, useState } from 'react';
import type { SrfFeeRow, SrfFeeTabId } from '../types';
import { SRF_SURFACE_CARD } from '../constants/srfLayout';
import { filterFeesByTab } from '../utils/filterFeesByTab';
import SrfFeesTabs from './SrfFeesTabs';
import SrfFeesTable from './SrfFeesTable';
import SrfPaymentModal from './SrfPaymentModal';

interface SrfFeesSectionProps {
  feeRows: SrfFeeRow[];
  feeTabs: { id: SrfFeeTabId; label: string; count: number }[];
  loading: boolean;
  submitting: boolean;
  submitError: string | null;
  onSubmitPayment: (payload: {
    amount: number;
    reference: string;
    installmentId?: number;
    file: File;
  }) => Promise<boolean>;
}

const SrfFeesSection: FunctionComponent<SrfFeesSectionProps> = ({
  feeRows,
  feeTabs,
  loading,
  submitting,
  submitError,
  onSubmitPayment,
}) => {
  const [activeTabId, setActiveTabId] = useState<SrfFeeTabId>('all');
  const [paymentFee, setPaymentFee] = useState<SrfFeeRow | null>(null);

  const filteredRows = useMemo(
    () => filterFeesByTab(feeRows, activeTabId),
    [activeTabId, feeRows],
  );

  return (
    <>
      <section aria-label="Frais et statuts de paiement" className={`${SRF_SURFACE_CARD} min-w-0`}>
        <div className="border-b border-solid border-[var(--admin-border)] px-4 py-4 sm:px-5 sm:py-5">
          <SrfFeesTabs tabs={feeTabs} activeTabId={activeTabId} onTabChange={setActiveTabId} />
        </div>
        <SrfFeesTable rows={filteredRows} loading={loading} onPayClick={setPaymentFee} />
      </section>

      {paymentFee ? (
        <SrfPaymentModal
          fee={paymentFee}
          submitting={submitting}
          submitError={submitError}
          onClose={() => setPaymentFee(null)}
          onSubmit={async (payload) => {
            const ok = await onSubmitPayment({
              amount: payload.amount,
              reference: payload.reference,
              installmentId: paymentFee.installmentId,
              file: payload.file,
            });
            if (ok) setPaymentFee(null);
          }}
        />
      ) : null}
    </>
  );
};

export default SrfFeesSection;
