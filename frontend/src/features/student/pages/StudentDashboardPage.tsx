import { FunctionComponent } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../auth/hooks/useAuth';
import { LogOut } from 'lucide-react';

const StudentDashboardPage: FunctionComponent = () => {
  const { logout, user } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-50 p-4">
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

        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Bienvenue Étudiant!
        </h1>

        <p className="text-gray-600 text-lg max-w-md mb-8">
          Espace étudiant en cours de développement.
        </p>

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
