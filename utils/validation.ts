import { safeParseUrl } from '@/utils/url';

export function isValidUrl(url: string): boolean {
  const parsed = safeParseUrl(url);
  if (!parsed) return false;
  return ['http:', 'https:'].includes(parsed.protocol);
}
