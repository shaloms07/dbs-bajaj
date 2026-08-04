import { describe, expect, it } from 'vitest';
import { formatDateTime, parseUtcDate } from '../pages/TM100Telemetry';

describe('TM100Telemetry Date & Timezone Utilities', () => {
  describe('parseUtcDate', () => {
    it('returns null for null, empty or invalid strings', () => {
      expect(parseUtcDate(null)).toBeNull();
      expect(parseUtcDate('')).toBeNull();
      expect(parseUtcDate('   ')).toBeNull();
      expect(parseUtcDate('invalid-date')).toBeNull();
    });

    it('parses ISO UTC strings ending with Z', () => {
      const date = parseUtcDate('2026-06-13T15:20:58Z');
      expect(date).not.toBeNull();
      expect(date!.getUTCFullYear()).toBe(2026);
      expect(date!.getUTCMonth()).toBe(5); // June (0-indexed)
      expect(date!.getUTCDate()).toBe(13);
      expect(date!.getUTCHours()).toBe(15);
      expect(date!.getUTCMinutes()).toBe(20);
      expect(date!.getUTCSeconds()).toBe(58);
    });

    it('parses UTC strings without Z suffix by appending Z', () => {
      const date = parseUtcDate('2026-06-13T15:20:58');
      expect(date).not.toBeNull();
      expect(date!.getUTCHours()).toBe(15);
      expect(date!.getUTCMinutes()).toBe(20);
    });

    it('parses space-separated UTC strings without Z', () => {
      const date = parseUtcDate('2026-06-13 15:20:58');
      expect(date).not.toBeNull();
      expect(date!.getUTCHours()).toBe(15);
      expect(date!.getUTCMinutes()).toBe(20);
    });

    it('preserves existing timezone offset if provided', () => {
      const date = parseUtcDate('2026-06-13T15:20:58+05:30');
      expect(date).not.toBeNull();
      expect(date!.getUTCHours()).toBe(9);
      expect(date!.getUTCMinutes()).toBe(50);
    });
  });

  describe('formatDateTime', () => {
    it('formats UTC time to Asia/Kolkata (IST) time correctly (+5h 30m shift)', () => {
      // 15:20 UTC -> 20:50 IST
      const formatted = formatDateTime('2026-06-13 15:20:58');
      expect(formatted).toContain('13 Jun 2026');
      expect(formatted).toContain('08:50'); // 15:20 in 12-hour format is 08:50 pm
    });

    it('returns N/A for empty or null dates', () => {
      expect(formatDateTime(null)).toBe('N/A');
      expect(formatDateTime('')).toBe('N/A');
    });
  });
});
