'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';

export function useFilterSync(
  activeTags: Set<string>,
  setActiveTags: (tags: Set<string>) => void,
  availableTags: string[] = [],
) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const hasInitializedRef = useRef(false);

  const validTagMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const tag of availableTags) {
      map.set(tag.toLowerCase(), tag);
    }
    return map;
  }, [availableTags]);

  useEffect(() => {
    if (!hasInitializedRef.current) {
      hasInitializedRef.current = true;
      const urlTags = new Set<string>();
      for (const rawTag of searchParams.getAll('tag')) {
        const canonical = validTagMap.get(rawTag.toLowerCase());
        if (canonical) {
          urlTags.add(canonical);
        }
      }

      if (urlTags.size > 0) {
        setActiveTags(urlTags);
        return;
      }
    }

    const currentQueryString = searchParams.toString();
    const params = new URLSearchParams(currentQueryString);

    params.delete('tag');
    for (const tag of activeTags) {
      params.append('tag', tag);
    }

    const nextQueryString = params.toString();
    if (nextQueryString !== currentQueryString) {
      const newUrl = nextQueryString ? `${pathname}?${nextQueryString}` : pathname;
      router.replace(newUrl, { scroll: false });
    }
  }, [activeTags, pathname, router, searchParams, setActiveTags, validTagMap]);

  return null;
}
