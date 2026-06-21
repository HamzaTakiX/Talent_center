import { FunctionComponent } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import AdminLayout from '../../dashboard/components/AdminLayout';
import { staggerContainer } from '../../dashboard/ui/animations';
import CreateOfferStudio from '../components/create/CreateOfferStudio';
import '../styles/create-offer-studio.css';

const CreateInternshipOfferPage: FunctionComponent = () => {
  const navigate = useNavigate();
  const goBack = () => navigate('/admin/internship-offers');

  return (
    <AdminLayout mainFillHeight>
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="offer-create-page flex h-full min-h-0 w-full min-w-0 max-w-none flex-1 flex-col self-stretch font-inter"
      >
        <CreateOfferStudio onBack={goBack} />
      </motion.div>
    </AdminLayout>
  );
};

export default CreateInternshipOfferPage;
