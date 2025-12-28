export type FormatBytesOptions = {
  base?: 1000 | 1024;
  decimalsMb?: number;
};

export function formatBytes(value: number, options: FormatBytesOptions = {}): string {
  const { base = 1000, decimalsMb = 1 } = options;

  if (!Number.isFinite(value) || value < 0) {
    return '';
  }

  if (value < base) {
    return `${Math.round(value)} B`;
  }

  if (value < base * base) {
    return `${Math.round(value / base)} KB`;
  }

  return `${(value / (base * base)).toFixed(decimalsMb)} MB`;
}
