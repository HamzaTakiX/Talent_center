import { FunctionComponent } from 'react';
import { motion } from 'framer-motion';

const AdminWelcome: FunctionComponent = () => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="text-center"
    >
      <div className="w-20 h-20 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
        <span className="text-4xl">👨‍💼</span>
      </div>

      <h1 className="text-3xl font-bold text-gray-900 mb-4">
        Bienvenue Administrateur!
      </h1>

      <p className="text-gray-600 text-lg max-w-md mb-8">
        Espace administrateur en cours de développement.
      </p>
    </motion.div>
  );
};

export default AdminWelcome;
