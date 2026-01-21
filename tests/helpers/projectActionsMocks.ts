import { vi } from 'vitest';

export function createProjectFormActionsMock() {
  return {
    createProject: vi.fn(),
    updateProject: vi.fn(),
  };
}

export function createAdminDashboardActionsMock() {
  return {
    deleteProjects: vi.fn(),
    updateProjectOrder: vi.fn(),
  };
}
