import { FunctionComponent, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Icon from '../../student/assets/Icon.svg';
import { ENCADRANT_NAV_BUTTON_BASE } from '../constants/encadrantLayout';
import { ENCADRANT_NAV_ITEMS } from '../constants/navigation';

interface EncadrantSidebarProps {
  mobileOpen: boolean;
  onMobileClose: () => void;
}

const EncadrantSidebar: FunctionComponent<EncadrantSidebarProps> = ({ mobileOpen, onMobileClose }) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  useEffect(() => {
    onMobileClose();
  }, [pathname, onMobileClose]);

  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  return (
    <>
      <button
        type="button"
        aria-label="Close navigation menu"
        onClick={onMobileClose}
        className={`fixed inset-0 z-40 bg-[rgba(15,23,42,0.4)] transition-opacity lg:hidden ${
          mobileOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-screen w-[min(100vw,260px)] max-w-[280px] flex-none flex-col overflow-hidden border-r border-solid border-neutral-200/80 bg-white transition-transform duration-200 ease-out sm:w-[260px] lg:relative lg:z-auto lg:max-w-none lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="box-border flex min-h-[72px] flex-none items-center gap-3 border-b border-solid border-neutral-200 px-4 py-3 sm:min-h-[80px] sm:gap-3.5 sm:px-5 sm:py-3.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-[#7c3aed] shadow-sm sm:h-11 sm:w-11">
            <img src={Icon} alt="Digital Talent" className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <div className="flex min-w-0 flex-col font-sans">
            <span className="truncate text-sm font-semibold leading-tight tracking-tight text-[#171717] sm:text-[15px]">
              Digital Talent
            </span>
            <span className="truncate pt-0.5 text-xs font-medium leading-tight text-[#717182] sm:text-[13px]">
              Encadrant Portal
            </span>
          </div>
        </div>

        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto overflow-x-hidden px-2 py-3">
          {ENCADRANT_NAV_ITEMS.map((item) => {
            const ItemIcon = item.icon;
            const isActive = pathname === item.path;

            return (
              <button
                key={item.label}
                type="button"
                onClick={() => navigate(item.path)}
                aria-current={isActive ? 'page' : undefined}
                className={`${ENCADRANT_NAV_BUTTON_BASE} cursor-pointer ${
                  isActive
                    ? 'bg-[#eaeaea]'
                    : 'bg-transparent hover:bg-[#eaeaea]/70 active:bg-[#e0e0e0]'
                }`}
              >
                <ItemIcon className="relative h-4 w-4 shrink-0 text-[#171717]" strokeWidth={1.5} />
                <span className="min-w-0 flex-1 truncate leading-5">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="h-3 shrink-0 flex-none" />
      </aside>
    </>
  );
};

export default EncadrantSidebar;
