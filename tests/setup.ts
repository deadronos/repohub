import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeEach } from 'vitest';

class MockIntersectionObserver implements IntersectionObserver {
  readonly root: Element | null = null;
  readonly rootMargin: string = '';
  readonly thresholds: ReadonlyArray<number> = [];
  readonly scrollMargin: string = '';
  private callbacks: Array<(entries: IntersectionObserverEntry[]) => void> = [];
  disconnect() { this.callbacks = []; }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  observe(_element: Element) {
    this.callbacks.push(() => {});
  }
  unobserve() {}
  takeRecords(): IntersectionObserverEntry[] { return []; }
}

window.IntersectionObserver = MockIntersectionObserver;

function createMatchMediaMock(matches: boolean) {
  return {
    matches,
    media: '',
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  };
}

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  configurable: true,
  value: vi.fn((query: string) => {
    if (query === '(prefers-reduced-motion: reduce)') {
      return createMatchMediaMock(false);
    }
    return createMatchMediaMock(false);
  }),
});

// Cleanup after each test case (e.g. clearing jsdom)
afterEach(() => {
  cleanup();
});

// Export beforeEach for tests that need it
export { beforeEach };
