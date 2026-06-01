import { afterEach, describe, expect, it, vi } from 'vitest';
import { PROJECTS_BUCKET, PROJECTS_TABLE } from '@/utils/projects/constants';

type StorageListResult = { data: Array<{ name: string; id: string | null }> | null; error: { message: string } | null };
type DbSelectResult = { data: Array<{ image_url: string | null }> | null; error: { message: string } | null };
type StorageRemoveResult = { data: Array<{ name: string }> | null; error: { message: string } | null };

interface FakeSupabaseOptions {
  storageList?: StorageListResult;
  dbSelect?: DbSelectResult;
  storageRemove?: StorageRemoveResult;
}

interface FakeSupabase {
  storage: { from: ReturnType<typeof vi.fn> };
  from: ReturnType<typeof vi.fn>;
  list: ReturnType<typeof vi.fn>;
  remove: ReturnType<typeof vi.fn>;
  select: ReturnType<typeof vi.fn>;
}

function makeFakeSupabase({
  storageList,
  dbSelect,
  storageRemove,
}: FakeSupabaseOptions = {}): FakeSupabase {
  const list = vi.fn().mockResolvedValue(
    storageList ?? { data: [], error: null },
  );
  const remove = vi.fn().mockResolvedValue(
    storageRemove ?? { data: [], error: null },
  );
  const select = vi.fn().mockResolvedValue(
    dbSelect ?? { data: [], error: null },
  );
  const storage = { from: vi.fn().mockReturnValue({ list, remove }) };
  const from = vi.fn().mockReturnValue({ select });
  return { storage, from, list, remove, select };
}

const PUBLIC_BASE = 'https://abc.supabase.co/storage/v1/object/public/projects';
const urlFor = (path: string) => `${PUBLIC_BASE}/${path}`;

describe('cleanupOrphanProjectImages', () => {
  afterEach(() => {
    vi.resetModules();
  });

  it('returns 0 deleted when the bucket is empty', async () => {
    const fake = makeFakeSupabase({ storageList: { data: [], error: null } });
    const { cleanupOrphanProjectImages } = await import('@/utils/projects/orphan-cleanup');

    const result = await cleanupOrphanProjectImages(fake as never);

    expect(result).toEqual({ deleted: 0, errors: [] });
    expect(fake.storage.from).toHaveBeenCalledWith(PROJECTS_BUCKET);
    expect(fake.list).toHaveBeenCalledTimes(1);
    expect(fake.from).not.toHaveBeenCalled();
    expect(fake.remove).not.toHaveBeenCalled();
  });

  it('returns 0 deleted when every file is referenced by a project', async () => {
    const fake = makeFakeSupabase({
      storageList: {
        data: [
          { name: '1700000000-a.jpg', id: 'id-1' },
          { name: '1700000001-b.png', id: 'id-2' },
        ],
        error: null,
      },
      dbSelect: {
        data: [
          { image_url: urlFor('1700000000-a.jpg') },
          { image_url: urlFor('1700000001-b.png') },
        ],
        error: null,
      },
    });
    const { cleanupOrphanProjectImages } = await import('@/utils/projects/orphan-cleanup');

    const result = await cleanupOrphanProjectImages(fake as never);

    expect(result).toEqual({ deleted: 0, errors: [] });
    expect(fake.remove).not.toHaveBeenCalled();
  });

  it('deletes only files that no project references', async () => {
    const fake = makeFakeSupabase({
      storageList: {
        data: [
          { name: '1700000000-a.jpg', id: 'id-1' },
          { name: '1700000001-b.png', id: 'id-2' },
          { name: '1700000002-orphan.webp', id: 'id-3' },
        ],
        error: null,
      },
      dbSelect: {
        data: [
          { image_url: urlFor('1700000000-a.jpg') },
          { image_url: urlFor('1700000001-b.png') },
        ],
        error: null,
      },
    });
    const { cleanupOrphanProjectImages } = await import('@/utils/projects/orphan-cleanup');

    const result = await cleanupOrphanProjectImages(fake as never);

    expect(result.deleted).toBe(1);
    expect(result.errors).toEqual([]);
    expect(fake.remove).toHaveBeenCalledWith(['1700000002-orphan.webp']);
  });

  it('ignores projects with null or empty image_url', async () => {
    const fake = makeFakeSupabase({
      storageList: {
        data: [{ name: '1700000000-a.jpg', id: 'id-1' }],
        error: null,
      },
      dbSelect: {
        data: [
          { image_url: null },
          { image_url: '' },
          { image_url: urlFor('1700000000-a.jpg') },
        ],
        error: null,
      },
    });
    const { cleanupOrphanProjectImages } = await import('@/utils/projects/orphan-cleanup');

    const result = await cleanupOrphanProjectImages(fake as never);

    expect(result).toEqual({ deleted: 0, errors: [] });
    expect(fake.remove).not.toHaveBeenCalled();
  });

  it('ignores image_url values that are not from the projects bucket', async () => {
    const fake = makeFakeSupabase({
      storageList: {
        data: [{ name: '1700000000-a.jpg', id: 'id-1' }],
        error: null,
      },
      dbSelect: {
        data: [
          { image_url: 'https://other-cdn.example.com/foo.jpg' },
          { image_url: 'not-a-url' },
          { image_url: urlFor('1700000000-a.jpg') },
        ],
        error: null,
      },
    });
    const { cleanupOrphanProjectImages } = await import('@/utils/projects/orphan-cleanup');

    const result = await cleanupOrphanProjectImages(fake as never);

    expect(result).toEqual({ deleted: 0, errors: [] });
    expect(fake.remove).not.toHaveBeenCalled();
  });

  it('skips folder entries returned by storage.list', async () => {
    const fake = makeFakeSupabase({
      storageList: {
        data: [
          { name: 'some-folder', id: null },
          { name: '1700000000-orphan.jpg', id: 'id-1' },
        ],
        error: null,
      },
      dbSelect: { data: [], error: null },
    });
    const { cleanupOrphanProjectImages } = await import('@/utils/projects/orphan-cleanup');

    const result = await cleanupOrphanProjectImages(fake as never);

    expect(result.deleted).toBe(1);
    expect(fake.remove).toHaveBeenCalledWith(['1700000000-orphan.jpg']);
  });

  it('returns errors when storage list fails', async () => {
    const fake = makeFakeSupabase({
      storageList: { data: null, error: { message: 'list failed' } },
    });
    const { cleanupOrphanProjectImages } = await import('@/utils/projects/orphan-cleanup');

    const result = await cleanupOrphanProjectImages(fake as never);

    expect(result.deleted).toBe(0);
    expect(result.errors).toEqual(['Failed to list storage: list failed']);
    expect(fake.from).not.toHaveBeenCalled();
    expect(fake.remove).not.toHaveBeenCalled();
  });

  it('returns errors when DB query fails', async () => {
    const fake = makeFakeSupabase({
      storageList: { data: [{ name: 'a.jpg', id: 'id-1' }], error: null },
      dbSelect: { data: null, error: { message: 'query failed' } },
    });
    const { cleanupOrphanProjectImages } = await import('@/utils/projects/orphan-cleanup');

    const result = await cleanupOrphanProjectImages(fake as never);

    expect(result.deleted).toBe(0);
    expect(result.errors).toEqual(['Failed to query projects: query failed']);
    expect(fake.remove).not.toHaveBeenCalled();
  });

  it('returns errors when storage remove fails', async () => {
    const fake = makeFakeSupabase({
      storageList: { data: [{ name: 'orphan.jpg', id: 'id-1' }], error: null },
      dbSelect: { data: [], error: null },
      storageRemove: { data: null, error: { message: 'remove failed' } },
    });
    const { cleanupOrphanProjectImages } = await import('@/utils/projects/orphan-cleanup');

    const result = await cleanupOrphanProjectImages(fake as never);

    expect(result.deleted).toBe(0);
    expect(result.errors).toEqual(['Failed to remove orphans: remove failed']);
  });

  it('queries the projects table for image_url when bucket has files', async () => {
    const fake = makeFakeSupabase({
      storageList: { data: [{ name: '1700000000-a.jpg', id: 'id-1' }], error: null },
      dbSelect: { data: [], error: null },
    });
    const { cleanupOrphanProjectImages } = await import('@/utils/projects/orphan-cleanup');

    await cleanupOrphanProjectImages(fake as never);

    expect(fake.from).toHaveBeenCalledWith(PROJECTS_TABLE);
    expect(fake.select).toHaveBeenCalledWith('image_url');
  });
});
