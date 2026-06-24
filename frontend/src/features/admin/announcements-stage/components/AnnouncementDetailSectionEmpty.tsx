import { FunctionComponent, type LucideIcon } from 'react';

interface Props {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  accent?: string;
}

const AnnouncementDetailSectionEmpty: FunctionComponent<Props> = ({
  icon: Icon,
  title,
  subtitle,
  accent = 'var(--admin-brand)',
}) => (
  <div className="admin-ann-detail-section-empty" role="status">
    <div
      className="admin-ann-detail-section-empty__icon"
      style={{
        color: accent,
        borderColor: `color-mix(in srgb, ${accent} 24%, var(--admin-border))`,
        background: `color-mix(in srgb, ${accent} 10%, var(--admin-bg-elevated))`,
      }}
      aria-hidden
    >
      <Icon className="h-5 w-5" strokeWidth={1.65} />
    </div>
    <p className="admin-ann-detail-section-empty__title">{title}</p>
    {subtitle ? <p className="admin-ann-detail-section-empty__subtitle">{subtitle}</p> : null}
  </div>
);

export default AnnouncementDetailSectionEmpty;
