import { describe, it, expect } from 'vitest';
import { computeDownscaledDimensions } from '@/utils/images/optimize/resize';

describe('computeDownscaledDimensions', () => {
  it('returns original dimensions if smaller than maxDimension', () => {
    expect(computeDownscaledDimensions(100, 200, 500)).toEqual({ width: 100, height: 200 });
  });

  it('returns original dimensions if longest side equals maxDimension', () => {
    expect(computeDownscaledDimensions(500, 200, 500)).toEqual({ width: 500, height: 200 });
    expect(computeDownscaledDimensions(200, 500, 500)).toEqual({ width: 200, height: 500 });
  });

  it('downscales proportionally when width is the longest side', () => {
    // scale = 500 / 1000 = 0.5
    expect(computeDownscaledDimensions(1000, 800, 500)).toEqual({ width: 500, height: 400 });
  });

  it('downscales proportionally when height is the longest side', () => {
    // scale = 500 / 1000 = 0.5
    expect(computeDownscaledDimensions(800, 1000, 500)).toEqual({ width: 400, height: 500 });
  });

  it('rounds downscaled dimensions', () => {
    // scale = 500 / 999 ≈ 0.5005
    // width: 999 * (500 / 999) = 500
    // height: 400 * (500 / 999) = 200.2 -> 200
    expect(computeDownscaledDimensions(999, 400, 500)).toEqual({ width: 500, height: 200 });
  });

  it('ensures minimum dimension of 1', () => {
    // extreme downscaling:
    // scale = 100 / 2000 = 0.05
    // width: 10 * 0.05 = 0.5 -> 1
    expect(computeDownscaledDimensions(10, 2000, 100)).toEqual({ width: 1, height: 100 });
    // width: 5 * 0.05 = 0.25 -> 0, but forced to 1
    expect(computeDownscaledDimensions(5, 2000, 100)).toEqual({ width: 1, height: 100 });
  });
});
