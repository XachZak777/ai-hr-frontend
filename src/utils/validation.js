export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$/;
export const VALID_USER_ROLES = ['employer', 'employee', 'admin'];

export const passwordHelpText = 'Password must be at least 8 characters and include uppercase, lowercase, number, and special character.';

export function validateEmail(email) {
  return EMAIL_REGEX.test(email.trim());
}

export function validatePassword(password) {
  return PASSWORD_REGEX.test(password);
}

export function validateUserRole(role) {
  return VALID_USER_ROLES.includes(role);
}
