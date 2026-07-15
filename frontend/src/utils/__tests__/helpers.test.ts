import { describe, it, expect } from 'vitest';
import { cn, timeAgo, getCrowdLevel } from '../helpers';

describe('Helper Utilities', () => {
  describe('cn()', () => {
    it('merges class names correctly', () => {
      expect(cn('px-2', 'py-1', { 'bg-red-500': true })).toBe('px-2 py-1 bg-red-500');
    });

    it('resolves tailwind conflicts', () => {
      expect(cn('p-4', 'p-8')).toBe('p-8');
      expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500');
    });
  });

  describe('timeAgo()', () => {
    it('returns "0s ago" for recent times', () => {
      const date = new Date().toISOString();
      expect(timeAgo(date)).toBe('0s ago');
    });

    it('returns minutes ago correctly', () => {
      const date = new Date(Date.now() - 5 * 60000).toISOString();
      expect(timeAgo(date)).toBe('5m ago');
    });
    
    it('handles invalid dates gracefully', () => {
      expect(timeAgo('invalid-date')).toBe('NaNd ago');
    });
  });

  describe('getCrowdLevel()', () => {
    it('identifies critical density', () => {
      expect(getCrowdLevel(95)).toBe('critical');
    });

    it('identifies safe density', () => {
      expect(getCrowdLevel(45)).toBe('safe');
    });
  });
});
