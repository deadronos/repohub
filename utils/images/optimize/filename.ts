export function replaceExtension(filename: string, extension: string): string {
  const trimmed = filename.trim();
  const dotIndex = trimmed.lastIndexOf('.');
  if (dotIndex <= 0) {
    return `${trimmed}.${extension}`;
  }
  return `${trimmed.slice(0, dotIndex)}.${extension}`;
}

export function getExtensionFromMimeType(mimeType: string): string {
  if (mimeType === 'image/webp') {
    return 'webp';
  }
  if (mimeType === 'image/jpeg') {
    return 'jpg';
  }
  return 'img';
}
