import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';

type NavChatUnreadBadgeVariant = 'admin' | 'encadrant';

interface NavChatUnreadBadgeProps {
  count: number;
  variant?: NavChatUnreadBadgeVariant;
}

const NavChatUnreadBadge: FunctionComponent<NavChatUnreadBadgeProps> = ({
  count,
  variant = 'admin',
}) => {
  const { t } = useTranslation();

  if (count <= 0) return null;

  const displayCount = count > 99 ? '99+' : String(count);

  return (
    <span
      className={
        variant === 'encadrant'
          ? 'ml-auto inline-flex h-[18px] min-w-[18px] shrink-0 items-center justify-center rounded-full bg-[#fb2c36] px-1 text-[10px] font-bold leading-none text-white'
          : 'admin-nav-unread-badge ml-auto shrink-0'
      }
      aria-label={t('admin.chat.navUnreadBadge', {
        count,
        defaultValue: '{{count}} message(s) non lu(s)',
      })}
    >
      {displayCount}
    </span>
  );
};

export default NavChatUnreadBadge;
