/** Mappe les classes Tailwind legacy vers les teintes KPI du design system. */
const BG_CLASS_TONES: Record<string, { accent: string; bg: string }> = {
  'bg-[#2b7fff]': { accent: '#2563eb', bg: 'rgba(37, 99, 235, 0.1)' },
  'bg-[#22c55e]': { accent: '#059669', bg: 'rgba(5, 150, 105, 0.1)' },
  'bg-[#fb2c36]': { accent: '#dc2626', bg: 'rgba(220, 38, 38, 0.1)' },
  'bg-[#eab308]': { accent: '#d97706', bg: 'rgba(217, 119, 6, 0.1)' },
  'bg-[#6b7280]': { accent: '#64748b', bg: 'rgba(100, 116, 139, 0.12)' },
  'bg-[#8b5cf6]': { accent: '#7c3aed', bg: 'rgba(124, 58, 237, 0.1)' },
  'bg-[#6366f1]': { accent: '#4f46e5', bg: 'rgba(79, 70, 229, 0.1)' },
  'bg-[#06b6d4]': { accent: '#0891b2', bg: 'rgba(8, 145, 178, 0.1)' },
  'bg-[#a855f7]': { accent: '#7c3aed', bg: 'rgba(124, 58, 237, 0.1)' },
  'bg-[#f97316]': { accent: '#ea580c', bg: 'rgba(234, 88, 12, 0.1)' },
  'bg-[#ec4899]': { accent: '#db2777', bg: 'rgba(236, 72, 153, 0.1)' },
  'bg-[#ef4444]': { accent: '#dc2626', bg: 'rgba(220, 38, 38, 0.1)' },
  'bg-[#dc2626]': { accent: '#dc2626', bg: 'rgba(220, 38, 38, 0.1)' },
  'bg-[#f43f5e]': { accent: '#e11d48', bg: 'rgba(244, 63, 94, 0.1)' },
  'bg-[#14b8a6]': { accent: '#0d9488', bg: 'rgba(13, 148, 136, 0.1)' },
  'bg-[#84cc16]': { accent: '#65a30d', bg: 'rgba(101, 163, 13, 0.1)' },
  'bg-[#d946ef]': { accent: '#c026d3', bg: 'rgba(192, 38, 211, 0.1)' },
  'bg-[#dbeafe]': { accent: '#2563eb', bg: 'rgba(37, 99, 235, 0.1)' },
};

export function tonesFromBgClass(iconBgClass: string): { accent: string; bg: string } {
  return (
    BG_CLASS_TONES[iconBgClass] ?? {
      accent: 'var(--admin-brand)',
      bg: 'var(--admin-brand-muted)',
    }
  );
}

export const ACTION_BADGE_CLASS: Record<string, string> = {
  validate: 'admin-badge admin-badge--success',
  validated: 'admin-badge admin-badge--success',
  update: 'admin-badge admin-badge--info',
  create: 'admin-badge admin-badge--success',
  delete: 'admin-badge admin-badge--danger',
};
