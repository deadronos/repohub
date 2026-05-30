import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import {
  ProjectCreateSchema,
  ProjectUpdateSchema,
  ProjectUrlSchema,
} from '@/utils/projects/schema';

describe('ProjectCreateSchema', () => {
  it('should accept valid project data', () => {
    const result = ProjectCreateSchema.safeParse({
      title: 'My Project',
      short_description: 'A cool project',
      description: 'Detailed description',
      repo_url: 'https://github.com/user/repo',
      demo_url: 'https://demo.example.com',
      tags: 'react,typescript',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.title).toBe('My Project');
      expect(result.data.repo_url).toBe('https://github.com/user/repo');
      expect(result.data.tags).toBe('react,typescript');
    }
  });

  it('should apply defaults for optional fields', () => {
    const result = ProjectCreateSchema.safeParse({ title: 'Minimal' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.short_description).toBe('');
      expect(result.data.description).toBe('');
      expect(result.data.repo_url).toBe('');
      expect(result.data.demo_url).toBe('');
    }
  });

  it('should trim whitespace from title', () => {
    const result = ProjectCreateSchema.safeParse({ title: '  Hello World  ' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.title).toBe('Hello World');
    }
  });

  it('should fail if title is empty', () => {
    const result = ProjectCreateSchema.safeParse({ title: '' });
    expect(result.success).toBe(false);
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message);
      expect(messages).toContain('Title is required');
    }
  });

  it('should fail if title exceeds 100 characters', () => {
    const result = ProjectCreateSchema.safeParse({ title: 'a'.repeat(101) });
    expect(result.success).toBe(false);
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message);
      expect(messages).toContain('Title must be less than 100 characters');
    }
  });

  it('should accept title exactly 100 characters', () => {
    const result = ProjectCreateSchema.safeParse({ title: 'a'.repeat(100) });
    expect(result.success).toBe(true);
  });

  it('should transform missing optional fields to empty strings', () => {
    const result = ProjectCreateSchema.safeParse({
      title: 'Test',
      repo_url: '',
      demo_url: '',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.repo_url).toBe('');
      expect(result.data.demo_url).toBe('');
    }
  });
});

describe('ProjectUpdateSchema', () => {
  it('should accept valid update data with id', () => {
    const result = ProjectUpdateSchema.safeParse({
      id: 'abc-123',
      title: 'Updated Project',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.id).toBe('abc-123');
    }
  });

  it('should fail if id is missing', () => {
    const result = ProjectUpdateSchema.safeParse({ title: 'No ID' });
    expect(result.success).toBe(false);
  });

  it('should fail if id is empty string', () => {
    const result = ProjectUpdateSchema.safeParse({ id: '', title: 'Test' });
    expect(result.success).toBe(false);
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message);
      expect(messages).toContain('Project ID is required');
    }
  });
});

describe('ProjectUrlSchema', () => {
  it('should accept valid http/https URLs', () => {
    const result = ProjectUrlSchema.safeParse({
      repo_url: 'https://github.com/user/repo',
      demo_url: 'https://demo.example.com',
    });
    expect(result.success).toBe(true);
  });

  it('should accept empty URLs', () => {
    const result = ProjectUrlSchema.safeParse({
      repo_url: '',
      demo_url: '',
    });
    expect(result.success).toBe(true);
  });

  it('should accept missing URLs', () => {
    const result = ProjectUrlSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it('should reject non-http URLs like javascript:', () => {
    const result = ProjectUrlSchema.safeParse({
      repo_url: 'javascript:alert(1)',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message);
      expect(messages).toContain('Invalid Repository URL');
    }
  });

  it('should reject invalid demo URL', () => {
    const result = ProjectUrlSchema.safeParse({
      repo_url: 'https://github.com/ok',
      demo_url: 'not-a-url',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message);
      expect(messages).toContain('Invalid Demo URL');
    }
  });
});

describe('Type inference from schemas', () => {
  it('ProjectCreateSchema should infer readonly type', () => {
    // TypeScript-level check: these should compile without errors
    type Inferred = z.infer<typeof ProjectCreateSchema>;
    const valid: Inferred = {
      title: 'Test',
      short_description: '',
      description: '',
      repo_url: '',
      demo_url: '',
      tags: '',
    };
    expect(valid.title).toBe('Test');
  });

  it('ProjectUpdateSchema should infer readonly type with id', () => {
    type Inferred = z.infer<typeof ProjectUpdateSchema>;
    const valid: Inferred = {
      id: 'abc',
      title: 'Test',
      short_description: '',
      description: '',
      repo_url: '',
      demo_url: '',
      current_image_url: '',
    };
    expect(valid.id).toBe('abc');
  });
});
