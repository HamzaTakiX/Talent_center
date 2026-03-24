import { FunctionComponent, useState, useEffect } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { ShieldCheck, Edit3, AlertCircle, CheckCircle2, User, Calendar, BookOpen, GraduationCap, X } from 'lucide-react';
import identityCover from '../assets/images/confirm-identity/istockphoto-2105100634-612x612.jpg';
import { useAuth } from '../hooks/useAuth';
import { authApi } from '../api';
import { AuthHeader } from '../components/AuthHeader';
import { AuthFooter } from '../components/AuthFooter';
import { ReadOnlyField } from '../components/ReadOnlyField';
import AuthImagePanel from '../components/AuthImagePanel';
import { FormInput } from '../components/FormInput';
import { FormSelect } from '../components/FormSelect';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } }
};

const ConfirmIdentityPage: FunctionComponent = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const profile = user?.student_profile || ({} as any);

  // Form State
  const [firstName, setFirstName] = useState(profile.first_name || '');
  const [lastName, setLastName] = useState(profile.last_name || '');
  const [dateOfBirth, setDateOfBirth] = useState(profile.date_of_birth || '');
  const [programMajor, setProgramMajor] = useState(profile.program_major || '');
  const [currentClass, setCurrentClass] = useState(profile.current_class || '');

  // Predefined options
  const programMajorOptions = [
    { value: 'Programme Grande École – Marketing Digital & Communication', label: 'Programme Grande École – Marketing Digital & Communication' },
    { value: 'Programme Grande École – Finance Audit & Contrôle', label: 'Programme Grande École – Finance Audit & Contrôle' },
    { value: 'Programme Grande École – International Business', label: 'Programme Grande École – International Business' },
    { value: 'Programme Grande École – Entrepreneuriat & Innovation', label: 'Programme Grande École – Entrepreneuriat & Innovation' },
    { value: 'Programme Grande École – Ingénierie Financière', label: 'Programme Grande École – Ingénierie Financière' },
    { value: 'Licence – E-Business & Marketing Digital', label: 'Licence – E-Business & Marketing Digital' },
    { value: 'Licence – Achats & Logistique Internationale', label: 'Licence – Achats & Logistique Internationale' },
    { value: 'Licence – Gestion Comptable & Financière', label: 'Licence – Gestion Comptable & Financière' },
    { value: 'Licence – International Business Administration', label: 'Licence – International Business Administration' },
    { value: 'Master Spécialisé – Management de Projets', label: 'Master Spécialisé – Management de Projets' },
    { value: 'Master Spécialisé – Management des Ressources Humaines', label: 'Master Spécialisé – Management des Ressources Humaines' },
    { value: 'Master Spécialisé – Management Financier', label: 'Master Spécialisé – Management Financier' },
    { value: 'Master Spécialisé – Audit et Contrôle de Gestion', label: 'Master Spécialisé – Audit et Contrôle de Gestion' },
    { value: 'Master Spécialisé – Marketing Digital', label: 'Master Spécialisé – Marketing Digital' },
    { value: 'Master Spécialisé – Achats et Supply Chain Management', label: 'Master Spécialisé – Achats et Supply Chain Management' },
    { value: 'Master Spécialisé – Ingénierie Juridique, Financière et Fiscale', label: 'Master Spécialisé – Ingénierie Juridique, Financière et Fiscale' }
  ];

  const currentClassOptions = [
    { value: '1st Year', label: '1st Year' },
    { value: '2nd Year', label: '2nd Year' },
    { value: '3rd Year', label: '3rd Year' },
    { value: '4th Year', label: '4th Year' },
    { value: '5th Year', label: '5th Year' },
    { value: 'Licence 1', label: 'Licence 1' },
    { value: 'Licence 2', label: 'Licence 2' },
    { value: 'Licence 3', label: 'Licence 3' },
    { value: 'Master 1', label: 'Master 1' },
    { value: 'Master 2', label: 'Master 2' }
  ];

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (successMsg) {
      timeout = setTimeout(() => setSuccessMsg(''), 5000);
    }
    return () => clearTimeout(timeout);
  }, [successMsg]);

  const handleConfirm = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccessMsg('');
      
      const payload = isEditing ? {
        first_name: firstName,
        last_name: lastName,
        date_of_birth: dateOfBirth,
        program_major: programMajor,
        current_class: currentClass
      } : {};

      const updatedUser = await authApi.confirmIdentity(payload);
      updateUser(updatedUser);
      
      setIsEditing(false);
      setSuccessMsg('Your information has been successfully verified and saved.');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to process request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleEditMode = () => {
    if (isEditing) {
      // Revert to original profile values if cancelling
      setFirstName(profile.first_name || '');
      setLastName(profile.last_name || '');
      setDateOfBirth(profile.date_of_birth || '');
      setProgramMajor(profile.program_major || '');
      setCurrentClass(profile.current_class || '');
    }
    setIsEditing(!isEditing);
    setError('');
    setSuccessMsg('');
  };

  return (
    <div className="w-full min-h-screen overflow-x-hidden lg:h-screen lg:overflow-hidden flex flex-col lg:flex-row bg-white text-left font-inter text-sm text-darkslategray">
      
      {/* Form Container */}
      <div className="w-full flex-1 lg:w-1/2 lg:h-full overflow-y-auto flex flex-col items-center px-5 sm:px-8 pb-6 lg:p-2 box-border relative">
        <motion.div 
          className="w-full max-w-[500px] flex flex-col relative m-auto py-4 lg:py-1"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants}>
            <AuthHeader />
          </motion.div>

          <motion.div variants={itemVariants} className="w-full flex flex-col gap-1 mb-6 mt-2">
            <div className="flex justify-between items-center text-gray">
              <h1 className="text-lg font-bold m-0 tracking-tight">Confirm Your Identity</h1>
            </div>
            <p className="text-[13px] text-dimgray m-0 leading-tight">Please verify your academic information before accessing the platform.</p>
          </motion.div>

          {/* Messages Animation */}
          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                key="error-msg"
                initial={{ opacity: 0, height: 0, scale: 0.95 }}
                animate={{ opacity: 1, height: 'auto', scale: 1 }}
                exit={{ opacity: 0, height: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="w-full mb-4 overflow-hidden"
              >
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl flex items-center gap-3 text-sm font-medium shadow-sm">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                  <span>{error}</span>
                </div>
              </motion.div>
            )}
            
            {successMsg && (
              <motion.div 
                key="success-msg"
                initial={{ opacity: 0, height: 0, scale: 0.95 }}
                animate={{ opacity: 1, height: 'auto', scale: 1 }}
                exit={{ opacity: 0, height: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="w-full mb-4 overflow-hidden"
              >
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl flex items-center gap-3 text-sm font-medium shadow-sm">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-green-600" />
                  <span>{successMsg}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div variants={itemVariants} className="w-full flex flex-col gap-2 mb-8 relative">
            <div className="absolute -left-4 top-4 bottom-4 w-[2px] bg-gradient-to-b from-mediumslateblue/60 to-transparent rounded-full hidden sm:block"></div>
            
            <AnimatePresence mode="wait">
              {isEditing ? (
                <motion.div 
                  key="edit-form"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col gap-4"
                >
                  <div className="flex gap-3">
                    <FormInput label="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} Icon={User} />
                    <FormInput label="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                  </div>
                  <FormInput label="Date of Birth" type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} Icon={Calendar} />
                  <FormSelect 
                    label="Program / Major" 
                    value={programMajor} 
                    onChange={setProgramMajor} 
                    Icon={BookOpen} 
                    options={programMajorOptions}
                  />
                  <FormSelect 
                    label="Current Class" 
                    value={currentClass} 
                    onChange={setCurrentClass} 
                    Icon={GraduationCap} 
                    options={currentClassOptions}
                  />
                </motion.div>
              ) : (
                <motion.div 
                  key="read-only"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col gap-2.5"
                >
                  <ReadOnlyField label="First Name" value={profile.first_name || '...'} />
                  <ReadOnlyField label="Last Name" value={profile.last_name || '...'} />
                  <ReadOnlyField label="Date of Birth" value={profile.date_of_birth || '...'} />
                  <ReadOnlyField label="Program / Major" value={profile.program_major || '...'} />
                  <ReadOnlyField label="Current Class" value={profile.current_class || '...'} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          <motion.div variants={itemVariants} className="w-full flex flex-col gap-2 mt-1">
            <motion.button 
              whileHover={{ y: -1, boxShadow: '0 6px 16px rgba(99, 102, 241, 0.25)' }}
              whileTap={{ scale: 0.98 }}
              disabled={loading} 
              onClick={handleConfirm} 
              className={`w-full h-[48px] rounded-xl bg-mediumslateblue outline-none border-none text-white flex items-center justify-center shadow-md active:opacity-90 overflow-hidden relative group ${loading ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer hover:bg-slateblue'} transition-all duration-300`}
            >
              <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-full transition-transform duration-700 ease-in-out skew-x-12"></div>
              <div className="flex items-center gap-2 relative z-10">
                {loading ? (
                  <motion.div 
                    animate={{ rotate: 360 }} 
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                  />
                ) : (
                  isEditing ? <CheckCircle2 className="w-[18px] h-[18px] opacity-90" strokeWidth={2.5} /> : <ShieldCheck className="w-[18px] h-[18px] opacity-90" strokeWidth={2.5}/>
                )}
                <span className="font-semibold text-[15px]">{loading ? 'Processing...' : isEditing ? 'Save Information' : 'Confirm Information'}</span>
              </div>
            </motion.button>
            <motion.button 
              whileHover={{ y: -1, backgroundColor: '#f8fafc' }}
              whileTap={{ scale: 0.98 }}
              onClick={toggleEditMode}
              disabled={loading}
              className={`w-full h-[44px] rounded-xl bg-white border-lightgray border-solid border-[1px] box-border text-darkslategray flex items-center justify-center gap-2 group transition-all duration-300 ${loading ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer hover:bg-whitesmoke active:bg-slate-100'}`}
            >
              {isEditing ? (
                <>
                  <X className="w-4 h-4 text-slategray-200" />
                  <span className="font-semibold text-[14px]">Cancel Edit</span>
                </>
              ) : (
                <>
                  <Edit3 className="w-4 h-4 text-slategray-200 group-hover:text-mediumslateblue transition-colors" />
                  <span className="font-semibold text-[14px] group-hover:text-mediumslateblue transition-colors">Edit Information</span>
                </>
              )}
            </motion.button>
          </motion.div>

          <motion.div variants={itemVariants}>
            <AuthFooter />
          </motion.div>
        </motion.div>
      </div>

      <AuthImagePanel
        imageSrc={identityCover}
        imageAlt="Identity Cover"
        badge="Identity Verification"
        title="Verify Your Student Profile"
        subtitle="Confirm your personal and academic information to continue utilizing the ESCA platform network."
      />

    </div>
  );
};
export default ConfirmIdentityPage;
