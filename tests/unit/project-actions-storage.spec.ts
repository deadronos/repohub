import { beforeEach, describe, expect, it, vi } from 'vitest';

const {
  createClientMock,
  ensureUserMock,
  requireUserOrUnauthorizedMock,
  prepareProjectMutationMock,
  revalidateProjectsMock,
  deleteProjectImagesMock,
} = vi.hoisted(() => ({
  createClientMock: vi.fn(),
  ensureUserMock: vi.fn(),
  requireUserOrUnauthorizedMock: vi.fn(),
  prepareProjectMutationMock: vi.fn(),
  revalidateProjectsMock: vi.fn(),
  deleteProjectImagesMock: vi.fn(),
}));

vi.mock('@/utils/supabase/server', () => ({
  createClient: createClientMock,
}));

vi.mock('@/utils/supabase/auth', () => ({
  ensureUser: ensureUserMock,
  requireUserOrUnauthorized: requireUserOrUnauthorizedMock,
}));

vi.mock('@/utils/projects/mutations', () => ({
  prepareProjectMutation: prepareProjectMutationMock,
}));

vi.mock('@/utils/projects/revalidate', () => ({
  revalidateProjects: revalidateProjectsMock,
}));

vi.mock('@/utils/projects/storage', async () => {
  const actual = await vi.importActual<typeof import('@/utils/projects/storage')>(
    '@/utils/projects/storage',
  );

  return {
    ...actual,
    deleteProjectImages: deleteProjectImagesMock,
  };
});

import { deleteProjects, updateProject } from '@/app/actions/projects';

function createSupabaseDouble() {
  const eqMock = vi.fn();
  const updateMock = vi.fn(() => ({ eq: eqMock }));
  const returnsMock = vi.fn();
  const selectInMock = vi.fn(() => ({ returns: returnsMock }));
  const selectMock = vi.fn(() => ({ in: selectInMock }));
  const deleteInMock = vi.fn();
  const deleteMock = vi.fn(() => ({ in: deleteInMock }));
  const fromMock = vi.fn(() => ({
    update: updateMock,
    select: selectMock,
    delete: deleteMock,
  }));

  return {
    supabase: {
      from: fromMock,
    },
    updateMock,
    eqMock,
    selectMock,
    returnsMock,
    deleteMock,
    deleteInMock,
  };
}

describe('project action storage cleanup', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    ensureUserMock.mockResolvedValue({ id: 'user-1' });
    requireUserOrUnauthorizedMock.mockResolvedValue({ data: { id: 'user-1' } });
    deleteProjectImagesMock.mockResolvedValue({ deletedPaths: [], warning: null });
  });

  it('removes the previous image after a successful project image replacement', async () => {
    const { supabase, updateMock, eqMock } = createSupabaseDouble();
    createClientMock.mockResolvedValue(supabase);
    eqMock.mockResolvedValue({ error: null });
    prepareProjectMutationMock.mockResolvedValue({
      data: {
        parsed: {
          id: 'project-1',
          title: 'Project',
          short_description: 'Short',
          description: 'Long',
          repo_url: '',
          demo_url: '',
          tags: [],
          imageFile: null,
          current_image_url:
            'https://demo.supabase.co/storage/v1/object/public/projects/old-image.png',
        },
        imageUrl: 'https://demo.supabase.co/storage/v1/object/public/projects/new-image.png',
        tags: ['react'],
      },
    });

    const result = await updateProject(new FormData());

    expect(updateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        image_url: 'https://demo.supabase.co/storage/v1/object/public/projects/new-image.png',
      }),
    );
    expect(deleteProjectImagesMock).toHaveBeenCalledWith(supabase, [
      'https://demo.supabase.co/storage/v1/object/public/projects/old-image.png',
    ]);
    expect(revalidateProjectsMock).toHaveBeenCalled();
    expect(result).toEqual({ data: true });
  });

  it('returns a warning when project deletion succeeds but storage cleanup fails', async () => {
    const { supabase, selectMock, returnsMock, deleteMock, deleteInMock } = createSupabaseDouble();
    createClientMock.mockResolvedValue(supabase);
    returnsMock.mockResolvedValue({
      data: [
        {
          id: 'project-1',
          image_url: 'https://demo.supabase.co/storage/v1/object/public/projects/hero.png',
        },
        {
          id: 'project-2',
          image_url: null,
        },
      ],
      error: null,
    });
    deleteInMock.mockResolvedValue({ error: null });
    deleteProjectImagesMock.mockResolvedValue({
      deletedPaths: [],
      warning: 'Failed to remove 1 image from storage.',
    });

    const result = await deleteProjects(['project-1', 'project-2']);

    expect(selectMock).toHaveBeenCalledWith('id, image_url');
    expect(deleteMock).toHaveBeenCalled();
    expect(deleteProjectImagesMock).toHaveBeenCalledWith(supabase, [
      'https://demo.supabase.co/storage/v1/object/public/projects/hero.png',
      null,
    ]);
    expect(revalidateProjectsMock).toHaveBeenCalled();
    expect(result).toEqual({
      data: true,
      warning: 'Projects deleted, but failed to remove some images from storage.',
    });
  });
});
