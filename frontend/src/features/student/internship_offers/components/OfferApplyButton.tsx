import { FunctionComponent, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { getInternshipOfferApplyPath } from '../constants/routes';
import {
  getOfferExternalApplicationUrl,
} from '../helpers/offerApplyAction';
import { useExternalApplyConfirmation } from '../context/ExternalApplyConfirmationContext';

interface OfferApplyButtonProps {
  offerId: string;
  externalUrl?: string | null;
  applicationMethod?: string | null;
  offerTitle?: string;
  className: string;
  children: ReactNode;
}

const OfferApplyButton: FunctionComponent<OfferApplyButtonProps> = ({
  offerId,
  externalUrl,
  applicationMethod,
  offerTitle,
  className,
  children,
}) => {
  const navigate = useNavigate();
  const { startExternalApply, isOpen } = useExternalApplyConfirmation();
  const externalApplicationUrl = getOfferExternalApplicationUrl({ externalUrl, applicationMethod });

  if (externalApplicationUrl) {
    return (
      <button
        type="button"
        className={className}
        disabled={isOpen}
        onClick={() =>
          startExternalApply({
            offerId,
            externalUrl: externalApplicationUrl,
            offerTitle,
          })
        }
      >
        {children}
      </button>
    );
  }

  return (
    <button
      type="button"
      className={className}
      onClick={() => navigate(getInternshipOfferApplyPath(offerId))}
    >
      {children}
    </button>
  );
};

export default OfferApplyButton;
