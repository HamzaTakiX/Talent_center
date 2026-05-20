import {
  FunctionComponent,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
  type MouseEvent,
} from 'react';
import { ChevronDown, Upload, X } from 'lucide-react';
import type { SrfFeeRow } from '../types';
import { srfPaymentMethods } from '../data/srfMock';
import { SRF_OUTLINE_BTN, SRF_PRIMARY_BTN } from '../constants/srfStyles';
import { formatMad } from '../utils/formatMad';

interface SrfPaymentModalProps {
  fee: SrfFeeRow;
  onClose: () => void;
}

const fieldLabelClass = 'mb-1.5 block font-inter text-sm font-medium leading-5 text-[var(--admin-text)]';

const fieldInputClass =
  'box-border h-10 w-full min-w-0 rounded-lg border-0 bg-[var(--admin-surface-inset)] px-3 font-inter text-sm leading-5 text-[var(--admin-text)] outline-none ring-1 ring-inset ring-transparent placeholder:text-[var(--admin-text-muted)] focus:ring-[#d4d4d4]';

const SrfPaymentModal: FunctionComponent<SrfPaymentModalProps> = ({ fee, onClose }) => {
  const titleId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [amount, setAmount] = useState(String(fee.amountRemaining));
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');
  const [receiptName, setReceiptName] = useState<string | null>(null);

  const handleEscape = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    },
    [onClose]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleEscape);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = prevOverflow;
    };
  }, [handleEscape]);

  const handleBackdropClick = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) onClose();
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setReceiptName(file ? file.name : null);
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
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
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center overflow-y-auto bg-[rgba(15,23,42,0.35)] p-0 sm:items-center sm:p-4"
      role="presentation"
      onClick={handleBackdropClick}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="flex max-h-[min(100dvh,100%)] w-full min-w-0 flex-col overflow-hidden rounded-t-[16px] border border-solid border-[var(--admin-border)] bg-[var(--admin-bg-elevated)] shadow-xl sm:max-h-[calc(100dvh-2rem)] sm:max-w-[520px] sm:rounded-[14px]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-solid border-[var(--admin-border)] px-4 py-4 sm:px-5 sm:py-5">
          <div className="min-w-0 pr-2">
            <h2
              id={titleId}
              className="m-0 font-inter text-lg font-bold leading-7 tracking-tight text-[var(--admin-text)] sm:text-xl"
            >
              Effectuer un paiement
            </h2>
            <p className="m-0 mt-0.5 font-inter text-sm leading-5 text-[var(--admin-text-muted)]">{fee.feeType}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-[var(--admin-text-muted)] transition-colors hover:bg-[var(--admin-row-hover)]"
            aria-label="Fermer"
          >
            <X className="h-4 w-4" strokeWidth={1.75} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col overflow-y-auto">
          <div className="space-y-4 px-4 py-4 sm:space-y-5 sm:px-5 sm:py-5">
            <div className="grid grid-cols-1 gap-3 rounded-[12px] bg-[var(--admin-surface-inset)] p-3.5 sm:grid-cols-2 sm:gap-4 sm:p-4">
              <div className="min-w-0">
                <p className="m-0 font-inter text-[13px] leading-5 text-[var(--admin-text-muted)]">Montant attendu</p>
                <p className="m-0 mt-0.5 font-inter text-base font-bold tabular-nums leading-6 text-[var(--admin-text)]">
                  {formatMad(fee.amountExpected)}
                </p>
              </div>
              <div className="min-w-0">
                <p className="m-0 font-inter text-[13px] leading-5 text-[var(--admin-text-muted)]">Montant restant</p>
                <p className="m-0 mt-0.5 font-inter text-base font-bold tabular-nums leading-6 text-orange-600">
                  {formatMad(fee.amountRemaining)}
                </p>
              </div>
            </div>

            <div>
              <label htmlFor="srf-payment-method" className={fieldLabelClass}>
                Méthode de paiement
              </label>
              <div className="relative">
                <select
                  id="srf-payment-method"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className={`${fieldInputClass} appearance-none pr-9`}
                  required
                >
                  {srfPaymentMethods.map((method) => (
                    <option key={method.value || 'placeholder'} value={method.value} disabled={!method.value}>
                      {method.label}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--admin-text-muted)]"
                  strokeWidth={1.75}
                  aria-hidden
                />
              </div>
            </div>

            <div>
              <label htmlFor="srf-payment-amount" className={fieldLabelClass}>
                Montant à payer
              </label>
              <input
                id="srf-payment-amount"
                type="number"
                min={0}
                step={1}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className={fieldInputClass}
                required
              />
            </div>

            <div>
              <label htmlFor="srf-payment-reference" className={fieldLabelClass}>
                Référence de paiement
              </label>
              <input
                id="srf-payment-reference"
                type="text"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="Ex: VIR-2026-005"
                className={fieldInputClass}
              />
            </div>

            <div>
              <label htmlFor="srf-payment-notes" className={fieldLabelClass}>
                Notes complémentaires <span className="font-normal text-[var(--admin-text-muted)]">(optionnel)</span>
              </label>
              <textarea
                id="srf-payment-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ajoutez des informations supplémentaires..."
                rows={3}
                className="box-border min-h-[88px] w-full min-w-0 resize-y rounded-lg border-0 bg-[var(--admin-surface-inset)] px-3 py-2.5 font-inter text-sm leading-5 text-[var(--admin-text)] outline-none ring-1 ring-inset ring-transparent placeholder:text-[var(--admin-text-muted)] focus:ring-[#d4d4d4]"
              />
            </div>

            <div>
              <span className={fieldLabelClass}>Reçu de paiement</span>
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
                className="flex w-full min-w-0 flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-[#e5e7eb] bg-[var(--admin-surface-muted)] px-4 py-8 text-center transition-colors hover:border-[#d0d5dd] hover:bg-[var(--admin-surface-inset)] max-[429px]:py-6"
              >
                <Upload className="h-8 w-8 text-[var(--admin-text-muted)]" strokeWidth={1.5} aria-hidden />
                <span className="font-inter text-sm font-medium leading-5 text-[var(--admin-text)]">
                  {receiptName ?? 'Téléchargez votre reçu de paiement'}
                </span>
                <span className="font-inter text-xs leading-4 text-[var(--admin-text-muted)]">PDF, JPG, PNG — Max 5MB</span>
              </button>
            </div>
          </div>

          <div className="flex shrink-0 flex-col-reverse gap-2 border-t border-solid border-[var(--admin-border)] px-4 py-3 sm:flex-row sm:justify-end sm:gap-2.5 sm:px-5 sm:py-4">
            <button type="button" onClick={onClose} className={`${SRF_OUTLINE_BTN} w-full sm:w-auto`}>
              Annuler
            </button>
            <button type="submit" className={`${SRF_PRIMARY_BTN} w-full sm:w-auto`}>
              Soumettre le paiement
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SrfPaymentModal;
