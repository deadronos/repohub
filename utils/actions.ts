export type ActionResult<T> = { data: T } | { error: string };

export function getActionError(result: unknown): string | null {
  if (!result || typeof result !== 'object') {
    return null;
  }

  if (!('error' in result)) {
    return null;
  }

  const errorValue = (result as { error?: unknown }).error;
  return typeof errorValue === 'string' ? errorValue : null;
}

export const formatError = (error: unknown, fallback = 'Failed'): string => {
  if (process.env.NODE_ENV !== 'production' && error && typeof error === 'object') {
    const message = (error as Record<string, unknown>).message;
    if (typeof message === 'string' && message.trim().length > 0) {
      return message;
    }
  }

  return fallback;
};
