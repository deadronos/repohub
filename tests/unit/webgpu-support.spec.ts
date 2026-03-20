import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { isWebGPUSupported, checkWebGPUAvailability, getWebGPUSupportMessage } from '@/utils/webgpu-support';

describe('WebGPU Support Utilities', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('isWebGPUSupported', () => {
    it('should return true when navigator.gpu exists', () => {
      vi.stubGlobal('navigator', { gpu: {} });
      vi.stubGlobal('window', {});
      expect(isWebGPUSupported()).toBe(true);
    });

    it('should return false when navigator.gpu is missing', () => {
      vi.stubGlobal('navigator', {});
      vi.stubGlobal('window', {});
      expect(isWebGPUSupported()).toBe(false);
    });

    it('should return false in SSR environment (navigator undefined)', () => {
      vi.stubGlobal('navigator', undefined);
      expect(isWebGPUSupported()).toBe(false);
    });

    it('should return false in SSR environment (window undefined)', () => {
      vi.stubGlobal('window', undefined);
      expect(isWebGPUSupported()).toBe(false);
    });
  });

  describe('checkWebGPUAvailability', () => {
    it('should return false if WebGPU is not supported', async () => {
      vi.stubGlobal('navigator', {});
      vi.stubGlobal('window', {});
      const result = await checkWebGPUAvailability();
      expect(result).toBe(false);
    });

    it('should return true if requestAdapter returns an adapter', async () => {
      const mockRequestAdapter = vi.fn().mockResolvedValue({ name: 'mock-adapter' });
      vi.stubGlobal('navigator', {
        gpu: {
          requestAdapter: mockRequestAdapter
        }
      });
      vi.stubGlobal('window', {});

      const result = await checkWebGPUAvailability();
      expect(result).toBe(true);
      expect(mockRequestAdapter).toHaveBeenCalled();
    });

    it('should return false if requestAdapter returns null', async () => {
      const mockRequestAdapter = vi.fn().mockResolvedValue(null);
      vi.stubGlobal('navigator', {
        gpu: {
          requestAdapter: mockRequestAdapter
        }
      });
      vi.stubGlobal('window', {});

      const result = await checkWebGPUAvailability();
      expect(result).toBe(false);
    });

    it('should return false if requestAdapter throws an error', async () => {
      const mockRequestAdapter = vi.fn().mockRejectedValue(new Error('GPU error'));
      vi.stubGlobal('navigator', {
        gpu: {
          requestAdapter: mockRequestAdapter
        }
      });
      vi.stubGlobal('window', {});

      const result = await checkWebGPUAvailability();
      expect(result).toBe(false);
    });
  });

  describe('getWebGPUSupportMessage', () => {
    it('should return success message when supported', () => {
      vi.stubGlobal('navigator', { gpu: {} });
      vi.stubGlobal('window', {});
      expect(getWebGPUSupportMessage()).toContain('supported');
    });

    it('should return fallback message when not supported', () => {
      vi.stubGlobal('navigator', {});
      vi.stubGlobal('window', {});
      expect(getWebGPUSupportMessage()).toContain('not supported');
    });
  });
});
