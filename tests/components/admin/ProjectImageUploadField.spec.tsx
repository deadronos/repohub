import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ProjectImageUploadField from '@/components/admin/ProjectImageUploadField';

vi.mock('lucide-react', () => ({
  Upload: () => <div data-testid="icon-upload" />,
}));

describe('ProjectImageUploadField', () => {
  const defaultImageState = { status: 'idle' } as const;

  it('renders default state', () => {
    render(
      <ProjectImageUploadField
        currentImageUrl={null}
        fileInputRef={{ current: null }}
        onImageChange={vi.fn()}
        onClearImage={vi.fn()}
        imageState={defaultImageState}
      />
    );
    expect(screen.getByText('Click to Replace / Upload')).toBeInTheDocument();
    expect(screen.getByTestId('icon-upload')).toBeInTheDocument();
  });

  it('renders correctly when image is ready', () => {
    render(
      <ProjectImageUploadField
        currentImageUrl="https://test.com/preview.jpg"
        fileInputRef={{ current: null }}
        onImageChange={vi.fn()}
        onClearImage={vi.fn()}
        imageState={{
          status: 'ready',
          original: new File([''], 'test.png', { type: 'image/png' }),
          prepared: new File([''], 'test.png', { type: 'image/png' }),
          originalBytes: 1000,
          finalBytes: 500,
          mimeType: 'image/png',
          wasOptimized: true,
        }}
      />
    );

    const clearBtn = screen.getByRole('button', { name: /Remove selected image/i });
    expect(clearBtn).toBeInTheDocument();

    expect(screen.getByText(/Optimized 1 KB/)).toBeInTheDocument();
  });

  it('calls onClearImage when clear button is clicked', () => {
    const handleClear = vi.fn();
    render(
      <ProjectImageUploadField
        currentImageUrl="https://test.com/preview.jpg"
        fileInputRef={{ current: null }}
        onImageChange={vi.fn()}
        onClearImage={handleClear}
        imageState={{
          status: 'error',
          original: null,
          message: 'Error',
        }}
      />
    );

    const clearBtn = screen.getByRole('button', { name: /Remove selected image/i });
    fireEvent.click(clearBtn);
    expect(handleClear).toHaveBeenCalledTimes(1);
  });
});
