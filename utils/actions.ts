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
