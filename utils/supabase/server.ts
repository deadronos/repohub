import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { cache } from 'react';

/**
 * Handles errors during cookie setting in Server Components.
 * This is expected behavior when Supabase tries to set cookies from a Server Component.
 */
function handleCookieSetError(error: unknown) {
  if (process.env.NODE_ENV === 'development') {
    console.warn(
      'Ignored Supabase cookie set attempt from Server Component (this is expected behavior in Server Components):',
      error,
    );
  }
}

export const createClient = cache(async () => {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch (error) {
            handleCookieSetError(error);
          }
        },
      },
    },
  );
});
