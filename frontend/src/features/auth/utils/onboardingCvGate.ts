const ONBOARDING_CV_PENDING_KEY = 'tc_onboarding_cv_pending';

export const markOnboardingCvPending = (): void => {
  try {
    sessionStorage.setItem(ONBOARDING_CV_PENDING_KEY, '1');
  } catch {
    /* ignore quota / private mode */
  }
};

export const clearOnboardingCvPending = (): void => {
  try {
    sessionStorage.removeItem(ONBOARDING_CV_PENDING_KEY);
  } catch {
    /* ignore */
  }
};

export const isOnboardingCvPending = (): boolean => {
  try {
    return sessionStorage.getItem(ONBOARDING_CV_PENDING_KEY) === '1';
  } catch {
    return false;
  }
};

export const ONBOARDING_CV_EDITOR_PATH = '/cv-editor';
