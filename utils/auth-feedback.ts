export const LOGIN_FEEDBACK_MESSAGE =
  "We couldn't sign you in. Check your email and password and try again.";

const LEGACY_LOGIN_FEEDBACK_MESSAGES = new Set([
  'could not authenticate user',
  'invalid login credentials',
]);

export function normalizeLoginFeedback(message: string | string[] | undefined) {
  const value = Array.isArray(message) ? message[0] : message;
  const normalized = value?.trim();

  if (!normalized) {
    return null;
  }

  if (LEGACY_LOGIN_FEEDBACK_MESSAGES.has(normalized.toLowerCase())) {
    return LOGIN_FEEDBACK_MESSAGE;
  }

  return normalized;
}
