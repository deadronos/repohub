import { createClient, type SupabaseClient } from '@supabase/supabase-js';

function hasConfiguredSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

  if (!url || !key) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(
        '[RepoHub] Supabase env vars not set. Static client will return null.\n' +
        '  Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY in .env.local',
      );
    }
    return false;
  }

  if (url === 'https://your-project.supabase.co' || key === 'your-publishable-key') {
    if (process.env.NODE_ENV === 'development') {
      console.warn(
        '[RepoHub] Supabase env vars appear to be placeholder values. Static client will return null.',
      );
    }
    return false;
  }

  try {
    const parsedUrl = new URL(url);
    return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
  } catch {
    return false;
  }
}

export function createStaticClient(): SupabaseClient | null {
  if (!hasConfiguredSupabaseEnv()) {
    return null;
  }

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
  );
}
