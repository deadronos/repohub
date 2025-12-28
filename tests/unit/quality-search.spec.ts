import { describe, it, expect } from 'vitest';
import { findBestQualityUnderBytes } from '@/utils/images/quality-search';

describe('findBestQualityUnderBytes', () => {
  it('returns the highest quality that fits under maxBytes', async () => {
    const encode = (quality: number) => Promise.resolve({ size: Math.ceil(quality * 1000) });

    const result = await findBestQualityUnderBytes(encode, {
      minQuality: 0.55,
      maxQuality: 0.85,
      maxBytes: 800,
      steps: 10,
    });

    expect(result).not.toBeNull();
    expect(result?.value.size).toBeLessThanOrEqual(800);
    expect(result?.quality).toBeGreaterThan(0.79);
    expect(result?.quality).toBeLessThanOrEqual(0.8);
  });

  it('returns null when even the lowest quality is too large', async () => {
    const encode = (quality: number) =>
      Promise.resolve({ size: 900 + Math.round(quality * 50) });

    const result = await findBestQualityUnderBytes(encode, {
      minQuality: 0.55,
      maxQuality: 0.85,
      maxBytes: 800,
      steps: 8,
    });

    expect(result).toBeNull();
  });

  it('returns null for invalid search options', async () => {
    const encode = () => Promise.resolve({ size: 1 });

    expect(
      await findBestQualityUnderBytes(encode, {
        minQuality: 0.5,
        maxQuality: 0.8,
        maxBytes: 10,
        steps: 0,
      }),
    ).toBeNull();
  });
});
