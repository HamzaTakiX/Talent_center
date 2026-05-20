import { FunctionComponent, useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import {
  AlertCircle,
  Save,
  Link,
  AlignLeft,
  Briefcase,
  MapPin,
  Clock,
  CheckCircle2,
  Check,
  X,
  Copy,
  ArrowRight,
} from 'lucide-react';
import profileCover from '../assets/images/complete-profile/campus_esca_2023 (1).webp';
import { useAuth } from '../hooks/useAuth';
import { authApi } from '../api';
import { markOnboardingCvPending } from '../utils/onboardingCvGate';
import { AuthHeader } from '../components/AuthHeader';
import { AuthFooter } from '../components/AuthFooter';
import AuthImagePanel from '../components/AuthImagePanel';
import { AuthScreenShell, AuthFormColumn } from '../components/AuthScreenShell';
import AuthInfoBanner from '../components/AuthInfoBanner';
import { FormInput } from '../components/FormInput';
import '../styles/auth-form.css';

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

const SKILL_KEYS = [
  'digitalMarketing', 'dataAnalysis', 'projectManagement', 'microsoftOffice',
  'leadership', 'communication', 'problemSolving', 'socialMediaMarketing',
  'googleAnalytics', 'teamwork', 'businessStrategy', 'financialAnalysis',
  'python', 'excel', 'powerpoint', 'photoshop', 'illustrator',
] as const;

type SkillKey = (typeof SKILL_KEYS)[number];

const SKILL_API_VALUE: Record<SkillKey, string> = {
  digitalMarketing: 'Digital Marketing',
  dataAnalysis: 'Data Analysis',
  projectManagement: 'Project Management',
  microsoftOffice: 'Microsoft Office',
  leadership: 'Leadership',
  communication: 'Communication',
  problemSolving: 'Problem Solving',
  socialMediaMarketing: 'Social Media Marketing',
  googleAnalytics: 'Google Analytics',
  teamwork: 'Teamwork',
  businessStrategy: 'Business Strategy',
  financialAnalysis: 'Financial Analysis',
  python: 'Python',
  excel: 'Excel',
  powerpoint: 'PowerPoint',
  photoshop: 'Photoshop',
  illustrator: 'Illustrator',
};

const MOBILITY_KEYS = ['withinCity', 'national', 'international', 'remote'] as const;

type MobilityKey = (typeof MOBILITY_KEYS)[number];

const MOBILITY_API_VALUE: Record<MobilityKey, string> = {
  withinCity: 'Within City',
  national: 'National',
  international: 'International',
  remote: 'Remote',
};

type RequiredFieldKey = 'linkedin' | 'professionalSummary' | 'careerObjective' | 'startDate' | 'city';

const choiceBtnClass = (selected: boolean, extra = '') =>
  `auth-choice flex items-center justify-center font-medium ${extra} ${selected ? 'auth-choice--selected' : ''}`.trim();

const CompleteProfilePage: FunctionComponent = () => {
  const { t } = useTranslation();
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  
  // Professional Info
  const [linkedinUrl, setLinkedinUrl] = useState(user?.student_profile?.linkedin_url || '');
  const [linkedinError, setLinkedinError] = useState('');
  const [professionalSummary, setProfessionalSummary] = useState(user?.student_profile?.professional_summary || '');
  
  // Career Objective
  const [careerObjective, setCareerObjective] = useState('');
  
  // Skills
  const [selectedSkills, setSelectedSkills] = useState<SkillKey[]>([]);
  
  // Availability & Location
  const [availability, setAvailability] = useState<'immediately' | 'specific' | ''>('');
  const [startDate, setStartDate] = useState('');
  const [city, setCity] = useState('');
  const [mobility, setMobility] = useState<MobilityKey[]>([]);
  
  // Experience
  const [hasApplied, setHasApplied] = useState<boolean | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loginRecapEmail, setLoginRecapEmail] = useState<string | null>(null);
  const redirectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /** Délai auto avant CV editor (dev : laisser le temps de copier les identifiants test). */
  const cvEditorRedirectMs = import.meta.env.DEV ? 5000 : 1200;

  const goToCvEditor = useCallback(() => {
    if (redirectTimerRef.current) {
      clearTimeout(redirectTimerRef.current);
      redirectTimerRef.current = null;
    }
    markOnboardingCvPending();
    navigate('/cv-editor', { replace: true });
  }, [navigate]);

  useEffect(
    () => () => {
      if (redirectTimerRef.current) clearTimeout(redirectTimerRef.current);
    },
    []
  );

  const devTestPassword =
    (import.meta.env.VITE_DEV_STUDENT_PASSWORD as string | undefined) ||
    (import.meta.env.DEV ? 'TalentCenter2026!' : undefined);

  const toggleSkill = (skill: SkillKey) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill],
    );
  };

  const toggleMobility = (option: MobilityKey) => {
    setMobility((prev) =>
      prev.includes(option) ? prev.filter((m) => m !== option) : [...prev, option],
    );
  };

  const validateLinkedInUrl = (url: string): boolean => {
    // LinkedIn profile URL pattern: linkedin.com/in/username or linkedin.com/pub/username
    const linkedinPattern = /^https?:\/\/(www\.)?linkedin\.com\/(in|pub)\/[a-zA-Z0-9_-]+\/?$/;
    return linkedinPattern.test(url);
  };

  const handleLinkedInBlur = () => {
    if (linkedinUrl.trim() && !validateLinkedInUrl(linkedinUrl)) {
      setLinkedinError(t('auth.completeProfile.errors.linkedinInvalid'));
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
    const missingKeys: RequiredFieldKey[] = [];
    const invalidFields: string[] = [];

    if (!linkedinUrl.trim()) {
      missingKeys.push('linkedin');
    } else if (!validateLinkedInUrl(linkedinUrl)) {
      invalidFields.push(t('auth.completeProfile.errors.linkedinInvalidField'));
    }
    if (!professionalSummary.trim()) missingKeys.push('professionalSummary');
    if (!careerObjective.trim()) missingKeys.push('careerObjective');
    if (availability === 'specific' && !startDate) missingKeys.push('startDate');
    if (!city.trim()) missingKeys.push('city');

    return { missingKeys, invalidFields };
  };

  const handleSave = async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    // Validate required fields
    const { missingKeys, invalidFields } = validateForm();
    if (missingKeys.length > 0) {
      const fields = missingKeys.map((key) => t(`auth.completeProfile.fields.${key}`)).join(', ');
      setError(t('auth.completeProfile.errors.missingFields', { fields }));
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
      if (selectedSkills.length) {
        formData.append('skills', selectedSkills.map((k) => SKILL_API_VALUE[k]).join(','));
      }
      if (availability) formData.append('availability', availability);
      if (startDate) formData.append('start_date', startDate);
      if (city) formData.append('city', city);
      if (mobility.length) {
        formData.append('mobility', mobility.map((k) => MOBILITY_API_VALUE[k]).join(','));
      }
      if (hasApplied !== null) formData.append('has_applied', hasApplied.toString());

      const updatedUser = await authApi.completeProfile(formData);
      updateUser(updatedUser);
      setSuccessMsg(t('auth.completeProfile.success'));
      setLoginRecapEmail(updatedUser.email ?? user?.email ?? null);
      redirectTimerRef.current = setTimeout(goToCvEditor, cvEditorRedirectMs);
    } catch (err: any) {
      setError(err.response?.data?.detail || t('auth.completeProfile.errors.submitFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthScreenShell>
      <AuthFormColumn maxWidth="576px">
        <motion.div
          className="w-full flex flex-col"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants}>
            <AuthHeader />
          </motion.div>

          <motion.div variants={itemVariants} className="w-full flex flex-col gap-0 mb-4 mt-2">
            <h1 className="auth-text-heading text-lg font-bold tracking-tight -mb-1">{t('auth.completeProfile.title')}</h1>
            <p className="auth-text-muted text-[13px] leading-tight">{t('auth.completeProfile.subtitle')}</p>
          </motion.div>

          <motion.div variants={itemVariants} className="mb-4 w-full">
            <AuthInfoBanner>{t('auth.completeProfile.infoBanner')}</AuthInfoBanner>
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
                <div className="auth-alert-error flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium">
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
                className="w-full mb-4 space-y-3"
              >
                <div className="auth-alert-success flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{successMsg}</span>
                </div>
                {loginRecapEmail && (
                  <div className="auth-login-recap rounded-xl border border-[var(--auth-border)] bg-[var(--auth-input-bg)] p-4 text-sm">
                    <p className="font-semibold text-[var(--auth-text)] mb-1">
                      {t('auth.completeProfile.loginRecapTitle')}
                    </p>
                    <p className="text-[12px] text-[var(--auth-text-muted)] mb-3">
                      {import.meta.env.DEV && devTestPassword
                        ? t('auth.completeProfile.loginRecapHintDev', {
                            seconds: Math.ceil(cvEditorRedirectMs / 1000),
                          })
                        : t('auth.completeProfile.loginRecapHint')}
                    </p>
                    <div className="space-y-2 font-mono text-[13px]">
                      <div className="flex items-center justify-between gap-2 rounded-lg bg-[var(--auth-surface)] px-3 py-2">
                        <span className="text-[var(--auth-text-muted)]">{t('auth.completeProfile.loginRecapEmail')}</span>
                        <span className="auth-ltr-field truncate text-[var(--auth-text)]">{loginRecapEmail}</span>
                      </div>
                      {import.meta.env.DEV && devTestPassword && (
                        <div className="flex items-center justify-between gap-2 rounded-lg bg-[var(--auth-surface)] px-3 py-2">
                          <span className="text-[var(--auth-text-muted)]">
                            {t('auth.completeProfile.loginRecapPassword')}
                          </span>
                          <span className="auth-ltr-field text-[var(--auth-text)]">{devTestPassword}</span>
                        </div>
                      )}
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        className="auth-btn-primary inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold"
                        onClick={goToCvEditor}
                      >
                        {t('auth.completeProfile.continueToCvEditor')}
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                      {import.meta.env.DEV && devTestPassword ? (
                        <button
                          type="button"
                          className="auth-btn-secondary inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium"
                          onClick={() => {
                            const lines = [`${t('auth.completeProfile.loginRecapEmail')}: ${loginRecapEmail}`];
                            lines.push(`${t('auth.completeProfile.loginRecapPassword')}: ${devTestPassword}`);
                            void navigator.clipboard.writeText(lines.join('\n'));
                          }}
                        >
                          <Copy className="h-3.5 w-3.5" />
                          {t('auth.completeProfile.copyCredentials')}
                        </button>
                      ) : null}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Professional Information */}
          <motion.div variants={itemVariants} className="w-full flex flex-col gap-5 mb-6">
            <div className="auth-section-heading">{t('auth.completeProfile.sections.professional')}</div>
            
            {/* LinkedIn */}
            <FormInput
              label={t('auth.completeProfile.fields.linkedin')}
              type="url"
              Icon={Link}
              value={linkedinUrl}
              onChange={(e) => handleLinkedInChange(e.target.value)}
              onBlur={handleLinkedInBlur}
              placeholder={t('auth.completeProfile.placeholders.linkedin')}
              error={linkedinError || undefined}
            />

            <FormInput
              label={t('auth.completeProfile.fields.professionalSummary')}
              isTextArea
              Icon={AlignLeft}
              boxClassName="min-h-[100px]"
              rows={4}
              value={professionalSummary}
              onChange={(e) => setProfessionalSummary(e.target.value)}
              placeholder={t('auth.completeProfile.placeholders.professionalSummary')}
            />
          </motion.div>

          {/* Career Objective */}
          <motion.div variants={itemVariants} className="auth-section-divider w-full pt-5 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Briefcase className="auth-section-icon h-5 w-5" />
              <div className="auth-section-heading">{t('auth.completeProfile.sections.careerObjective')}</div>
            </div>
            
            <FormInput
              label={t('auth.completeProfile.fields.careerObjective')}
              isTextArea
              boxClassName="min-h-[80px]"
              rows={3}
              value={careerObjective}
              onChange={(e) => setCareerObjective(e.target.value)}
              placeholder={t('auth.completeProfile.placeholders.careerObjective')}
            />
          </motion.div>

          {/* Skills */}
          <motion.div variants={itemVariants} className="auth-section-divider w-full pt-5 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle2 className="auth-section-icon h-5 w-5" />
              <div className="auth-section-heading">{t('auth.completeProfile.sections.skills')}</div>
            </div>
            
            <div className="flex flex-col gap-3">
              <label className="auth-form-field__label text-sm font-medium">{t('auth.completeProfile.fields.skills')}</label>
              <div className="flex flex-wrap gap-2">
                {SKILL_KEYS.map((skill) => (
                  <motion.button
                    type="button"
                    key={skill}
                    onClick={() => toggleSkill(skill)}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className={choiceBtnClass(selectedSkills.includes(skill), 'auth-chip-pill px-3 py-1.5 text-sm')}
                  >
                    {t(`auth.completeProfile.skills.${skill}`)}
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Availability & Location */}
          <motion.div variants={itemVariants} className="auth-section-divider w-full pt-5 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="auth-section-icon h-5 w-5" />
              <div className="auth-section-heading">{t('auth.completeProfile.sections.availability')}</div>
            </div>
            
            {/* Availability */}
            <div className="flex flex-col gap-2 mb-4">
              <label className="auth-form-field__label text-sm font-medium">{t('auth.completeProfile.fields.whenStart')}</label>
              <div className="flex gap-3">
                <motion.button
                  type="button"
                  onClick={() => setAvailability('immediately')}
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                  className={choiceBtnClass(availability === 'immediately', 'h-11 flex-1 rounded-lg')}
                >
                  {t('auth.completeProfile.availability.immediately')}
                </motion.button>
                <motion.button
                  type="button"
                  onClick={() => setAvailability('specific')}
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                  className={choiceBtnClass(availability === 'specific', 'h-11 flex-1 rounded-lg')}
                >
                  {t('auth.completeProfile.availability.specificDate')}
                </motion.button>
              </div>
              {availability === 'specific' && (
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="auth-date-input auth-ltr-field" dir="ltr"
                />
              )}
            </div>

            <div className="auth-form-field mb-4 flex flex-col gap-1.5">
              <label className="auth-form-field__label text-sm font-medium">{t('auth.completeProfile.fields.city')}</label>
              <div className="auth-form-field__box flex h-11 items-center overflow-hidden rounded-xl border box-border px-3.5">
                <MapPin className="auth-form-field__icon me-2.5 h-4 w-4 shrink-0" strokeWidth={2} />
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder={t('auth.completeProfile.placeholders.city')}
                  className="auth-form-input flex-1"
                />
              </div>
            </div>

            {/* Mobility */}
            <div className="flex flex-col gap-2">
              <label className="auth-form-field__label text-sm font-medium">{t('auth.completeProfile.fields.mobility')}</label>
              <div className="grid grid-cols-2 gap-3">
                {MOBILITY_KEYS.map((option) => (
                  <motion.button
                    type="button"
                    key={option}
                    onClick={() => toggleMobility(option)}
                    whileHover={{ scale: 1.02, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ duration: 0.2 }}
                    className={choiceBtnClass(mobility.includes(option), 'h-11 rounded-lg')}
                  >
                    {t(`auth.completeProfile.mobility.${option}`)}
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="auth-section-divider w-full pt-5 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <svg className="auth-section-icon h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10 9 9 9 8 9"/>
              </svg>
              <div className="auth-section-heading">{t('auth.completeProfile.sections.applicationExperience')}</div>
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="auth-form-field__label text-sm font-medium">{t('auth.completeProfile.fields.hasApplied')}</label>
              <div className="flex gap-3">
                <motion.button
                  type="button"
                  onClick={() => setHasApplied(true)}
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                  className={choiceBtnClass(hasApplied === true, 'h-11 flex-1 gap-2 rounded-lg')}
                >
                  {hasApplied === true && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500, damping: 30 }}><Check className="w-4 h-4" /></motion.div>}
                  {t('auth.completeProfile.yes')}
                </motion.button>
                <motion.button
                  type="button"
                  onClick={() => setHasApplied(false)}
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                  className={choiceBtnClass(hasApplied === false, 'h-11 flex-1 gap-2 rounded-lg')}
                >
                  {hasApplied === false && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500, damping: 30 }}><X className="w-4 h-4" /></motion.div>}
                  {t('auth.completeProfile.no')}
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
              className="auth-btn-primary flex h-11 w-full items-center justify-center gap-2 rounded-lg font-medium"
            >
              {loading ? (
                <motion.div 
                  animate={{ rotate: 360 }} 
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                  className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                />
              ) : (
                <>
                  <Save className="w-4 h-4 shrink-0" />
                  <span>{t('auth.completeProfile.save')}</span>
                </>
              )}
            </motion.button>
          </motion.div>

          <motion.div variants={itemVariants}>
            <AuthFooter />
          </motion.div>
        </motion.div>
      </AuthFormColumn>

      <AuthImagePanel
        imageSrc={profileCover}
        imageAlt={t('auth.completeProfile.panelCoverAlt')}
        badge={t('auth.completeProfile.panelBadge')}
        title={t('auth.completeProfile.panelTitle')}
        subtitle={t('auth.completeProfile.panelSubtitle')}
      />
    </AuthScreenShell>
  );
};
export default CompleteProfilePage;