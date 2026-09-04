import { FunctionComponent, useState } from 'react';
import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { easePremium } from '../dashboard/ui/animations';

export type AdminEntityDetailHeroChip = {
  icon: LucideIcon;
  label: string;
};

type Props = {
  name: string;
  avatarUrl?: string | null;
  initials: string;
  statusLabel?: string;
  chips: AdminEntityDetailHeroChip[];
  avatarAlt?: string;
};

const AdminEntityDetailHero: FunctionComponent<Props> = ({
  name,
  avatarUrl,
  initials,
  statusLabel,
  chips,
  avatarAlt,
}) => {
  const [failed, setFailed] = useState(false);
  const resolvedAvatar = avatarUrl?.trim();
  const showImage = Boolean(resolvedAvatar) && !failed;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: easePremium }}
      className="admin-student-detail-hero"
    >
      <div className="admin-student-detail-hero__mesh admin-student-detail-hero__mesh--primary" aria-hidden />
      <div className="admin-student-detail-hero__mesh admin-student-detail-hero__mesh--secondary" aria-hidden />
      <div className="admin-student-detail-hero__shine" aria-hidden />

      <div className="admin-student-detail-hero__inner">
        <div
          className={`admin-student-detail-hero__avatar${showImage ? ' admin-student-detail-hero__avatar--photo' : ''}`}
        >
          {showImage ? (
            <img
              src={resolvedAvatar!}
              alt={avatarAlt ?? (name ? `Photo de ${name}` : 'Photo')}
              className="admin-student-detail-hero__avatar-img"
              onError={() => setFailed(true)}
              loading="lazy"
              referrerPolicy="no-referrer"
            />
          ) : (
            <span className="admin-student-detail-hero__avatar-fallback" aria-hidden>
              {initials}
            </span>
          )}
        </div>

        <div className="admin-student-detail-hero__copy min-w-0">
          <p className="admin-student-detail-hero__name">{name}</p>

          <div className="admin-student-detail-hero__chips">
            {chips.map((chip) => (
              <span key={`${chip.label}-${chip.icon.displayName ?? chip.label}`} className="admin-student-detail-hero__chip">
                <chip.icon className="h-3 w-3 shrink-0 opacity-70" strokeWidth={2} aria-hidden />
                <span className="truncate">{chip.label}</span>
              </span>
            ))}
          </div>

          {statusLabel ? (
            <span className="admin-student-detail-hero__status">{statusLabel}</span>
          ) : null}
        </div>
      </div>
    </motion.div>
  );
};

export default AdminEntityDetailHero;
