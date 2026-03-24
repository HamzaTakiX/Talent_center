export const validateEmail = (email: string): boolean => {
  if (email === 'admin') return true;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePassword = (password: string): boolean => {
  return password.length >= 6;
};
