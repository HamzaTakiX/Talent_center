import { FunctionComponent, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { AlertCircle, Save, Link, AlignLeft, Briefcase, MapPin, Clock, CheckCircle2, Check, X } from 'lucide-react';
import profileCover from '../assets/images/complete-profile/campus_esca_2023 (1).webp';
import { useAuth } from '../hooks/useAuth';
import { authApi } from '../api';
import { AuthHeader } from '../components/AuthHeader';
import { AuthFooter } from '../components/AuthFooter';
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

const skillOptions = [
  'Digital Marketing', 'Data Analysis', 'Project Management', 'Microsoft Office',
  'Leadership', 'Communication', 'Problem Solving', 'Social Media Marketing',
  'Google Analytics', 'Teamwork', 'Business Strategy', 'Financial Analysis',
  'Python', 'Excel', 'PowerPoint', 'Photoshop', 'Illustrator'
];

const mobilityOptions = ['Within City', 'National', 'International', 'Remote'];

const CompleteProfilePage: FunctionComponent = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  
  // Professional Info
  const [linkedinUrl, setLinkedinUrl] = useState(user?.student_profile?.linkedin_url || '');
  const [linkedinError, setLinkedinError] = useState('');
  const [professionalSummary, setProfessionalSummary] = useState(user?.student_profile?.professional_summary || '');
  
  // Career Objective
  const [careerObjective, setCareerObjective] = useState('');
  
  // Skills
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  
  // Availability & Location
  const [availability, setAvailability] = useState<'immediately' | 'specific' | ''>('');
  const [startDate, setStartDate] = useState('');
  const [city, setCity] = useState('');
  const [mobility, setMobility] = useState<string[]>([]);
  
  // Experience
  const [hasApplied, setHasApplied] = useState<boolean | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev => 
      prev.includes(skill) 
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  };

  const toggleMobility = (option: string) => {
    setMobility(prev => 
      prev.includes(option)
        ? prev.filter(m => m !== option)
        : [...prev, option]
    );
  };

  const validateLinkedInUrl = (url: string): boolean => {
    // LinkedIn profile URL pattern: linkedin.com/in/username or linkedin.com/pub/username
    const linkedinPattern = /^https?:\/\/(www\.)?linkedin\.com\/(in|pub)\/[a-zA-Z0-9_-]+\/?$/;
    return linkedinPattern.test(url);
  };

  const handleLinkedInBlur = () => {
    if (linkedinUrl.trim() && !validateLinkedInUrl(linkedinUrl)) {
      setLinkedinError('Please enter a valid LinkedIn profile URL (e.g., https://linkedin.com/in/your-name)');
    } else {
      setLinkedinError('');
    }
  };

  const handleLinkedInChange = (value: string) => {
    setLinkedinUrl(value);
    if (linkedinError && validateLinkedInUrl(value)) {
      setLinkedinError('');
    }
  };

  const validateForm = () => {
    const missingFields: string[] = [];
    const invalidFields: string[] = [];
    
    if (!linkedinUrl.trim()) {
      missingFields.push('LinkedIn URL');
    } else if (!validateLinkedInUrl(linkedinUrl)) {
      invalidFields.push('LinkedIn URL must be a valid LinkedIn profile (e.g., https://linkedin.com/in/your-name)');
    }
    if (!professionalSummary.trim()) missingFields.push('Professional Summary');
    if (!careerObjective.trim()) missingFields.push('Career Objective');
    if (availability === 'specific' && !startDate) missingFields.push('Start Date');
    if (!city.trim()) missingFields.push('City');
    
    return { missingFields, invalidFields };
  };

  const handleSave = async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    // Validate required fields
    const { missingFields, invalidFields } = validateForm();
    if (missingFields.length > 0) {
      setError(`Please fill in the following required fields: ${missingFields.join(', ')}`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (invalidFields.length > 0) {
      setError(invalidFields.join('; '));
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccessMsg('');

      const formData = new FormData();
      if (linkedinUrl) formData.append('linkedin_url', linkedinUrl);
      if (professionalSummary) formData.append('professional_summary', professionalSummary);
      if (careerObjective) formData.append('career_objective', careerObjective);
      if (selectedSkills.length) formData.append('skills', selectedSkills.join(','));
      if (availability) formData.append('availability', availability);
      if (startDate) formData.append('start_date', startDate);
      if (city) formData.append('city', city);
      if (mobility.length) formData.append('mobility', mobility.join(','));
      if (hasApplied !== null) formData.append('has_applied', hasApplied.toString());

      const updatedUser = await authApi.completeProfile(formData);
      updateUser(updatedUser);
      setSuccessMsg('Profile completed successfully!');
      
      // Redirect to CV editor after short delay
      setTimeout(() => navigate('/cv-editor'), 1500);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to complete profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen overflow-x-hidden lg:h-screen lg:overflow-hidden flex flex-col lg:flex-row bg-white text-left font-inter text-sm text-darkslategray">
      {/* Form Container */}
      <div className="w-full flex-1 lg:w-1/2 lg:h-full overflow-y-auto flex flex-col items-center px-5 sm:px-8 pb-6 lg:p-2 box-border">
        <motion.div 
          className="w-full max-w-[576px] flex flex-col relative m-auto py-4 lg:py-1"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants}>
            <AuthHeader />
          </motion.div>

          <motion.div variants={itemVariants} className="w-full flex flex-col gap-0 mb-4 mt-2">
            <h1 className="text-lg font-bold tracking-tight -mb-1">Complete Your Profile</h1>
            <p className="text-[13px] text-dimgray leading-tight">Add your professional information before accessing internship opportunities.</p>
          </motion.div>

          {/* Info Badge */}
          <motion.div variants={itemVariants} className="w-full mb-4">
            <div className="w-full h-[74px] relative rounded-[10px] bg-aliceblue border-lightsteelblue border-solid border-[1px] box-border text-left text-sm text-slateblue font-inter flex items-center px-4">
              <svg className="absolute top-[19px] left-[17px] w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
              </svg>
              <div className="absolute top-[17px] left-[49px] w-[510px] h-10">
                <div className="absolute top-[-1px] left-[0px] leading-5 inline-block w-[471px]">This information helps improve your matching score with relevant internship opportunities.</div>
              </div>
            </div>
          </motion.div>

          {/* Messages */}
          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                key="error"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="w-full mb-4"
              >
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl flex items-center gap-3 text-sm font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              </motion.div>
            )}
            {successMsg && (
              <motion.div 
                key="success"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="w-full mb-4"
              >
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl flex items-center gap-3 text-sm font-medium">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Professional Information */}
          <motion.div variants={itemVariants} className="w-full flex flex-col gap-5 mb-6">
            <div className="text-gray uppercase text-sm font-semibold tracking-wide">Professional Information</div>
            
            {/* LinkedIn */}
            <div className="flex flex-col gap-2">
              <label className="font-medium text-darkslategray text-sm">LinkedIn Profile URL</label>
              <div className={`h-11 rounded-lg bg-whitesmoke border box-border overflow-hidden flex items-center py-1 px-3 transition-colors ${linkedinError ? 'border-red-400 bg-red-50' : 'border-lightgray'}`}>
                <Link className={`w-4 h-4 mr-3 ${linkedinError ? 'text-red-400' : 'text-slategray'}`} />
                <motion.input 
                  whileFocus={{ scale: 1.01 }}
                  transition={{ duration: 0.2 }}
                  type="url"
                  value={linkedinUrl}
                  onChange={(e) => handleLinkedInChange(e.target.value)}
                  onBlur={handleLinkedInBlur}
                  placeholder="https://linkedin.com/in/your-profile"
                  className={`flex-1 bg-transparent outline-none ${linkedinError ? 'text-red-600 placeholder-red-300' : 'text-darkslategray'}`}
                />
              </div>
              {linkedinError && (
                <motion.span 
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-500 text-xs flex items-center gap-1"
                >
                  <AlertCircle className="w-3 h-3" />
                  {linkedinError}
                </motion.span>
              )}
            </div>

            {/* Professional Summary */}
            <div className="flex flex-col gap-2">
              <label className="font-medium text-darkslategray text-sm">Short Professional Summary</label>
              <div className="h-[100px] rounded-lg bg-whitesmoke border-lightgray border-solid border box-border overflow-hidden flex items-start py-2 px-3">
                <AlignLeft className="w-4 h-4 text-slategray mr-3 mt-1" />
                <motion.textarea
                  whileFocus={{ scale: 1.01 }}
                  transition={{ duration: 0.2 }}
                  value={professionalSummary}
                  onChange={(e) => setProfessionalSummary(e.target.value)}
                  placeholder="Share a brief overview of your academic background, skills, and career goals..."
                  className="flex-1 bg-transparent outline-none text-darkslategray resize-none h-full font-inter"
                />
              </div>
            </div>
          </motion.div>

          {/* Career Objective */}
          <motion.div variants={itemVariants} className="w-full border-t border-gainsboro pt-5 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Briefcase className="w-5 h-5 text-mediumslateblue" />
              <div className="text-gray uppercase text-sm font-semibold tracking-wide">Career Objective</div>
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="font-medium text-darkslategray text-sm">Type of Internship You're Looking For</label>
              <div className="h-[80px] rounded-lg bg-whitesmoke border-lightgray border-solid border box-border overflow-hidden flex items-start py-2 px-3">
                <motion.textarea
                  whileFocus={{ scale: 1.01 }}
                  transition={{ duration: 0.2 }}
                  value={careerObjective}
                  onChange={(e) => setCareerObjective(e.target.value)}
                  placeholder="e.g., Marketing internship in a multinational company, focusing on digital strategy..."
                  className="flex-1 bg-transparent outline-none text-darkslategray resize-none h-full font-inter"
                />
              </div>
            </div>
          </motion.div>

          {/* Skills */}
          <motion.div variants={itemVariants} className="w-full border-t border-gainsboro pt-5 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle2 className="w-5 h-5 text-mediumslateblue" />
              <div className="text-gray uppercase text-sm font-semibold tracking-wide">Skills</div>
            </div>
            
            <div className="flex flex-col gap-3">
              <label className="font-medium text-darkslategray text-sm">Select Your Skills</label>
              <div className="flex flex-wrap gap-2">
                {skillOptions.map(skill => (
                  <motion.button
                    type="button"
                    key={skill}
                    onClick={() => toggleSkill(skill)}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-300 shadow-sm ${
                      selectedSkills.includes(skill)
                        ? 'bg-mediumslateblue text-white shadow-mediumslateblue/30'
                        : 'bg-whitesmoke text-darkslategray hover:bg-slate-200 hover:shadow-md'
                    }`}
                  >
                    {skill}
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Availability & Location */}
          <motion.div variants={itemVariants} className="w-full border-t border-gainsboro pt-5 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-mediumslateblue" />
              <div className="text-gray uppercase text-sm font-semibold tracking-wide">Availability & Location</div>
            </div>
            
            {/* Availability */}
            <div className="flex flex-col gap-2 mb-4">
              <label className="font-medium text-darkslategray text-sm">When Can You Start?</label>
              <div className="flex gap-3">
                <motion.button
                  type="button"
                  onClick={() => setAvailability('immediately')}
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                  className={`flex-1 h-11 rounded-lg flex items-center justify-center font-medium transition-all duration-300 shadow-sm ${
                    availability === 'immediately'
                      ? 'bg-mediumslateblue text-white shadow-mediumslateblue/30'
                      : 'bg-whitesmoke text-darkslategray hover:bg-slate-200 hover:shadow-md'
                  }`}
                >
                  Immediately
                </motion.button>
                <motion.button
                  type="button"
                  onClick={() => setAvailability('specific')}
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                  className={`flex-1 h-11 rounded-lg flex items-center justify-center font-medium transition-all duration-300 shadow-sm ${
                    availability === 'specific'
                      ? 'bg-mediumslateblue text-white shadow-mediumslateblue/30'
                      : 'bg-whitesmoke text-darkslategray hover:bg-slate-200 hover:shadow-md'
                  }`}
                >
                  Specific Date
                </motion.button>
              </div>
              {availability === 'specific' && (
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="mt-2 h-11 rounded-lg bg-whitesmoke border-lightgray border-solid border px-3"
                />
              )}
            </div>

            {/* City */}
            <div className="flex flex-col gap-2 mb-4">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-slategray" />
                <label className="font-medium text-darkslategray text-sm">Current City</label>
              </div>
              <div className="h-11 rounded-lg bg-whitesmoke border-lightgray border-solid border box-border overflow-hidden flex items-center py-1 px-3">
                <motion.input 
                  whileFocus={{ scale: 1.01 }}
                  transition={{ duration: 0.2 }}
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g., Casablanca"
                  className="flex-1 bg-transparent outline-none text-darkslategray"
                />
              </div>
            </div>

            {/* Mobility */}
            <div className="flex flex-col gap-2">
              <label className="font-medium text-darkslategray text-sm">Mobility Preferences</label>
              <div className="grid grid-cols-2 gap-3">
                {mobilityOptions.map(option => (
                  <motion.button
                    type="button"
                    key={option}
                    onClick={() => toggleMobility(option)}
                    whileHover={{ scale: 1.02, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ duration: 0.2 }}
                    className={`h-11 rounded-lg flex items-center justify-center font-medium transition-all duration-300 shadow-sm ${
                      mobility.includes(option)
                        ? 'bg-mediumslateblue text-white shadow-mediumslateblue/30'
                        : 'bg-whitesmoke text-darkslategray hover:bg-slate-200 hover:shadow-md'
                    }`}
                  >
                    {option}
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="w-full border-t border-gainsboro pt-5 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-5 h-5 text-mediumslateblue shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10 9 9 9 8 9"/>
              </svg>
              <div className="text-gray uppercase text-sm font-semibold tracking-wide">Application Experience</div>
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="font-medium text-darkslategray text-sm">Have you already applied to internships?</label>
              <div className="flex gap-3">
                <motion.button
                  type="button"
                  onClick={() => setHasApplied(true)}
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                  className={`flex-1 h-11 rounded-lg flex items-center justify-center gap-2 font-medium transition-all duration-300 shadow-sm ${
                    hasApplied === true
                      ? 'bg-mediumslateblue text-white shadow-mediumslateblue/30'
                      : 'bg-whitesmoke text-darkslategray hover:bg-slate-200 hover:shadow-md'
                  }`}
                >
                  {hasApplied === true && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500, damping: 30 }}><Check className="w-4 h-4" /></motion.div>}
                  Yes
                </motion.button>
                <motion.button
                  type="button"
                  onClick={() => setHasApplied(false)}
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                  className={`flex-1 h-11 rounded-lg flex items-center justify-center gap-2 font-medium transition-all duration-300 shadow-sm ${
                    hasApplied === false
                      ? 'bg-mediumslateblue text-white shadow-mediumslateblue/30'
                      : 'bg-whitesmoke text-darkslategray hover:bg-slate-200 hover:shadow-md'
                  }`}
                >
                  {hasApplied === false && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500, damping: 30 }}><X className="w-4 h-4" /></motion.div>}
                  No
                </motion.button>
              </div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="w-full mb-4">
            <motion.button 
              type="button"
              whileHover={{ y: -1, boxShadow: '0 6px 16px rgba(99, 102, 241, 0.25)' }}
              whileTap={{ scale: 0.98 }}
              disabled={loading} 
              onClick={handleSave} 
              className={`w-full h-11 rounded-lg bg-mediumslateblue text-white flex items-center justify-center font-medium transition-all ${
                loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-slateblue'
              }`}
            >
              {loading ? (
                <motion.div 
                  animate={{ rotate: 360 }} 
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                  className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                />
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  <span>Save and Continue</span>
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