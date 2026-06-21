import { FunctionComponent, ElementType } from 'react';
import { Loader2 } from 'lucide-react';
import { OFFER_STUDIO_BTN_PRIMARY, OFFER_STUDIO_BTN_SECONDARY } from './offerStudioClasses';

export type OfferSubmitAction = 'draft' | 'publish' | null;

interface OfferStudioActionButtonProps {
  variant?: 'primary' | 'secondary';
  icon: ElementType;
  loading?: boolean;
  loadingLabel: string;
  disabled?: boolean;
  onClick: () => void;
  children: string;
}

const OfferStudioActionButton: FunctionComponent<OfferStudioActionButtonProps> = ({
  variant = 'secondary',
  icon: Icon,
  loading = false,
  loadingLabel,
  disabled,
  onClick,
  children,
}) => (
  <button
    type="button"
    className={variant === 'primary' ? OFFER_STUDIO_BTN_PRIMARY : OFFER_STUDIO_BTN_SECONDARY}
    disabled={disabled || loading}
    aria-busy={loading}
    onClick={onClick}
  >
    {loading ? (
      <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden />
    ) : (
      <Icon className="h-4 w-4 shrink-0" aria-hidden />
    )}
    {loading ? loadingLabel : children}
  </button>
);

export default OfferStudioActionButton;
