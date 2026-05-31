import {
  FunctionComponent,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from 'react';
import { useTranslation } from 'react-i18next';
import { Banknote, FileUp, Upload } from 'lucide-react';
import AdminModal from '../../../admin/ui/AdminModal';
import AdminSelectField from '../../../admin/ui/AdminSelectField';
import type { SrfFeeRow } from '../types';
import { srfPaymentMethods } from '../data/srfMock';
import { SRF_OUTLINE_BTN, SRF_PRIMARY_BTN } from '../constants/srfStyles';
import { formatMad } from '../utils/formatMad';
import { PLATFORM_FORM_INPUT } from '../../../../design-system/platformTokens';

interface SrfPaymentModalProps {
  fee: SrfFeeRow;
  onClose: () => void;
}

const fieldLabelClass =
  'mb-2 block text-sm font-medium leading-5 text-[var(--admin-text)]';

const fieldInputClass = `${PLATFORM_FORM_INPUT} h-11 w-full min-w-0 text-sm`;

const SrfPaymentModal: FunctionComponent<SrfPaymentModalProps> = ({ fee, onClose }) => {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [amount, setAmount] = useState(String(fee.amountRemaining));
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');
  const [receiptName, setReceiptName] = useState<string | null>(null);

  const methodOptions = useMemo(
    () =>
      srfPaymentMethods
        .filter((method) => method.value)
        .map((method) => ({
          value: method.value,
          label: method.label,
        })),
    [],
  );

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setReceiptName(file ? file.name : null);
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!paymentMethod) return;
    console.log('Soumettre paiement SRF', {
      feeId: fee.id,
      paymentMethod,
      amount,
      reference,
      notes,
      receiptName,
    });
    onClose();
  };

  return (
    <AdminModal
      open
      onClose={onClose}
      title={t('student.srf.modal.title')}
      description={fee.feeType}
      maxWidthClass="student-srf-payment-modal max-w-[min(100%,52rem)] w-full"
      closeAriaLabel={t('student.srf.modal.close')}
      footer={
        <>
          <button type="button" onClick={onClose} className={`${SRF_OUTLINE_BTN} min-w-[7.5rem]`}>
            {t('student.srf.modal.cancel')}
          </button>
          <button type="submit" form="srf-payment-form" className={`${SRF_PRIMARY_BTN} min-w-[10rem]`}>
            {t('student.srf.modal.submitPayment')}
          </button>
        </>
      }
    >
      <form id="srf-payment-form" onSubmit={handleSubmit} className="student-srf-payment-modal__form">
        <div className="student-srf-payment-modal__summary" role="group" aria-label={fee.feeType}>
          <div className="student-srf-payment-modal__summary-item">
            <span className="student-srf-payment-modal__summary-label">
              {t('student.srf.modal.expectedAmount')}
            </span>
            <span className="student-srf-payment-modal__summary-value">{formatMad(fee.amountExpected)}</span>
          </div>
          <div className="student-srf-payment-modal__summary-item student-srf-payment-modal__summary-item--accent">
            <span className="student-srf-payment-modal__summary-label">
              {t('student.srf.modal.remainingAmount')}
            </span>
            <span className="student-srf-payment-modal__summary-value student-srf-payment-modal__summary-value--accent">
              {formatMad(fee.amountRemaining)}
            </span>
          </div>
        </div>

        <div className="student-srf-payment-modal__grid">
          <div className="student-srf-payment-modal__field">
            <label htmlFor="srf-payment-method" className={fieldLabelClass}>
              {t('student.srf.modal.method')}
            </label>
            <AdminSelectField
              id="srf-payment-method"
              value={paymentMethod}
              onChange={setPaymentMethod}
              options={methodOptions}
              placeholder={srfPaymentMethods[0]?.label}
              aria-label={t('student.srf.modal.method')}
            />
          </div>

          <div className="student-srf-payment-modal__field">
            <label htmlFor="srf-payment-amount" className={fieldLabelClass}>
              {t('student.srf.modal.amount')}
            </label>
            <div className="relative">
              <Banknote
                className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-[var(--admin-text-muted)]"
                strokeWidth={1.75}
                aria-hidden
              />
              <input
                id="srf-payment-amount"
                type="number"
                min={0}
                step={1}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className={`${fieldInputClass} ps-10 tabular-nums`}
                required
              />
            </div>
          </div>

          <div className="student-srf-payment-modal__field student-srf-payment-modal__field--full">
            <label htmlFor="srf-payment-reference" className={fieldLabelClass}>
              {t('student.srf.modal.reference')}
            </label>
            <input
              id="srf-payment-reference"
              type="text"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder={t('student.srf.modal.virPlaceholder')}
              className={fieldInputClass}
            />
          </div>

          <div className="student-srf-payment-modal__field student-srf-payment-modal__field--full">
            <label htmlFor="srf-payment-notes" className={fieldLabelClass}>
              {t('student.srf.modal.notes')}{' '}
              <span className="font-normal text-[var(--admin-text-muted)]">
                {t('student.srf.modal.notesOptional')}
              </span>
            </label>
            <textarea
              id="srf-payment-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t('student.srf.modal.notesPlaceholder')}
              rows={3}
              className={`${fieldInputClass} min-h-[6.5rem] resize-y py-2.5`}
            />
          </div>

          <div className="student-srf-payment-modal__field student-srf-payment-modal__field--full">
            <span className={fieldLabelClass}>{t('student.srf.modal.receipt')}</span>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              className="sr-only"
              onChange={handleFileChange}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="student-srf-payment-modal__upload"
            >
              <span className="student-srf-payment-modal__upload-icon" aria-hidden>
                {receiptName ? (
                  <FileUp className="size-6" strokeWidth={1.75} />
                ) : (
                  <Upload className="size-6" strokeWidth={1.75} />
                )}
              </span>
              <span className="student-srf-payment-modal__upload-title">
                {receiptName ?? t('student.srf.modal.uploadReceipt')}
              </span>
              <span className="student-srf-payment-modal__upload-hint">{t('student.srf.modal.fileHint')}</span>
            </button>
          </div>
        </div>
      </form>
    </AdminModal>
  );
};

export default SrfPaymentModal;
