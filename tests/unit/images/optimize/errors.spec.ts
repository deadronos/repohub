import { describe, it, expect } from 'vitest';
import { ImageOptimizationError } from '@/utils/images/optimize/errors';

describe('ImageOptimizationError', () => {
  it('instantiates correctly with code and message', () => {
    const error = new ImageOptimizationError('not-image', 'Not an image');
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(ImageOptimizationError);
    expect(error.code).toBe('not-image');
    expect(error.message).toBe('Not an image');
  });
});
