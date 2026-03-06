import { describe, expect, it } from 'vitest';
import { getProjectImageStoragePath } from '@/utils/projects/storage-helpers';

describe('project storage helpers', () => {
  it('extracts the storage path from a public Supabase image URL', () => {
    expect(
      getProjectImageStoragePath(
        'https://demo.supabase.co/storage/v1/object/public/projects/171000-cover.png',
      ),
    ).toBe('171000-cover.png');
  });

  it('decodes nested storage paths from public Supabase image URLs', () => {
    expect(
      getProjectImageStoragePath(
        'https://demo.supabase.co/storage/v1/object/public/projects/folder%2Fhero%20image.png',
      ),
    ).toBe('folder/hero image.png');
  });

  it('returns null for non-project or invalid URLs', () => {
    expect(getProjectImageStoragePath('https://example.com/image.png')).toBeNull();
    expect(getProjectImageStoragePath('/local-only-image.png')).toBeNull();
  });
});
