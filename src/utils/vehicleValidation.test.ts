import { describe, it, expect } from 'vitest';
import { validateVehicleNumber, sanitizeVehicleInput } from './vehicleValidation';

describe('Indian Vehicle Number Plate Validation', () => {
  describe('Positive Test Cases (Valid Formats)', () => {
    it('should validate Standard 2-letter series (MH12AB1234)', () => {
      expect(validateVehicleNumber('MH12AB1234')).toBe(true);
    });

    it('should validate Delhi specific category layout (DL3CCE1234)', () => {
      expect(validateVehicleNumber('DL3CCE1234')).toBe(true);
    });

    it('should validate Metropolitan 3-letter expansion (MH12AAA1234)', () => {
      expect(validateVehicleNumber('MH12AAA1234')).toBe(true);
    });

    it('should validate Bharat Series (26BH1234AB)', () => {
      expect(validateVehicleNumber('26BH1234AB')).toBe(true);
    });

    it('should validate Armed Forces / Military format (↑26A123456X)', () => {
      expect(validateVehicleNumber('↑26A123456X')).toBe(true);
    });

    it('should validate Diplomatic Corps Envoy (11CD21)', () => {
      expect(validateVehicleNumber('11CD21')).toBe(true);
    });

    it('should validate Vintage Historic Allocation (MHVAYY1234)', () => {
      expect(validateVehicleNumber('MHVAYY1234')).toBe(true);
    });

    it('should validate Trade Certificate / Temp showroom plates (MH12TC45)', () => {
      expect(validateVehicleNumber('MH12TC45')).toBe(true);
    });

    it('should validate variations with spaces between structural blocks', () => {
      expect(validateVehicleNumber('MH 12 AB 1234')).toBe(true);
      expect(validateVehicleNumber('26 BH 1234 AB')).toBe(true);
      expect(validateVehicleNumber('↑ 26 A 123456 X')).toBe(true);
      expect(validateVehicleNumber('11 CD 21')).toBe(true);
    });
  });

  describe('Negative Test Cases (Invalid Formats)', () => {
    it('should reject non-Indian patterns (ABC1234)', () => {
      expect(validateVehicleNumber('ABC1234')).toBe(false);
    });

    it('should reject malformed standard pattern with too many numbers (MH123A12345)', () => {
      expect(validateVehicleNumber('MH123A12345')).toBe(false);
    });

    it('should reject incomplete formats (MH12)', () => {
      expect(validateVehicleNumber('MH12')).toBe(false);
    });

    it('should reject standard pattern with missing suffix digits (MH12AB123)', () => {
      expect(validateVehicleNumber('MH12AB123')).toBe(false);
    });

    it('should reject empty strings', () => {
      expect(validateVehicleNumber('')).toBe(false);
    });
  });

  describe('Sanitization Logic', () => {
    it('should convert all characters to uppercase', () => {
      expect(sanitizeVehicleInput('mh12ab1234')).toBe('MH12AB1234');
    });

    it('should strip leading spaces but keep spaces between blocks', () => {
      expect(sanitizeVehicleInput('   MH 12 AB 1234')).toBe('MH 12 AB 1234');
    });

    it('should convert to uppercase and strip leading spaces simultaneously', () => {
      expect(sanitizeVehicleInput('  mh 12 ab 1234')).toBe('MH 12 AB 1234');
    });
  });
});
