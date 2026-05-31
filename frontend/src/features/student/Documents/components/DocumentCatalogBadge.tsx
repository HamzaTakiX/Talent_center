import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, Zap } from 'lucide-react';
import type { DocumentCatalogBadgeType } from '../types';
import {
  STUDENT_BADGE_NEUTRAL,
  STUDENT_BADGE_SUCCESS,
  STUDENT_INLINE_BADGE,
} from '../../design-system/studentSemanticStyles';

interface DocumentCatalogBadgeProps {
  type: DocumentCatalogBadgeType;
}

const DocumentCatalogBadge: FunctionComponent<DocumentCatalogBadgeProps> = ({ type }) => {
  const { t } = useTranslation();

  if (type === 'auto') {
    return (
      <span className={`${STUDENT_INLINE_BADGE} ${STUDENT_BADGE_SUCCESS} inline-flex items-center gap-1`}>
        <Zap className="h-3.5 w-3.5 shrink-0" strokeWidth={2} aria-hidden />
        {t('student.documents.badges.auto')}
      </span>
    );
  }

  return (
    <span className={`${STUDENT_INLINE_BADGE} ${STUDENT_BADGE_NEUTRAL} inline-flex items-center gap-1`}>
      <Calendar className="h-3.5 w-3.5 shrink-0" strokeWidth={2} aria-hidden />
      {t('student.documents.badges.reservation')}
    </span>
  );
};

export default DocumentCatalogBadge;
