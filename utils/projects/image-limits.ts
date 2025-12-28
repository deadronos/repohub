export const PROJECT_IMAGE_MAX_BYTES = 500_000 as const;

// Keep a buffer to avoid borderline rejections (metadata, encoding differences, etc.).
export const PROJECT_IMAGE_TARGET_BYTES = 480_000 as const;

// Default cap for large screenshots before quality search kicks in.
export const PROJECT_IMAGE_MAX_DIMENSION = 1920 as const;
