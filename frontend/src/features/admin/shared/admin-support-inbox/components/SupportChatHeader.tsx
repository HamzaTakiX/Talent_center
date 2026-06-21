import { FunctionComponent, ReactNode, useEffect, useRef, useState } from 'react';
import { ArrowLeft } from 'lucide-react';

export interface SupportChatHeaderMenuItem {
  key: string;
  label: string;
  icon: ReactNode;
  onClick: () => void;
}

interface Props {
  avatarInitials: string;
  title: string;
  meta?: string;
  onBack?: () => void;
  actions?: ReactNode;
  menuItems?: SupportChatHeaderMenuItem[];
}

const SupportChatHeader: FunctionComponent<Props> = ({
  avatarInitials,
  title,
  meta,
  onBack,
  actions,
  menuItems,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const close = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [menuOpen]);

  return (
    <header className="isi-chat-header">
      <div className="isi-chat-header-left">
        {onBack ? (
          <button type="button" onClick={onBack} className="isi-icon-btn lg:hidden" aria-label="Retour">
            <ArrowLeft className="size-5" />
          </button>
        ) : null}
        <div className="isi-avatar isi-avatar--header">{avatarInitials}</div>
        <div className="min-w-0">
          <h2 className="isi-chat-name truncate">{title}</h2>
          {meta ? <p className="isi-chat-meta truncate">{meta}</p> : null}
        </div>
      </div>

      <div className="isi-chat-actions">
        {actions}
        {menuItems && menuItems.length > 0 ? (
          <div ref={menuRef} className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              className="isi-icon-btn"
              aria-label="Plus d'actions"
              aria-expanded={menuOpen}
            >
              <svg
                className="size-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden
              >
                <circle cx="12" cy="5" r="1" fill="currentColor" stroke="none" />
                <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
                <circle cx="12" cy="19" r="1" fill="currentColor" stroke="none" />
              </svg>
            </button>
            {menuOpen ? (
              <div className="isi-header-menu" role="menu">
                {menuItems.map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      item.onClick();
                      setMenuOpen(false);
                    }}
                  >
                    {item.icon}
                    {item.label}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </header>
  );
};

export default SupportChatHeader;
