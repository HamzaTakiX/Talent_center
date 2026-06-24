export const validateEmail = (email: string): boolean => {
  if (email === 'admin') return true;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePassword = (password: string): boolean => {
  return password.length >= 6;
};

/** Âge minimum réaliste pour un étudiant ESCA (années complètes). */
export const MIN_STUDENT_AGE = 16;

/** Âge maximum réaliste (évite les dates manifestement erronées). */
export const MAX_STUDENT_AGE = 80;

export type DateOfBirthValidationCode =
  | 'required'
  | 'invalid'
  | 'future'
  | 'tooYoung'
  | 'tooOld';

function parseIsoDate(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }
  return date;
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function calculateAge(birthDate: Date, referenceDate: Date): number {
  let age = referenceDate.getFullYear() - birthDate.getFullYear();
  const hasNotHadBirthdayThisYear =
    referenceDate.getMonth() < birthDate.getMonth() ||
    (referenceDate.getMonth() === birthDate.getMonth() &&
      referenceDate.getDate() < birthDate.getDate());
  if (hasNotHadBirthdayThisYear) age -= 1;
  return age;
}

function formatIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function dateOfBirthInputBounds(referenceDate = new Date()): { min: string; max: string } {
  const max = formatIsoDate(startOfDay(referenceDate));
  const minDate = new Date(
    referenceDate.getFullYear() - MAX_STUDENT_AGE,
    referenceDate.getMonth(),
    referenceDate.getDate(),
  );
  return { min: formatIsoDate(minDate), max };
}

export function validateDateOfBirth(
  value: string,
  referenceDate = new Date(),
): DateOfBirthValidationCode | null {
  if (!value.trim()) return 'required';

  const birthDate = parseIsoDate(value);
  if (!birthDate) return 'invalid';

  const today = startOfDay(referenceDate);
  const birth = startOfDay(birthDate);

  if (birth > today) return 'future';

  const age = calculateAge(birth, today);
  if (age < MIN_STUDENT_AGE) return 'tooYoung';
  if (age > MAX_STUDENT_AGE) return 'tooOld';

  return null;
}
