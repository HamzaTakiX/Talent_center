import { FunctionComponent } from 'react';
import { useNavigate } from 'react-router-dom';
import { InternshipOffer } from '../types';
import AdminRowActions from '../../ui/AdminRowActions';

interface InternshipOfferActionsProps {
  offer: InternshipOffer;
  variant?: 'mobile' | 'desktop';
}

const InternshipOfferActions: FunctionComponent<InternshipOfferActionsProps> = ({
  offer,
  variant = 'desktop',
}) => {
  const navigate = useNavigate();

  return (
    <AdminRowActions
      variant={variant}
      onView={() => navigate(`/admin/internship-offers/${offer.id}`)}
      onEdit={() => console.log('Edit offer:', offer.id)}
      onDelete={() => console.log('Delete offer:', offer.id)}
      onAssign={() => console.log('Assign offer:', offer.id)}
      showAssign
    />
  );
};

export default InternshipOfferActions;
