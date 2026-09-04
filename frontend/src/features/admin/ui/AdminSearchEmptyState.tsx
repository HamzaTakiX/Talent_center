import { FunctionComponent, ReactNode } from 'react';
import { SearchX } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { fadeInUp } from '../dashboard/ui/animations';
import { ADMIN_EMPTY_TITLE_TO_KEY } from '../i18n/adminEmptyTitleMap';

export interface AdminSearchEmptyStateProps {
  title?: string;
  description?: string;
  /** Explicit i18n key (e.g. admin.empty.studentsFilters) */
  titleKey?: string;
  descriptionKey?: string;
  /** panel = listes / mobile ; table = dans un tableau ; inline = compact */
  variant?: 'panel' | 'table' | 'inline';
  className?: string;
  icon?: ReactNode;
}

function resolveCopy(
  t: (key: string) => string,
  text: string | undefined,
  explicitKey: string | undefined,
  fallbackKey: string
): string {
  if (explicitKey) return t(explicitKey);
  if (text) {
    const mapped = ADMIN_EMPTY_TITLE_TO_KEY[text];
    if (mapped) return t(mapped);
    return text;
  }
  return t(fallbackKey);
}

const AdminSearchEmptyState: FunctionComponent<AdminSearchEmptyStateProps> = ({
  title,
  description,
  titleKey,
  descriptionKey,
  variant = 'panel',
  className = '',
  icon,
}) => {
  const { t } = useTranslation();
  const resolvedTitle = resolveCopy(t, title, titleKey, 'admin.empty.noResults');
  const resolvedDescription = resolveCopy(
    t,
    description,
    descriptionKey,
    'admin.empty.tryAdjusting'
  );

  return (
    <motion.div
      {...fadeInUp}
      transition={{ duration: 0.35 }}
      className={`admin-search-empty-state admin-search-empty-state--${variant} ${className}`.trim()}
      role="status"
      aria-live="polite"
    >
      <div className="admin-search-empty-state__content">
        <motion.div className="admin-search-empty-state__glow" aria-hidden />
        <motion.div className="admin-search-empty-state__icon">
          {icon ?? <SearchX className="h-6 w-6" strokeWidth={1.75} aria-hidden />}
        </motion.div>
        <h3 className="admin-search-empty-state__title">{resolvedTitle}</h3>
        <p className="admin-search-empty-state__desc">{resolvedDescription}</p>
      </div>
    </motion.div>
  );
};

export default AdminSearchEmptyState;
