import { ArrowLeft, ArrowRight, type LucideIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const BACK_BUTTON_ROW_CLASS = 'back-button-row';

/** RTL-aware back icon and layout classes (physical left in Arabic). */
export function useBackNavigation() {
  const { i18n } = useTranslation();
  const isRtl = i18n.dir() === 'rtl';
  const BackIcon: LucideIcon = isRtl ? ArrowRight : ArrowLeft;
  const controlClassName = isRtl ? 'back-button back-button--rtl' : 'back-button';

  return {
    isRtl,
    BackIcon,
    rowClassName: BACK_BUTTON_ROW_CLASS,
    controlClassName,
  };
}
