import { describe, it, expect } from 'vitest';
import { validateEmail } from './emailValidation';

describe('Email Address Validation', () => {
  describe('Positive Test Cases (Valid Formats)', () => {
    it('should validate standard email (user@example.com)', () => {
      expect(validateEmail('user@example.com')).toBe(true);
    });

    it('should validate subdomain emails (user@sub.example.com)', () => {
      expect(validateEmail('user@sub.example.com')).toBe(true);
    });

    it('should validate email with plus/digits/symbols in local part (user.name+tag@example.com)', () => {
      expect(validateEmail('user.name+tag@example.com')).toBe(true);
    });

    it('should validate numeric local part (123456@example.com)', () => {
      expect(validateEmail('123456@example.com')).toBe(true);
    });
  });

  describe('Negative Test Cases (Invalid Formats)', () => {
    it('should reject email missing local part (@example.com)', () => {
      expect(validateEmail('@example.com')).toBe(false);
    });

    it('should reject email missing domain (user@)', () => {
      expect(validateEmail('user@')).toBe(false);
    });

    it('should reject email missing @ symbol (userexample.com)', () => {
      expect(validateEmail('userexample.com')).toBe(false);
    });

    it('should reject plain username (bgil.admin)', () => {
      expect(validateEmail('bgil.admin')).toBe(false);
    });

    it('should reject email with spaces (user @example.com)', () => {
      expect(validateEmail('user @example.com')).toBe(false);
    });

    it('should reject empty strings', () => {
      expect(validateEmail('')).toBe(false);
    });
  });
});
