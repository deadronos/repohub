/**
 * Utility for detecting WebGPU support in the current browser environment.
 * 
 * WebGPU is a modern graphics API that provides better performance and more
 * efficient GPU resource management than WebGL. However, browser support is
 * still limited as of 2026.
 * 
 * Browser compatibility:
 * - Chrome/Edge 113+
 * - Safari 18+
 * - Firefox: Experimental support
 */

/**
 * Check if WebGPU is supported in the current browser.
 * 
 * @returns {boolean} True if WebGPU is supported, false otherwise
 */
export function isWebGPUSupported(): boolean {
  // Check if running in browser environment
  if (typeof navigator === 'undefined' || typeof window === 'undefined') {
    return false;
  }

  // Check for WebGPU API availability
  return 'gpu' in navigator;
}

/**
 * Async check that also verifies if a WebGPU adapter can be requested.
 * This provides a more thorough check than just checking for API presence.
 * 
 * @returns {Promise<boolean>} True if a WebGPU adapter can be obtained
 */
export async function checkWebGPUAvailability(): Promise<boolean> {
  if (!isWebGPUSupported()) {
    return false;
  }

  try {
    const adapter = await navigator.gpu?.requestAdapter();
    return adapter !== null && adapter !== undefined;
  } catch {
    return false;
  }
}

/**
 * Get a human-readable message about WebGPU support status.
 * Useful for debugging and user feedback.
 * 
 * @returns {string} Status message
 */
export function getWebGPUSupportMessage(): string {
  if (!isWebGPUSupported()) {
    return 'WebGPU is not supported in this browser. Falling back to WebGL.';
  }
  
  return 'WebGPU is supported and will be used for rendering.';
}
