'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { ReactNode } from 'react';

type ProjectImageProps = {
  imageUrl: string | null | undefined;
  alt: string;
  sizes: string;
  className?: string;
  fallback?: ReactNode;
  priority?: boolean;
};

// Simple base64 blur placeholder (1x1 gray pixel, resized via CSS)
const BLUR_DATA_URL = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

export default function ProjectImage({ imageUrl, alt, sizes, className, fallback, priority }: ProjectImageProps) {
  const [hasError, setHasError] = useState(false);

  if (!imageUrl || hasError) {
    return fallback ?? null;
  }

  return (
    <Image
      src={imageUrl}
      alt={alt}
      fill
      sizes={sizes}
      className={className}
      placeholder="blur"
      blurDataURL={BLUR_DATA_URL}
      onError={() => setHasError(true)}
      priority={priority}
    />
  );
}
