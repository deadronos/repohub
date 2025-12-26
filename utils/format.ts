export type FormatNumberOptions = {
  locale?: string;
};

export type FormatDateOptions = {
  locale?: string;
  timeZone?: string;
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
