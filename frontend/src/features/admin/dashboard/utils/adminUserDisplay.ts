import type { User } from '../../../auth/types';

/** Libellé affiché dans l’interface admin (navbar, sidebar). */
export const getAdminRoleLabel = (role?: string | null): string => {
  const normalized = (role ?? '').toLowerCase().trim();

  if (normalized === 'encadrant' || normalized === 'supervisor') {
    return 'Encadrant';
  }

  if (
    normalized === 'admin' ||
    normalized === 'super_admin' ||
    normalized === 'superadmin' ||
    normalized === 'super admin' ||
    normalized === 'administrator' ||
    normalized === 'staff' ||
    normalized.includes('admin')
  ) {
    return 'Super Admin';
  }

  return 'Super Admin';
};

export const getAdminDisplayName = (user: User | null | undefined): string => {
  if (!user) return '';
  if (user.full_name?.trim()) return user.full_name.trim();
  const profile = user.profile;
  if (profile) {
    const fromProfile = `${profile.first_name ?? ''} ${profile.last_name ?? ''}`.trim();
    if (fromProfile) return fromProfile;
  }
  return user.email;
};

export const getAdminUserInitials = (displayName: string, email?: string | null): string => {
  const trimmed = displayName.trim();
  const parts = trimmed.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase();
  }
  if (parts.length === 1 && parts[0].length >= 2) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  if (email) {
    const local = email.split('@')[0] ?? '';
    if (local.length >= 2) return local.slice(0, 2).toUpperCase();
  }
  return trimmed.slice(0, 2).toUpperCase() || 'AD';
};

export const resolveAvatarUrl = (avatar?: string | null): string | null => {
  if (!avatar) return null;
  if (avatar.startsWith('http') || avatar.startsWith('data:') || avatar.startsWith('blob:')) {
    return avatar;
  }
  if (avatar.startsWith('/')) return avatar;
  return `/media/${avatar.replace(/^\/+/, '')}`;
};

export const splitFullName = (fullName: string): { first_name: string; last_name: string } => {
  const trimmed = fullName.trim();
  if (!trimmed) return { first_name: '', last_name: '' };
  const spaceIndex = trimmed.indexOf(' ');
  if (spaceIndex === -1) return { first_name: trimmed, last_name: '' };
  return {
    first_name: trimmed.slice(0, spaceIndex),
    last_name: trimmed.slice(spaceIndex + 1).trim(),
  };
};

export const formatAccountDate = (iso?: string | null, locale = 'fr-FR'): string => {
  if (!iso) return '—';
  try {
    return new Intl.DateTimeFormat(locale, {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(iso));
  } catch {
    return '—';
  }
};
