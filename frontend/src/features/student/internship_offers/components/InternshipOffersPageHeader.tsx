import { FunctionComponent, ReactNode } from 'react';
import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { easePremium } from '../../../admin/dashboard/ui/animations';
import { INTERNSHIP_OFFERS_PAGE_HEADER } from '../constants/internshipOffersLayout';

interface InternshipOffersPageHeaderProps {
  backLink: ReactNode;
  icon: LucideIcon;
  title: string;
  subtitle: string;
  iconChipClassName: string;
}

const InternshipOffersPageHeader: FunctionComponent<InternshipOffersPageHeaderProps> = ({
  backLink,
  icon: Icon,
  title,
  subtitle,
  iconChipClassName,
}) => (
  <div className={INTERNSHIP_OFFERS_PAGE_HEADER}>
    {backLink}

    <motion.header
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: easePremium }}
      className="student-module-page-hero"
    >
      <div
        className="student-module-page-hero-mesh student-module-page-hero-mesh--primary"
        aria-hidden
      />
      <div
        className="student-module-page-hero-mesh student-module-page-hero-mesh--secondary"
        aria-hidden
      />

      <div className="relative flex min-w-0 items-start gap-3 sm:gap-4">
        <span
          className={`student-module-page-hero-icon ${iconChipClassName}`}
          aria-hidden
        >
          <Icon className="h-5 w-5 sm:h-[22px] sm:w-[22px]" strokeWidth={1.75} />
        </span>

        <div className="min-w-0 flex-1 pt-0.5">
          <h1 className="m-0 min-w-0 max-w-full break-words text-2xl font-bold leading-tight tracking-tight text-[var(--admin-text)] sm:text-[1.75rem] sm:leading-9">
            {title}
          </h1>
          <p className="m-0 mt-1.5 max-w-2xl text-sm leading-relaxed text-[var(--admin-text-secondary)] sm:mt-2 sm:text-[15px]">
            {subtitle}
          </p>
        </div>
      </div>
    </motion.header>
  </div>
);

export default InternshipOffersPageHeader;
