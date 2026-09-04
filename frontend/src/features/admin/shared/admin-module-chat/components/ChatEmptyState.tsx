import { FunctionComponent, useMemo } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Clock3, MessageSquareDot, Users, type LucideIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { fadeInUp } from '../../../dashboard/ui/animations';
import type { ChatEmptyStateProps } from '../types/chatEmptyStateTypes';
import ChatEmptyStateIllustration from './ChatEmptyStateIllustration';

const STAT_ICONS: Record<string, LucideIcon> = {
  unread: MessageSquareDot,
  pending: Clock3,
  resolved: CheckCircle2,
  availableAdmins: Users,
};

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
      availableAdmins:
        stats?.labels?.availableAdmins ?? t('admin.chatEmpty.stats.availableAdmins', { defaultValue: 'Available admins' }),
    };

    if (statsLoading) {
      return [
        { key: 'unread', value: stats?.unread, label: labels.unread },
        { key: 'pending', value: stats?.pending, label: labels.pending },
        { key: 'resolved', value: stats?.resolved, label: labels.resolved },
        ...(stats?.availableAdmins != null
          ? [{ key: 'availableAdmins', value: stats.availableAdmins, label: labels.availableAdmins }]
          : []),
      ];
    }

    if (!stats) return [];

    const items: { key: string; value?: number; label: string }[] = [];
    if (stats.unread != null) items.push({ key: 'unread', value: stats.unread, label: labels.unread });
    if (stats.pending != null) items.push({ key: 'pending', value: stats.pending, label: labels.pending });
    if (stats.resolved != null) items.push({ key: 'resolved', value: stats.resolved, label: labels.resolved });
    if (stats.availableAdmins != null) {
      items.push({
        key: 'availableAdmins',
        value: stats.availableAdmins,
        label: labels.availableAdmins,
      });
    }
    return items;
  }, [stats, statsLoading, t]);

  const statsClassName = [
    'chat-empty-state__stats',
    statItems.length >= 4 ? 'chat-empty-state__stats--quad' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <motion.div
      {...fadeInUp}
      transition={{ duration: 0.4 }}
      className={`chat-empty-state ${statItems.length > 0 ? 'chat-empty-state--with-stats' : ''} ${className}`.trim()}
    >
      <ChatEmptyStateIllustration moduleType={moduleType} />

      <h3 className="chat-empty-state__title">{title}</h3>
      <p className="chat-empty-state__description">{description}</p>

      {statItems.length > 0 ? (
        <div
          className={statsClassName}
          aria-busy={statsLoading}
          aria-live="polite"
        >
          {statItems.map((item) => {
            const StatIcon = STAT_ICONS[item.key] ?? MessageSquareDot;

            return (
              <div
                key={item.key}
                className={`chat-empty-state__stat chat-empty-state__stat--${item.key}`}
              >
                <div className="chat-empty-state__stat-head">
                  <span className="chat-empty-state__stat-icon" aria-hidden>
                    <StatIcon strokeWidth={2.25} />
                  </span>
                  {statsLoading ? (
                    <span className="chat-empty-state__stat-skeleton admin-shimmer" aria-hidden />
                  ) : (
                    <span className="chat-empty-state__stat-value">{item.value}</span>
                  )}
                </div>
                <span className="chat-empty-state__stat-label">{item.label}</span>
              </div>
            );
          })}
        </div>
      ) : null}
    </motion.div>
  );
};

export default ChatEmptyState;
