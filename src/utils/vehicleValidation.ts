// Master regex for Indian license plates adjusted to allow single-digit RTO codes (e.g. DL3CCE1234)
export const INDIAN_VEHICLE_REGEX = /^(?:[A-Z]{2}\s?\d{1,2}\s?(?:[A-Z]{1,3}|[A-Z]{2}\s?[A-Z]{1,2})\s?\d{4}|[0-9]{2}\s?BH\s?\d{4}\s?[A-Z]{2}|↑\s?\d{2}\s?[A-Z]\s?\d{6}\s?[A-Z]|\d{1,3}\s?(?:CD|CC|UN)\s?\d{1,4}|[A-Z]{2}\s?VA\s?[A-Z]{2}\s?\d{4}|[A-Z]{2}\s?\d{1,2}\s?(?:T|TC)\s?\d{1,4})$/;

/**
 * Validates whether the given string conforms to MoRTH standards for Indian license plates.
 */
export function validateVehicleNumber(value: string): boolean {
  return INDIAN_VEHICLE_REGEX.test(value);
}

/**
 * Sanitizes input values dynamically during typing.
 * Converts to uppercase and strips leading spaces.
 */
export function sanitizeVehicleInput(value: string): string {
  return value.replace(/^\s+/, '').toUpperCase();
}
