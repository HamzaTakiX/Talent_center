import { FunctionComponent, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { fadeInUp } from '../../../dashboard/ui/animations';
import type { ChatEmptyStateProps } from '../types/chatEmptyStateTypes';
import ChatEmptyStateIllustration from './ChatEmptyStateIllustration';

const ChatEmptyState: FunctionComponent<ChatEmptyStateProps> = ({
  title,
  description,
  moduleType,
  stats,
  statsLoading = false,
  className = '',
}) => {
  const { t } = useTranslation();

  const statItems = useMemo(() => {
    const labels = {
      unread: stats?.labels?.unread ?? t('admin.chatEmpty.stats.unread'),
      pending: stats?.labels?.pending ?? t('admin.chatEmpty.stats.pending'),
      resolved: stats?.labels?.resolved ?? t('admin.chatEmpty.stats.resolved'),
    };

    if (statsLoading) {
      return [
        { key: 'unread', value: stats?.unread, label: labels.unread },
        { key: 'pending', value: stats?.pending, label: labels.pending },
        { key: 'resolved', value: stats?.resolved, label: labels.resolved },
      ];
    }

    if (!stats) return [];

    const items: { key: string; value?: number; label: string }[] = [];
    if (stats.unread != null) items.push({ key: 'unread', value: stats.unread, label: labels.unread });
    if (stats.pending != null) items.push({ key: 'pending', value: stats.pending, label: labels.pending });
    if (stats.resolved != null) items.push({ key: 'resolved', value: stats.resolved, label: labels.resolved });
    return items;
  }, [stats, statsLoading, t]);

  return (
    <motion.div
      {...fadeInUp}
      transition={{ duration: 0.4 }}
      className={`chat-empty-state ${className}`.trim()}
    >
      <ChatEmptyStateIllustration moduleType={moduleType} />

      <h3 className="chat-empty-state__title">{title}</h3>
      <p className="chat-empty-state__description">{description}</p>

      {statItems.length > 0 ? (
        <div
          className="chat-empty-state__stats"
          aria-busy={statsLoading}
          aria-live="polite"
        >
          {statItems.map((item) => (
            <div key={item.key} className="chat-empty-state__stat">
              {statsLoading ? (
                <span
                  className="chat-empty-state__stat-skeleton admin-shimmer"
                  aria-hidden
                />
              ) : (
                <span className="chat-empty-state__stat-value">{item.value}</span>
              )}
              <span className="chat-empty-state__stat-label">{item.label}</span>
            </div>
          ))}
        </div>
      ) : null}
    </motion.div>
  );
};

export default ChatEmptyState;
