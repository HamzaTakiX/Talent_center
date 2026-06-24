import { FunctionComponent, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getInternshipOfferDetailsPath } from '../constants/routes';
import { useExternalApplyConfirmation } from '../context/ExternalApplyConfirmationContext';

interface ExternalApplyBootRedirectProps {
  offerId: string;
  externalUrl: string;
  offerTitle: string;
}

const ExternalApplyBootRedirect: FunctionComponent<ExternalApplyBootRedirectProps> = ({
  offerId,
  externalUrl,
  offerTitle,
}) => {
  const navigate = useNavigate();
  const { startExternalApply } = useExternalApplyConfirmation();

  useEffect(() => {
    startExternalApply({ offerId, externalUrl, offerTitle });
    navigate(getInternshipOfferDetailsPath(offerId), { replace: true });
  }, [offerId, externalUrl, offerTitle, navigate, startExternalApply]);

  return null;
};

export default ExternalApplyBootRedirect;
