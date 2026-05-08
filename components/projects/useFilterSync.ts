'use client';

import { useEffect, useCallback } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';

export function useFilterSync(activeTags: Set<string>) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const updateUrl = useCallback(
    (tags: Set<string>) => {
      const params = new URLSearchParams(searchParams.toString());

      params.delete('tag');
      for (const tag of tags) {
        params.append('tag', tag);
      }

      const queryString = params.toString();
      const newUrl = queryString ? `${pathname}?${queryString}` : pathname;

      router.replace(newUrl, { scroll: false });
    },
    [searchParams, pathname, router],
  );

  useEffect(() => {
    updateUrl(activeTags);
  }, [activeTags, updateUrl]);

  return null;
}