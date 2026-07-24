export const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

/**
 * Validates whether the given string conforms to standard email format.
 */
export function validateEmail(value: string): boolean {
  return EMAIL_REGEX.test(value);
}
