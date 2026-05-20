import { FunctionComponent, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  AlertCircle,
  Calendar,
  CreditCard,
  Download,
  Sparkles,
  Store,
  Zap,
} from 'lucide-react';
import type { DocumentServiceWritePayload } from '../../types/documentServiceCatalog';
import { getWorkloadLevel } from './serviceCatalogStudioSteps';

interface Props {
  value: DocumentServiceWritePayload;
}

const ServiceCatalogStudioHelpers: FunctionComponent<Props> = ({ value }) => {
  const { t } = useTranslation();
  const cfg = value.config;
  const P = 'admin.documentsModule.catalog.form.studio.helpers';

  const items = useMemo(() => {
    const list: { id: string; icon: typeof Sparkles; tone: string; text: string }[] = [];
    if (cfg.delivery.physical.reservationRequired) {
      list.push({
        id: 'reservation',
        icon: Calendar,
        tone: 'cyan',
        text: t(`${P}.reservation`),
      });
    }
    if (cfg.validation.srfClearanceRequired) {
      list.push({
        id: 'srf',
        icon: CreditCard,
        tone: 'violet',
        text: t(`${P}.srf`),
      });
    }
    if (cfg.availability.physicalOnly) {
      list.push({
        id: 'physical-only',
        icon: Store,
        tone: 'navy',
        text: t(`${P}.physicalOnly`),
      });
    }
    if (cfg.delivery.online.enabled) {
      list.push({
        id: 'online',
        icon: Download,
        tone: 'blue',
        text: t(`${P}.online`),
      });
    }
    if (cfg.availability.autoGenerateEnabled) {
      list.push({
        id: 'auto',
        icon: Zap,
        tone: 'brand',
        text: t(`${P}.autoGen`),
      });
    }
    const workload = getWorkloadLevel(cfg.processing.estimatedHours);
    list.push({
      id: 'workload',
      icon: AlertCircle,
      tone: 'slate',
      text: t(`${P}.workload.${workload}`),
    });
    return list;
  }, [cfg, t]);

  if (items.length === 0) return null;

  return (
    <div className="admin-doc-studio-helpers" role="status" aria-live="polite">
      <AnimatePresence mode="popLayout">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.id}
              className={`admin-doc-studio-helper admin-doc-studio-helper--${item.tone}`}
              layout
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.25 }}
            >
              <Icon className="h-4 w-4 shrink-0" aria-hidden />
              <span>{item.text}</span>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default ServiceCatalogStudioHelpers;
