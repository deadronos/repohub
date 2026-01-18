export type FormatNumberOptions = {
  locale?: string;
};

export type FormatDateOptions = {
  locale?: string;
  timeZone?: string;
};

export type FormatBytesOptions = {
  base?: 1000 | 1024;
  decimalsMb?: number;
};

export function formatNumber(value: number, options: FormatNumberOptions = {}): string {
  const { locale = 'en-US' } = options;

  if (!Number.isFinite(value)) {
    return '';
  }

  return value.toLocaleString(locale);
}

export function formatDate(value: string | number | Date, options: FormatDateOptions = {}): string {
  const { locale = 'en-US', timeZone } = options;

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const dateTimeOptions: Intl.DateTimeFormatOptions | undefined = timeZone
    ? { timeZone }
    : undefined;

  return date.toLocaleDateString(locale, dateTimeOptions);
}

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
