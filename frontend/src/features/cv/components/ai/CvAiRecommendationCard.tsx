import { FunctionComponent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import type { RecommendationItem } from '../../utils/cvAiPresentation';
import { sectionLabelKey } from '../../utils/cvAiPresentation';
import { cvAiBridge } from '../../quickcv/cvAiBridge';

interface CvAiRecommendationCardProps {
  item: RecommendationItem;
  index: number;
}

const CvAiRecommendationCard: FunctionComponent<CvAiRecommendationCardProps> = ({
  item,
  index,
}) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(index === 0 && item.priority === 'critical');

  const onEnter = () => cvAiBridge.setFocusedSection(item.section);
  const onLeave = () => cvAiBridge.setFocusedSection(null);

  return (
    <article
      className={`cv-ai-rec-card cv-ai-rec-card--${item.priority}`}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      onFocus={onEnter}
      onBlur={onLeave}
    >
      <button
        type="button"
        className="cv-ai-rec-card__head"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span className={`cv-ai-rec-card__priority cv-ai-rec-card__priority--${item.priority}`}>
          {t(`cv.ai.priority.${item.priority}`)}
        </span>
        <span className="cv-ai-rec-card__section">{t(sectionLabelKey(item.section))}</span>
        <p className="cv-ai-rec-card__title">{item.message}</p>
        <ChevronDown className={`cv-ai-rec-card__chevron ${open ? 'cv-ai-rec-card__chevron--open' : ''}`} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="cv-ai-rec-card__body-wrap"
          >
            <p className="cv-ai-rec-card__impact">{t(`cv.ai.${item.impact}`)}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </article>
  );
};

export default CvAiRecommendationCard;
