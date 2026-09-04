/** Stable human portraits for AI interviewers (same source as other student mocks). */
const INTERVIEWER_AVATARS: Record<string, string> = {
  Nadia: 'https://randomuser.me/api/portraits/women/65.jpg',
  Salma: 'https://randomuser.me/api/portraits/women/44.jpg',
  Meryem: 'https://randomuser.me/api/portraits/women/68.jpg',
  Leila: 'https://randomuser.me/api/portraits/women/33.jpg',
  Youssef: 'https://randomuser.me/api/portraits/men/32.jpg',
  Karim: 'https://randomuser.me/api/portraits/men/75.jpg',
  Amine: 'https://randomuser.me/api/portraits/men/52.jpg',
  Samir: 'https://randomuser.me/api/portraits/men/11.jpg',
};

const FALLBACK_BY_GENDER = {
  female: 'https://randomuser.me/api/portraits/women/65.jpg',
  male: 'https://randomuser.me/api/portraits/men/32.jpg',
} as const;

export function interviewerAvatarUrl(
  name: string,
  gender: 'female' | 'male' = 'female',
): string {
  const key = name.trim();
  return INTERVIEWER_AVATARS[key] ?? FALLBACK_BY_GENDER[gender];
}

export function interviewerInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0] ?? '')
    .join('')
    .slice(0, 2)
    .toUpperCase();
}
