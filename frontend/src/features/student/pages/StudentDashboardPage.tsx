import { FunctionComponent } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../auth/hooks/useAuth';
import { LogOut } from 'lucide-react';
import AuthLanguageSwitcher from '../../auth/components/AuthLanguageSwitcher';

const StudentDashboardPage: FunctionComponent = () => {
  const { t } = useTranslation();
  const { logout, user } = useAuth();

  const handleLogout = () => {
    void logout();
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-50 p-4">
      <AuthLanguageSwitcher />
      {/* Simple centered message */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl">👋</span>
        </div>

        <h1 className="mb-4 text-3xl font-bold text-gray-900">{t('auth.student.welcome')}</h1>

        <p className="mb-8 max-w-md text-lg text-gray-600">{t('auth.student.subtitle')}</p>

        {/* Logout Button - Centered */}
        <div className="flex justify-center">
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLogout}
            className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors font-semibold shadow-lg"
          >
            <LogOut className="w-5 h-5" />
            <span>Se déconnecter</span>
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default StudentDashboardPage;
