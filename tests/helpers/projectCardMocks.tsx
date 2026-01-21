import type { ReactNode } from 'react';

export function createFramerMotionMock() {
  return {
    motion: {
      div: (allProps: { children: ReactNode } & Record<string, unknown>) => {
        const { children } = allProps;
        const props = { ...allProps };
        delete props.layoutId;
        delete props.whileHover;
        return <div {...props}>{children}</div>;
      },
    },
  };
}

export function createGitHubStatsMock() {
  return {
    default: () => <div data-testid="github-stats" />,
  };
}

export function createNextImageMock() {
  return {
    default: (allProps: { alt: string; src?: unknown } & Record<string, unknown>) => {
      const { alt, src } = allProps;
      const props = { ...allProps };
      delete props.fill;
      delete props.sizes;
      const dataSrc = typeof src === 'string' ? src : '';
      return <div role="img" aria-label={alt} data-src={dataSrc} {...props} />;
    },
  };
}
