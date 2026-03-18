import { createClient, type SupabaseClient } from '@supabase/supabase-js';

function hasConfiguredSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

  if (!url || !key) {
    return false;
  }

  if (url === 'https://your-project.supabase.co' || key === 'your-publishable-key') {
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
