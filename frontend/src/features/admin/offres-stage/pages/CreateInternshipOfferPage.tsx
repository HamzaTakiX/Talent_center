import { FunctionComponent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import AdminLayout from '../../dashboard/components/AdminLayout';
import { staggerContainer } from '../../dashboard/ui/animations';
import CreateOfferStudio from '../components/create/CreateOfferStudio';
import OfferStudioLoadingSkeleton from '../components/create/OfferStudioLoadingSkeleton';
import '../styles/create-offer-studio.css';

/** How long the branded entry skeleton stays before revealing the studio (ms). */
const ENTRY_DELAY_MS = 900;

const CreateInternshipOfferPage: FunctionComponent = () => {
  const navigate = useNavigate();
  const goBack = () => navigate('/admin/internship-offers');

  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const id = window.setTimeout(() => setIsReady(true), ENTRY_DELAY_MS);
    return () => window.clearTimeout(id);
  }, []);

  return (
    <AdminLayout mainFillHeight>
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="offer-create-page flex h-full min-h-0 w-full min-w-0 max-w-none flex-1 flex-col self-stretch font-inter"
      >
        <AnimatePresence mode="wait">
          {!isReady ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.3 }}
              className="flex flex-1 flex-col min-h-0"
            >
              <OfferStudioLoadingSkeleton variant="method-select" />
            </motion.div>
          ) : (
            <motion.div
              key="studio"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="flex flex-1 flex-col min-h-0"
            >
              <CreateOfferStudio onBack={goBack} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AdminLayout>
  );
};

export default CreateInternshipOfferPage;
