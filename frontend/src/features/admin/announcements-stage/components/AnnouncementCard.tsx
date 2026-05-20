import { FunctionComponent } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Building2, Calendar, Eye, MousePointerClick, Users } from 'lucide-react';
import type { AnnouncementListItem } from '../types/announcement';
import { typeIcon } from '../utils/announcementMeta';
import AnnouncementStatusBadge from './AnnouncementStatusBadge';
import AnnouncementPriorityBadge from './AnnouncementPriorityBadge';
import { fadeInUp } from '../../dashboard/ui/animations';

interface Props {
  item: AnnouncementListItem;
  index?: number;
  onClick: () => void;
}

const AnnouncementCard: FunctionComponent<Props> = ({ item, index = 0, onClick }) => {
  const { t } = useTranslation();
  const TypeIcon = typeIcon(item.typeCode);
  const isUrgent =
    item.priority === 'URGENT' || item.priority === 'INSTITUTIONAL_CRITICAL' || item.is_pinned;

  return (
    <motion.button
      type="button"
      className="admin-ann-card"
      onClick={onClick}
      {...fadeInUp}
      transition={{ delay: index * 0.04 }}
    >
      <div className="admin-ann-card__cover">
        <div className="admin-ann-card__cover-placeholder" aria-hidden>
          <TypeIcon className="h-10 w-10 opacity-40" />
        </div>
        <div className="admin-ann-card__badges">
          <AnnouncementStatusBadge status={item.status} />
          {isUrgent ? <AnnouncementPriorityBadge priority={item.priority} /> : null}
        </div>
      </div>
      <div className="admin-ann-card__body">
        <h3 className="admin-ann-card__title">{item.title}</h3>
        {item.company_name ? (
          <p className="admin-ann-card__company">
            <Building2 className="inline h-3 w-3 me-1 opacity-70" aria-hidden />
            {item.company_name}
          </p>
        ) : null}
        <div className="admin-ann-card__chips">
          <span className="admin-ann-chip">{item.typeName || item.typeCode}</span>
          <span className="admin-ann-chip">
            <Users className="h-3 w-3" aria-hidden />
            {t(`admin.announcementsModule.scopes.${item.target_scope}`, {
              defaultValue: item.target_scope,
            })}
          </span>
        </div>
        <div className="admin-ann-card__stats">
          <span className="admin-ann-card__stat">
            <Eye className="h-3.5 w-3.5" aria-hidden />
            {item.view_count}
          </span>
          <span className="admin-ann-card__stat">
            <MousePointerClick className="h-3.5 w-3.5" aria-hidden />
            {item.click_count}
          </span>
          {item.application_deadline ? (
            <span className="admin-ann-card__stat">
              <Calendar className="h-3.5 w-3.5" aria-hidden />
              {new Date(item.application_deadline).toLocaleDateString()}
            </span>
          ) : null}
        </div>
      </div>
    </motion.button>
  );
};

export default AnnouncementCard;
