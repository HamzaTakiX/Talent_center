import { FunctionComponent, useState, useRef } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { DownloadCloud, UploadCloud, FileText, AlertCircle, Save, Link, AlignLeft } from 'lucide-react';
import profileCover from '../assets/images/complete-profile/campus_esca_2023 (1).webp';
import { useAuth } from '../hooks/useAuth';
import { authApi } from '../api';
import { AuthHeader } from '../components/AuthHeader';
import { AuthFooter } from '../components/AuthFooter';
import { FormInput } from '../components/FormInput';
import AuthImagePanel from '../components/AuthImagePanel';

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

const CompleteProfilePage: FunctionComponent = () => {
  const { user, updateUser } = useAuth();
  const [linkedinUrl, setLinkedinUrl] = useState(user?.student_profile?.linkedin_url || '');
  const [professionalSummary, setProfessionalSummary] = useState(user?.student_profile?.professional_summary || '');
  const [cvFile, setCvFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isDragActive, setIsDragActive] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCvFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setCvFile(e.dataTransfer.files[0]);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError('');

      const formData = new FormData();
      if (linkedinUrl) formData.append('linkedin_url', linkedinUrl);
      if (professionalSummary) formData.append('professional_summary', professionalSummary);
      if (cvFile) formData.append('cv_file', cvFile);

      const updatedUser = await authApi.completeProfile(formData);
      updateUser(updatedUser);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to complete profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen overflow-x-hidden lg:h-screen lg:overflow-hidden flex flex-col lg:flex-row bg-white text-left font-inter text-sm text-darkslategray">

      {/* Form Container */}
      <div className="w-full flex-1 lg:w-1/2 lg:h-full overflow-y-auto lg:overflow-hidden flex flex-col items-center px-5 sm:px-8 pb-12 lg:p-6 border-r border-solid border-gainsboro box-border">

        {/* We use margin-auto mapping to center properly with minimal vertical offsets */}
        <motion.div 
          className="w-full max-w-[500px] flex flex-col relative m-auto py-6 lg:py-2"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants}>
            <AuthHeader />
          </motion.div>

          <motion.div variants={itemVariants} className="w-full flex flex-col gap-1 mb-8 mt-0">
            <div className="flex justify-between items-center text-gray">
              <h1 className="text-lg font-bold m-0 tracking-tight">Complete Your Profile</h1>
            </div>
            <p className="text-[13px] text-dimgray m-0 leading-tight">Add your professional information before accessing internship opportunities.</p>
          </motion.div>

          {/* Error Message Animation */}
          <AnimatePresence>
            {error && (
              <motion.div 
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
          </AnimatePresence>

          <motion.div variants={itemVariants} className="w-full flex flex-col gap-3 mb-3">
            <FormInput
              label="LinkedIn Profile URL"
              type="url"
              value={linkedinUrl}
              Icon={Link}
              onChange={(e) => setLinkedinUrl(e.target.value)}
              placeholder="https://linkedin.com/in/your-profile"
            />
            <FormInput
              label="Professional Summary"
              isTextArea
              value={professionalSummary}
              Icon={AlignLeft}
              onChange={(e) => setProfessionalSummary(e.target.value)}
              placeholder="Brief summary of your academic background..."
            />

            <div className="w-full flex flex-col gap-1.5 mt-2">
              <div className="text-[13px] font-medium text-darkslategray">Curriculum Vitae (CV)</div>

              <motion.div 
                whileHover={{ y: -1, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                whileTap={{ scale: 0.98 }}
                className="w-full h-8 relative rounded-lg bg-white border-lightgray border-solid border box-border text-center cursor-pointer hover:bg-slate-50 transition-all duration-300 flex justify-center items-center gap-2 shadow-sm group"
              >
                <DownloadCloud className="w-4 h-4 text-slate-500 group-hover:text-mediumslateblue transition-colors duration-300" strokeWidth={2.5} />
                <div className="font-semibold text-[12px] text-darkslategray group-hover:text-mediumslateblue transition-colors duration-300">Download ESCA CV Template</div>
              </motion.div>

              <motion.div 
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()} 
                className={`w-full py-2 relative rounded-xl border-dashed border-[2px] box-border text-dimgray cursor-pointer transition-all duration-300 flex flex-col justify-center items-center gap-1 group ${
                  isDragActive 
                    ? 'border-mediumslateblue bg-indigo-50/50' 
                    : cvFile 
                      ? 'border-green-400 bg-green-50/30' 
                      : 'border-lightgray bg-slate-50 hover:bg-slate-100 hover:border-slate-300'
                }`}
              >
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".pdf,.doc,.docx" />
                
                <AnimatePresence mode="wait">
                  {cvFile ? (
                    <motion.div 
                      key="file-selected"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="flex flex-col items-center gap-1"
                    >
                      <FileText className="w-6 h-6 text-green-500" strokeWidth={2} />
                      <div className="font-semibold text-[12px] text-darkslategray truncate max-w-[200px]">{cvFile.name}</div>
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="upload-prompt"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="flex flex-col items-center gap-1"
                    >
                      <UploadCloud className={`w-6 h-6 transition-colors duration-300 ${isDragActive ? 'text-mediumslateblue' : 'text-slate-400 group-hover:text-slate-500'}`} strokeWidth={2} />
                      <div className="font-semibold text-[12px] text-darkslategray">Upload Your CV</div>
                      <div className="text-[10px] font-normal text-slate-400">PDF, DOC, DOCX (Max 5MB)</div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Info Badge */}
              <motion.div 
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="w-full relative rounded-lg bg-aliceblue border-lightsteelblue border-solid border box-border py-1.5 px-3 mt-2 flex items-start gap-2 overflow-hidden"
              >
                <AlertCircle className="w-[14px] h-[14px] text-mediumslateblue mt-[1px] shrink-0" strokeWidth={2.5}/>
                <div className="relative leading-tight text-[11px] text-mediumslateblue">Please use the official ESCA CV template before uploading your final CV.</div>
              </motion.div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="w-full flex flex-col mt-2">
            <motion.button 
              whileHover={{ y: -1, boxShadow: '0 6px 16px rgba(99, 102, 241, 0.25)' }}
              whileTap={{ scale: 0.98 }}
              disabled={loading} 
              onClick={handleSave} 
              className={`w-full h-[42px] rounded-xl bg-mediumslateblue outline-none border-none text-white flex items-center justify-center shadow-md active:opacity-90 overflow-hidden relative group ${loading ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer hover:bg-slateblue'} transition-all duration-300`}
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
                  <Save className="w-[16px] h-[16px] opacity-90" strokeWidth={2.5}/>
                )}
                <span className="font-semibold text-[14px]">{loading ? 'Uploading...' : 'Save and Continue'}</span>
              </div>
            </motion.button>
          </motion.div>

          <motion.div variants={itemVariants}>
            <AuthFooter />
          </motion.div>
        </motion.div>
      </div>

      <AuthImagePanel
        imageSrc={profileCover}
        imageAlt="Profile Cover"
        badge="Profile Setup"
        title="Build Your Professional Profile"
        subtitle="Complete your profile, use the official ESCA CV template, and prepare for unique ecosystem opportunities."
      />

    </div>
  );
};
export default CompleteProfilePage;