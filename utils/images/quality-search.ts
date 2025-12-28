export type QualitySearchOptions = {
  minQuality: number;
  maxQuality: number;
  maxBytes: number;
  steps: number;
};

export type SizedValue = {
  size: number;
};

export type EncodeAtQuality<T extends SizedValue> = (quality: number) => Promise<T>;

export async function findBestQualityUnderBytes<T extends SizedValue>(
  encode: EncodeAtQuality<T>,
  options: QualitySearchOptions,
): Promise<{ value: T; quality: number } | null> {
  const { minQuality, maxQuality, maxBytes, steps } = options;

  if (!Number.isFinite(minQuality) || !Number.isFinite(maxQuality) || !Number.isFinite(maxBytes)) {
    return null;
  }

  if (steps <= 0) {
    return null;
  }

  const min = Math.max(0, Math.min(1, minQuality));
  const max = Math.max(0, Math.min(1, maxQuality));

  const lowInit = Math.min(min, max);
  const highInit = Math.max(min, max);

  let low = lowInit;
  let high = highInit;
  let best: { value: T; quality: number } | null = null;

  for (let attempt = 0; attempt < steps; attempt += 1) {
    const quality = (low + high) / 2;
    const value = await encode(quality);

    if (value.size <= maxBytes) {
      best = { value, quality };
      low = quality;
      continue;
    }

    high = quality;
  }

  return best;
}
