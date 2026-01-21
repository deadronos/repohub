import { ImageOptimizationError } from '@/utils/images/optimize/errors';

type DrawOptions = {
  background?: string;
};

export async function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number,
): Promise<Blob | null> {
  if (typeof canvas.toBlob === 'function') {
    return await new Promise((resolve) => canvas.toBlob(resolve, type, quality));
  }

  try {
    const dataUrl = canvas.toDataURL(type, quality);
    const response = await fetch(dataUrl);
    return await response.blob();
  } catch (error) {
    console.error('Failed to convert canvas to blob:', error);
    return null;
  }
}

export function drawToCanvas(
  source: CanvasImageSource,
  width: number,
  height: number,
  options: DrawOptions = {},
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext('2d');
  if (!context) {
    throw new ImageOptimizationError('encode-failed', 'Canvas 2D context is unavailable.');
  }

  if (options.background) {
    context.fillStyle = options.background;
    context.fillRect(0, 0, width, height);
  }

  context.drawImage(source, 0, 0, width, height);
  return canvas;
}

export async function pickSupportedMimeType(
  canvas: HTMLCanvasElement,
  maxQuality: number,
): Promise<'image/webp' | 'image/jpeg'> {
  const webpProbe = await canvasToBlob(canvas, 'image/webp', maxQuality);
  if (webpProbe) {
    return 'image/webp';
  }

  const jpegProbe = await canvasToBlob(canvas, 'image/jpeg', maxQuality);
  if (jpegProbe) {
    return 'image/jpeg';
  }

  throw new ImageOptimizationError('encode-failed', 'Browser cannot encode this image.');
}
