import { Navigate } from 'react-router-dom';
import { STUDENT_ALL_INTERNSHIP_OFFERS_PATH } from '../constants/routes';

const AllInternshipOffersPage = () => (
  <Navigate to={STUDENT_ALL_INTERNSHIP_OFFERS_PATH} replace />
);

export default AllInternshipOffersPage;
