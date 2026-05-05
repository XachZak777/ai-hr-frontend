export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$/;
export const PHONE_REGEX = /^[+\d][\d\s\-().]{5,}$/;
export const URL_REGEX = /^https?:\/\/.{3,}/;
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

// Returns true if empty (field is optional) or if the format is valid
export function validatePhone(phone) {
  return !phone.trim() || PHONE_REGEX.test(phone.trim());
}

// Returns true if empty (field is optional) or if it starts with http(s)://
export function validateUrl(url) {
  return !url.trim() || URL_REGEX.test(url.trim());
}

export function validateRequired(value) {
  return typeof value === 'string' ? value.trim().length > 0 : Boolean(value);
}

export function validateMinLength(value, min) {
  return value.trim().length >= min;
}
