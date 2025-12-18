import { describe, it, expect } from 'vitest';
import { buildProjectOrderUpdates, validateProjectOrder } from '@/utils/projects/order';

describe('Project Order Utils', () => {
  describe('buildProjectOrderUpdates', () => {
    it('assigns ascending sort_order values', () => {
      expect(buildProjectOrderUpdates(['a', 'b', 'c'])).toEqual([
        { id: 'a', sort_order: 1 },
        { id: 'b', sort_order: 2 },
        { id: 'c', sort_order: 3 },
      ]);
    });

    it('supports a custom start value', () => {
      expect(buildProjectOrderUpdates(['x', 'y'], 10)).toEqual([
        { id: 'x', sort_order: 10 },
        { id: 'y', sort_order: 11 },
      ]);
    });
  });

  describe('validateProjectOrder', () => {
    it('rejects empty payloads', () => {
      expect(validateProjectOrder([])).toBe('No projects provided for ordering');
    });

    it('rejects duplicate ids', () => {
      expect(validateProjectOrder(['a', 'a'])).toBe('Project order contains duplicate ids');
    });

    it('accepts unique ids', () => {
      expect(validateProjectOrder(['a', 'b'])).toBeNull();
    });
  });
});
