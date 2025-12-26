'use client';

import Image from 'next/image';
import type { ReactNode } from 'react';

type ProjectImageProps = {
  imageUrl: string | null | undefined;
  alt: string;
  sizes: string;
  className?: string;
  fallback?: ReactNode;
};

export default function ProjectImage({ imageUrl, alt, sizes, className, fallback }: ProjectImageProps) {
  if (!imageUrl) {
    return fallback ?? null;
  }

  return (
    <Image
      src={imageUrl}
      alt={alt}
      fill
      sizes={sizes}
      className={className}
    />
  );
}
