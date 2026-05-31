import { FunctionComponent } from 'react';
import { useNavigate } from 'react-router-dom';
import { encadrantQuickActions } from '../data/encadrantMock';
import { ENCADRANT_SURFACE_CARD } from '../constants/encadrantLayout';

const EncadrantQuickActionsGrid: FunctionComponent = () => {
  const navigate = useNavigate();

  return (
    <section
      aria-label="Actions rapides"
      className="grid w-full min-w-0 grid-cols-1 gap-3 min-[360px]:grid-cols-2 sm:gap-4 lg:grid-cols-4"
    >
      {encadrantQuickActions.map((action) => {
        const Icon = action.icon;
        return (
          <button
            key={action.id}
            type="button"
            onClick={() => navigate(action.path)}
            className={`${ENCADRANT_SURFACE_CARD} min-w-0 cursor-pointer items-center px-4 py-5 text-center transition-[border-color,box-shadow] duration-200 hover:border-[#d0d5dd] hover:shadow-[0_4px_16px_rgba(16,24,40,0.06)] sm:px-5 sm:py-6`}
          >
            <span className="mx-auto mb-3 inline-flex h-11 w-11 items-center justify-center rounded-[10px] bg-[var(--admin-surface-muted)]">
              <Icon className={`h-6 w-6 ${action.iconClassName}`} strokeWidth={1.75} aria-hidden />
            </span>
            <span className="block font-inter text-sm font-semibold leading-5 text-[var(--admin-text)] sm:text-base">
              {action.title}
            </span>
            <span className="mt-1 block font-inter text-[12px] leading-4 text-[var(--admin-text-muted)] sm:text-[13px] sm:leading-5">
              {action.subtitle}
            </span>
          </button>
        );
      })}
    </section>
  );
};

export default EncadrantQuickActionsGrid;
