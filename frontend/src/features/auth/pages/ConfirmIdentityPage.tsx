import { FunctionComponent, useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { ShieldCheck, Edit3, AlertCircle, CheckCircle2, User, Calendar, BookOpen, GraduationCap, X } from 'lucide-react';
import identityCover from '../assets/images/confirm-identity/istockphoto-2105100634-612x612.jpg';
import { useAuth } from '../hooks/useAuth';
import { authApi } from '../api';
import { markIdentityJustConfirmed } from '../../../app/router/guards/OnboardingGuard';
import { AuthHeader } from '../components/AuthHeader';
import { AuthFooter } from '../components/AuthFooter';
import { ReadOnlyField } from '../components/ReadOnlyField';
import AuthImagePanel from '../components/AuthImagePanel';
import { AuthScreenShell, AuthFormColumn } from '../components/AuthScreenShell';
import { FormInput } from '../components/FormInput';
import { FormSelect } from '../components/FormSelect';
import { academicReferenceApi } from '../../admin/api/reference';
import type { AcademicYearOption, ClassGroupOption, FiliereOption } from '../../admin/api/types';
import type { StudentProfile } from '../types';
import {
  dateOfBirthInputBounds,
  MIN_STUDENT_AGE,
  MAX_STUDENT_AGE,
  validateDateOfBirth,
  type DateOfBirthValidationCode,
} from '../utils/validation';

const profileFiliereId = (sp?: StudentProfile | null): number | null => {
  if (!sp) return null;
  if (sp.filiere_id != null) return sp.filiere_id;
  if (typeof sp.filiere === 'number') return sp.filiere;
  return null;
};

const profileClassGroupId = (sp?: StudentProfile | null): number | null => {
  if (!sp) return null;
  if (sp.class_group_id != null) return sp.class_group_id;
  if (typeof sp.class_group === 'number') return sp.class_group;
  return null;
};

const resolveFiliereIdFromProfile = (
  sp: StudentProfile | null | undefined,
  list: FiliereOption[],
): string => {
  if (!sp || !list.length) return '';
  const fid = profileFiliereId(sp);
  if (fid != null && list.some((f) => f.id === fid)) return String(fid);
  const major = sp.program_major?.trim();
  if (!major) return '';
  const match = list.find(
    (f) =>
      f.name === major ||
      f.code === major ||
      major.toLowerCase().includes(f.code.toLowerCase()) ||
      major.toLowerCase().includes(f.name.toLowerCase()),
  );
  return match ? String(match.id) : '';
};

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
  const { t, i18n } = useTranslation();
  const lang = i18n.language?.split('-')[0] || 'fr';
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();

  const studentProfile = user?.student_profile ?? null;
  const profileAcademicYear = studentProfile?.academic_year?.trim() ?? '';
  const profileFiliereSeed = profileFiliereId(studentProfile) ?? '';
  const profileProgramMajor = studentProfile?.program_major?.trim() ?? '';
  const profileClassGroupSeed = profileClassGroupId(studentProfile) ?? '';
  const filiereBootstrapKey = `${lang}:${profileFiliereSeed}:${profileProgramMajor}`;
  const loadedClassGroupsKeyRef = useRef('');
  const filiereBootstrapKeyRef = useRef('');
  const confirmInFlightRef = useRef(false);

  // Form State
  const [firstName, setFirstName] = useState(studentProfile?.first_name || '');
  const [lastName, setLastName] = useState(studentProfile?.last_name || '');
  const [dateOfBirth, setDateOfBirth] = useState(studentProfile?.date_of_birth || '');
  const [programMajor, setProgramMajor] = useState(studentProfile?.program_major || '');
  const [currentClass, setCurrentClass] = useState(studentProfile?.current_class || '');
  const [filiereId, setFiliereId] = useState('');
  const [classGroupId, setClassGroupId] = useState('');
  const [filieres, setFilieres] = useState<FiliereOption[]>([]);
  const [classGroups, setClassGroups] = useState<ClassGroupOption[]>([]);
  const [academicYearCode, setAcademicYearCode] = useState('');
  const [loadingFilieres, setLoadingFilieres] = useState(true);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [referenceError, setReferenceError] = useState(false);
  const [dateOfBirthError, setDateOfBirthError] = useState('');

  const dateOfBirthBounds = useMemo(() => dateOfBirthInputBounds(), []);

  const getDateOfBirthErrorMessage = useCallback(
    (code: DateOfBirthValidationCode): string => {
      switch (code) {
        case 'required':
          return t('auth.confirmIdentity.errors.dateOfBirthRequired');
        case 'invalid':
          return t('auth.confirmIdentity.errors.dateOfBirthInvalid');
        case 'future':
          return t('auth.confirmIdentity.errors.dateOfBirthFuture');
        case 'tooYoung':
          return t('auth.confirmIdentity.errors.dateOfBirthTooYoung', { minAge: MIN_STUDENT_AGE });
        case 'tooOld':
          return t('auth.confirmIdentity.errors.dateOfBirthTooOld', { maxAge: MAX_STUDENT_AGE });
        default:
          return t('auth.confirmIdentity.errors.dateOfBirthInvalid');
      }
    },
    [t],
  );

  const resolveDateOfBirthError = useCallback(
    (value: string): string => {
      const code = validateDateOfBirth(value);
      return code ? getDateOfBirthErrorMessage(code) : '';
    },
    [getDateOfBirthErrorMessage],
  );

  useEffect(() => {
    setLoadingFilieres(true);
    setReferenceError(false);
    academicReferenceApi
      .listFilieres({ lang, student_catalog: true })
      .then((data) => {
        setFilieres(data);
        if (!data.length) setReferenceError(true);
      })
      .catch(() => {
        setFilieres([]);
        setReferenceError(true);
      })
      .finally(() => setLoadingFilieres(false));
  }, [lang]);

  useEffect(() => {
    if (profileAcademicYear) {
      setAcademicYearCode(profileAcademicYear);
      return;
    }

    let cancelled = false;
    academicReferenceApi
      .listAcademicYears({ structured: true, lang })
      .then((data) => {
        if (cancelled) return;
        const years = data as AcademicYearOption[];
        const current = years.find((y) => y.is_current) ?? years[0];
        if (current?.code) setAcademicYearCode(current.code);
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, [lang, profileAcademicYear]);

  useEffect(() => {
    if (!filieres.length || filiereBootstrapKeyRef.current === filiereBootstrapKey) return;
    const resolved = resolveFiliereIdFromProfile(studentProfile, filieres);
    if (resolved) setFiliereId(resolved);
    filiereBootstrapKeyRef.current = filiereBootstrapKey;
  }, [filieres, filiereBootstrapKey, studentProfile]);

  useEffect(() => {
    const queryKey =
      filiereId && academicYearCode ? `${lang}:${filiereId}:${academicYearCode}` : '';

    if (!queryKey) {
      loadedClassGroupsKeyRef.current = '';
      setClassGroups((prev) => (prev.length ? [] : prev));
      setLoadingClasses(false);
      return;
    }

    if (loadedClassGroupsKeyRef.current === queryKey) return;

    let cancelled = false;
    setLoadingClasses(true);

    academicReferenceApi
      .listClassGroups({
        filiere_id: Number(filiereId),
        academic_year: academicYearCode,
        lang,
      })
      .then((data) => {
        if (cancelled) return;
        loadedClassGroupsKeyRef.current = queryKey;
        setClassGroups(data);
      })
      .catch(() => {
        if (cancelled) return;
        loadedClassGroupsKeyRef.current = queryKey;
        setClassGroups([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingClasses(false);
      });

    return () => {
      cancelled = true;
    };
  }, [filiereId, academicYearCode, lang]);

  useEffect(() => {
    if (!classGroups.length || classGroupId) return;
    if (
      profileClassGroupSeed === '' ||
      !classGroups.some((c) => c.id === profileClassGroupSeed)
    ) {
      return;
    }
    setClassGroupId(String(profileClassGroupSeed));
  }, [classGroups, classGroupId, profileClassGroupSeed]);

  const applyProfileAcademicIds = useCallback(() => {
    loadedClassGroupsKeyRef.current = '';
    const resolved = resolveFiliereIdFromProfile(studentProfile, filieres);
    setFiliereId(resolved);
    const cid = profileClassGroupId(studentProfile);
    if (cid != null && classGroups.some((c) => c.id === cid)) {
      setClassGroupId(String(cid));
    } else {
      setClassGroupId('');
    }
  }, [studentProfile, filieres, classGroups]);

  const programMajorOptions = filieres.map((f) => ({
    value: String(f.id),
    label: f.name,
  }));
  const currentClassOptions = classGroups.map((c) => ({
    value: String(c.id),
    label: c.code ? `${c.code} — ${c.name}` : c.name,
  }));

  const programMajorLabel = useMemo(() => {
    if (filiereId) {
      const f = filieres.find((x) => String(x.id) === filiereId);
      if (f) return f.name;
    }
    return studentProfile?.program_major || t('auth.confirmIdentity.placeholders.emptyValue');
  }, [filiereId, filieres, studentProfile?.program_major, t]);

  const currentClassLabel = useMemo(() => {
    if (classGroupId) {
      const c = classGroups.find((x) => String(x.id) === classGroupId);
      if (c) return c.code ? `${c.code} — ${c.name}` : c.name;
    }
    return studentProfile?.current_class || t('auth.confirmIdentity.placeholders.emptyValue');
  }, [classGroupId, classGroups, studentProfile?.current_class, t]);

  const onFiliereChange = useCallback((next: string) => {
    loadedClassGroupsKeyRef.current = '';
    setFiliereId(next);
    setClassGroupId('');
  }, []);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (successMsg) {
      timeout = setTimeout(() => setSuccessMsg(''), 5000);
    }
    return () => clearTimeout(timeout);
  }, [successMsg]);

  useEffect(() => {
    if (!studentProfile) return;
    setFirstName(studentProfile.first_name || '');
    setLastName(studentProfile.last_name || '');
    setDateOfBirth(studentProfile.date_of_birth || '');
    setProgramMajor(studentProfile.program_major || '');
    setCurrentClass(studentProfile.current_class || '');
  }, [
    studentProfile?.first_name,
    studentProfile?.last_name,
    studentProfile?.date_of_birth,
    studentProfile?.program_major,
    studentProfile?.current_class,
  ]);

  const getErrorMessage = (err: any): string => {
    if (!err.response) {
      return t('auth.confirmIdentity.errors.network');
    }

    const status = err.response.status;
    const data = err.response.data;
    const backendMessage = data?.message || data?.detail || '';
    const errors = data?.errors;

    switch (status) {
      case 400:
        if (errors) {
          const fieldErrors = Object.entries(errors)
            .map(([, msgs]) => `${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
            .join('; ');
          return fieldErrors || t('auth.confirmIdentity.errors.validation');
        }
        return backendMessage || t('auth.confirmIdentity.errors.invalidInput');

      case 401:
        return t('auth.confirmIdentity.errors.sessionExpired');

      case 403:
        if (backendMessage.toLowerCase().includes('identity')) {
          return t('auth.confirmIdentity.errors.identityAlreadyConfirmed');
        }
        return t('auth.confirmIdentity.errors.forbidden');

      case 404:
        return t('auth.confirmIdentity.errors.notFound');

      case 409:
        return t('auth.confirmIdentity.errors.conflict');

      case 422:
        return backendMessage || t('auth.confirmIdentity.errors.unprocessable');

      case 429:
        return t('auth.confirmIdentity.errors.rateLimit');

      case 500:
      case 502:
      case 503:
      case 504:
        return t('auth.confirmIdentity.errors.server');

      default:
        return backendMessage || t('auth.confirmIdentity.errors.unexpected');
    }
  };

  const handleConfirm = async (shouldRedirect: boolean = false) => {
    if (confirmInFlightRef.current) return;

    try {
      confirmInFlightRef.current = true;
      setLoading(true);
      setError('');
      setSuccessMsg('');

      const sp = studentProfile;
      const effectiveFirstName = (firstName || sp?.first_name || '').trim();
      const effectiveLastName = (lastName || sp?.last_name || '').trim();
      const effectiveDateOfBirth = (dateOfBirth || sp?.date_of_birth || '').trim();
      const resolvedFiliereId = filiereId
        ? Number(filiereId)
        : profileFiliereId(sp);
      const resolvedClassGroupId = classGroupId
        ? Number(classGroupId)
        : profileClassGroupId(sp);
      const selectedFiliere =
        filieres.find((f) => String(f.id) === filiereId) ??
        (resolvedFiliereId != null
          ? filieres.find((f) => f.id === resolvedFiliereId)
          : undefined);
      const selectedClass =
        classGroups.find((c) => String(c.id) === classGroupId) ??
        (resolvedClassGroupId != null
          ? classGroups.find((c) => c.id === resolvedClassGroupId)
          : undefined);
      
      // Frontend validation
      const dobValidationError = resolveDateOfBirthError(effectiveDateOfBirth);
      if (dobValidationError) {
        setDateOfBirthError(dobValidationError);
        setError(
          isEditing
            ? dobValidationError
            : t('auth.confirmIdentity.errors.dateOfBirthFixRequired'),
        );
        setLoading(false);
        return;
      }
      setDateOfBirthError('');

      if (isEditing) {
        if (!effectiveFirstName) {
          setError(t('auth.confirmIdentity.errors.firstNameRequired'));
          setLoading(false);
          return;
        }
        if (!effectiveLastName) {
          setError(t('auth.confirmIdentity.errors.lastNameRequired'));
          setLoading(false);
          return;
        }
        if (!resolvedFiliereId) {
          setError(t('auth.confirmIdentity.errors.programRequired'));
          setLoading(false);
          return;
        }
        if (!resolvedClassGroupId) {
          setError(t('auth.confirmIdentity.errors.classRequired'));
          setLoading(false);
          return;
        }
      } else if (!effectiveFirstName || !effectiveLastName) {
        setError(t('auth.confirmIdentity.errors.validation'));
        setLoading(false);
        return;
      }
      
      const payload = {
        first_name: effectiveFirstName,
        last_name: effectiveLastName,
        date_of_birth: effectiveDateOfBirth,
        program_major: selectedFiliere?.name || programMajor || sp?.program_major || '',
        current_class: selectedClass?.name || currentClass || sp?.current_class || '',
        filiere_id: resolvedFiliereId,
        class_group_id: resolvedClassGroupId,
      };

      const updatedUser = await authApi.confirmIdentity(payload);
      updateUser(updatedUser);
      
      // Mark that we just confirmed identity (prevents OnboardingGuard auto-redirect)
      markIdentityJustConfirmed();
      
      setIsEditing(false);
      setSuccessMsg(t('auth.confirmIdentity.success'));
      
      // Only redirect if explicitly requested (Confirm button, not Save)
      if (shouldRedirect) {
        navigate('/complete-profile', { replace: true });
      }
    } catch (err: any) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
    } finally {
      confirmInFlightRef.current = false;
      setLoading(false);
    }
  };

  const toggleEditMode = () => {
    if (isEditing) {
      // Revert to original profile values if cancelling
      setFirstName(studentProfile?.first_name || '');
      setLastName(studentProfile?.last_name || '');
      setDateOfBirth(studentProfile?.date_of_birth || '');
      setProgramMajor(studentProfile?.program_major || '');
      setCurrentClass(studentProfile?.current_class || '');
      applyProfileAcademicIds();
    }
    setIsEditing(!isEditing);
    setError('');
    setSuccessMsg('');
    setDateOfBirthError('');
  };

  return (
    <AuthScreenShell>
      <AuthFormColumn>
        <motion.div
          className="w-full flex flex-col"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants}>
            <AuthHeader />
          </motion.div>

          <motion.div variants={itemVariants} className="w-full flex flex-col gap-1 mb-6 mt-2">
            <div className="flex justify-between items-center text-gray">
              <h1 className="auth-text-heading text-lg font-bold m-0 tracking-tight">{t('auth.confirmIdentity.title')}</h1>
            </div>
            <p className="auth-text-muted text-[13px] m-0 leading-tight">{t('auth.confirmIdentity.subtitle')}</p>
          </motion.div>

          {referenceError && (
            <motion.div variants={itemVariants} className="w-full mb-4">
              <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-xl text-sm font-medium">
                {t('auth.confirmIdentity.errors.referenceLoadFailed')}
              </div>
            </motion.div>
          )}

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
                    <FormInput label={t('auth.confirmIdentity.fields.firstName')} value={firstName} onChange={(e) => setFirstName(e.target.value)} Icon={User} />
                    <FormInput label={t('auth.confirmIdentity.fields.lastName')} value={lastName} onChange={(e) => setLastName(e.target.value)} />
                  </div>
                  <FormInput
                    label={t('auth.confirmIdentity.fields.dateOfBirth')}
                    type="date"
                    value={dateOfBirth}
                    min={dateOfBirthBounds.min}
                    max={dateOfBirthBounds.max}
                    error={dateOfBirthError}
                    onChange={(e) => {
                      const next = e.target.value;
                      setDateOfBirth(next);
                      setDateOfBirthError(resolveDateOfBirthError(next));
                    }}
                    Icon={Calendar}
                  />
                  <FormSelect 
                    label={t('auth.confirmIdentity.fields.programMajor')} 
                    value={filiereId} 
                    onChange={onFiliereChange} 
                    Icon={BookOpen} 
                    options={programMajorOptions}
                    placeholder={
                      loadingFilieres
                        ? t('auth.confirmIdentity.placeholders.loading')
                        : t('auth.confirmIdentity.placeholders.selectOption')
                    }
                    disabled={loadingFilieres || !programMajorOptions.length}
                  />
                  <FormSelect 
                    label={t('auth.confirmIdentity.fields.currentClass')} 
                    value={classGroupId} 
                    onChange={setClassGroupId} 
                    Icon={GraduationCap} 
                    options={currentClassOptions}
                    placeholder={
                      !filiereId
                        ? t('auth.confirmIdentity.placeholders.selectProgramFirst')
                        : loadingClasses
                          ? t('auth.confirmIdentity.placeholders.loading')
                          : t('auth.confirmIdentity.placeholders.selectOption')
                    }
                    disabled={!filiereId || loadingClasses || !currentClassOptions.length}
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
                  <ReadOnlyField label={t('auth.confirmIdentity.fields.firstName')} value={studentProfile?.first_name || t('auth.confirmIdentity.placeholders.emptyValue')} />
                  <ReadOnlyField label={t('auth.confirmIdentity.fields.lastName')} value={studentProfile?.last_name || t('auth.confirmIdentity.placeholders.emptyValue')} />
                  <ReadOnlyField label={t('auth.confirmIdentity.fields.dateOfBirth')} value={studentProfile?.date_of_birth || t('auth.confirmIdentity.placeholders.emptyValue')} />
                  <ReadOnlyField label={t('auth.confirmIdentity.fields.programMajor')} value={programMajorLabel} />
                  <ReadOnlyField label={t('auth.confirmIdentity.fields.currentClass')} value={currentClassLabel} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          <motion.div variants={itemVariants} className="w-full flex flex-col gap-2 mt-1">
            {isEditing ? (
              // Edit mode: Save button (no redirect)
              <motion.button 
                whileHover={{ y: -1, boxShadow: '0 6px 16px rgba(99, 102, 241, 0.25)' }}
                whileTap={{ scale: 0.98 }}
                disabled={loading} 
                onClick={() => handleConfirm(false)} 
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
                    <CheckCircle2 className="w-[18px] h-[18px] opacity-90" strokeWidth={2.5} />
                  )}
                  <span className="font-semibold text-[15px]">{loading ? t('auth.confirmIdentity.actions.saving') : t('auth.confirmIdentity.actions.save')}</span>
                </div>
              </motion.button>
            ) : (
              // Read mode: Confirm button (with redirect)
              <motion.button 
                whileHover={{ y: -1, boxShadow: '0 6px 16px rgba(99, 102, 241, 0.25)' }}
                whileTap={{ scale: 0.98 }}
                disabled={loading} 
                onClick={() => handleConfirm(true)} 
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
                    <ShieldCheck className="w-[18px] h-[18px] opacity-90" strokeWidth={2.5}/>
                  )}
                  <span className="font-semibold text-[15px]">{loading ? t('auth.confirmIdentity.actions.processing') : t('auth.confirmIdentity.actions.confirm')}</span>
                </div>
              </motion.button>
            )}
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
                  <span className="font-semibold text-[14px]">{t('auth.confirmIdentity.actions.cancelEdit')}</span>
                </>
              ) : (
                <>
                  <Edit3 className="w-4 h-4 text-slategray-200 group-hover:text-mediumslateblue transition-colors" />
                  <span className="font-semibold text-[14px] group-hover:text-mediumslateblue transition-colors">{t('auth.confirmIdentity.actions.edit')}</span>
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
        imageSrc={identityCover}
        imageAlt={t('auth.confirmIdentity.panelCoverAlt')}
        badge={t('auth.confirmIdentity.panelBadge')}
        title={t('auth.confirmIdentity.panelTitle')}
        subtitle={t('auth.confirmIdentity.panelSubtitle')}
      />
    </AuthScreenShell>
  );
};
export default ConfirmIdentityPage;
