import { FunctionComponent } from 'react';
import { motion } from 'framer-motion';
import AuthLanguageSwitcher from './AuthLanguageSwitcher';
import AuthThemeToggle from './AuthThemeToggle';

type AuthPreferencesPlacement = 'image' | 'page';

interface AuthPreferencesBarProps {
  /** `image` = top-right of hero panel; `page` = viewport corner (no image, e.g. callback). */
  placement?: AuthPreferencesPlacement;
}

const PLACEMENT_CLASS: Record<AuthPreferencesPlacement, string> = {
  image:
    'absolute top-4 right-4 z-30 max-lg:top-[max(1rem,env(safe-area-inset-top))] max-lg:right-[max(1rem,env(safe-area-inset-right))] lg:top-6 lg:right-8',
  page:
    'fixed top-4 right-4 z-50 max-lg:top-[max(1rem,env(safe-area-inset-top))] max-lg:right-[max(1rem,env(safe-area-inset-right))]',
};

/** Language + theme controls — overlaid on auth hero image (default) or page corner. */
const AuthPreferencesBar: FunctionComponent<AuthPreferencesBarProps> = ({
  placement = 'image',
}) => (
  <motion.div
    className={`auth-pref-bar auth-pref-bar--on-image flex h-[2.125rem] shrink-0 items-center gap-0.5 rounded-lg p-0.5 ${PLACEMENT_CLASS[placement]}`}
    initial={{ opacity: 0, y: -6 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.25 }}
    role="toolbar"
    aria-label="Preferences"
  >
    <AuthThemeToggle />
    <AuthLanguageSwitcher embedded className="!border-0 !bg-transparent !p-0 !shadow-none" />
  </motion.div>
);

export default AuthPreferencesBar;
