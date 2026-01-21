import { vi } from 'vitest';

export function createLucideUploadMock() {
  return {
    Upload: () => <div data-testid="upload-icon" />,
  };
}

export function createActionsUtilMock() {
  return {
    getActionError: vi.fn(),
  };
}
