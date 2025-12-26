import { describe, it, expect, vi, afterEach } from 'vitest';
import { applyParticleFrame, generateParticles } from '@/utils/particles';

describe('particles utils', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('generateParticles', () => {
    it('returns two Float32Arrays with expected length', () => {
      const [positions, initial] = generateParticles(3);
      expect(positions).toBeInstanceOf(Float32Array);
      expect(initial).toBeInstanceOf(Float32Array);
      expect(positions.length).toBe(9);
      expect(initial.length).toBe(9);
    });

    it('handles count=0 (bad/edge case) by returning empty arrays', () => {
      const [positions, initial] = generateParticles(0);
      expect(positions.length).toBe(0);
      expect(initial.length).toBe(0);
    });

    it('normalizes non-finite and negative counts (bad/edge cases)', () => {
      expect(generateParticles(-1)[0].length).toBe(0);
      expect(generateParticles(Number.NaN)[0].length).toBe(0);
      expect(generateParticles(Number.POSITIVE_INFINITY)[0].length).toBe(0);
    });

    it('copies initial positions exactly', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.5);
      const [positions, initial] = generateParticles(2);
      expect(Array.from(positions)).toEqual(Array.from(initial));
      expect(Array.from(positions)).toEqual([0, 0, 0, 0, 0, 0]);
    });
  });

  describe('applyParticleFrame', () => {
    it('moves particles downward and wraps when below -25', () => {
      const particlePositions = new Float32Array([0, -25.01, 0]);
      const initialPositions = new Float32Array([0, 0, 0]);

      applyParticleFrame(particlePositions, initialPositions, 0, 0, 0, 1);

      expect(particlePositions[1]).toBe(25);
    });

    it('applies pointer influence and returns rotations', () => {
      const particlePositions = new Float32Array([1, 0, 0]);
      const initialPositions = new Float32Array([1, 0, 0]);

      const result = applyParticleFrame(particlePositions, initialPositions, 1, -2, 0, 1);

      expect(particlePositions[0]).toBeCloseTo(1 + 0.05, 6);
      expect(particlePositions[1]).toBeCloseTo(-0.02, 6);
      expect(result.rotationX).toBeCloseTo(0.2, 6);
      expect(result.rotationY).toBeCloseTo(0.1, 6);
    });

    it('does not throw when particleCount exceeds array size (bad/edge case)', () => {
      const particlePositions = new Float32Array([0, 0, 0]);
      const initialPositions = new Float32Array([0, 0, 0]);

      expect(() =>
        applyParticleFrame(particlePositions, initialPositions, 0, 0, 0, 5000),
      ).not.toThrow();
    });
  });
});
