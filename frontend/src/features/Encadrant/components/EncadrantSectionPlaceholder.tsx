import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { ENCADRANT_PAGE_ROOT, ENCADRANT_SURFACE_CARD } from '../constants/encadrantLayout';

interface EncadrantSectionPlaceholderProps {
  title: string;
}

const EncadrantSectionPlaceholder: FunctionComponent<EncadrantSectionPlaceholderProps> = ({
  title,
}) => {
  const { t } = useTranslation();

  return (
    <div className={ENCADRANT_PAGE_ROOT}>
      <section className={`${ENCADRANT_SURFACE_CARD} px-6 py-8 sm:px-8 sm:py-10`}>
        <h2 className="text-xl font-semibold tracking-tight text-[var(--admin-text)] sm:text-2xl">
          {title}
        </h2>
        <p className="mt-2 text-sm text-[var(--admin-text-secondary)] sm:text-base">
          {t('encadrant.shell.comingSoon')}
        </p>
      </section>
    </div>
  );
};

export default EncadrantSectionPlaceholder;
