import { FunctionComponent } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { FileText, Calendar, FileStack, Users, BarChart3, LayoutGrid } from 'lucide-react';

type Variant = 'requests' | 'search' | 'reservations' | 'templates' | 'resources' | 'workload' | 'analytics';

const ICONS: Record<Variant, typeof FileText> = {
  requests: FileText,
  search: FileText,
  reservations: Calendar,
  templates: FileStack,
  resources: Users,
  workload: LayoutGrid,
  analytics: BarChart3,
};

interface Props {
  variant: Variant;
}

const DocumentsPremiumEmpty: FunctionComponent<Props> = ({ variant }) => {
  const { t } = useTranslation();
  const Icon = ICONS[variant];
  const key = variant === 'search' ? 'search' : variant;

  return (
    <motion.div
      className="admin-doc-empty"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <motion.div className="admin-doc-empty__icon-wrap">
        <Icon className="admin-doc-empty__icon" strokeWidth={1.25} aria-hidden />
      </motion.div>
      <h3 className="admin-doc-empty__title">{t(`admin.documentsModule.empty.${key}.title`)}</h3>
      <p className="admin-doc-empty__subtitle">{t(`admin.documentsModule.empty.${key}.subtitle`)}</p>
    </motion.div>
  );
};

export default DocumentsPremiumEmpty;
