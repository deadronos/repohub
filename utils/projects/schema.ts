import { z } from 'zod';

const HTTP_URL_REGEX = /^https?:\/\/.+/;

function optionalHttpUrlField(message: string) {
  return z
    .string()
    .trim()
    .optional()
    .refine((val) => !val || HTTP_URL_REGEX.test(val), { message });
}

/**
 * Schema for creating a new project.
 * Validates raw FormData values before they become a proper Project.
 */
export const ProjectCreateSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Title is required')
    .max(100, 'Title must be less than 100 characters'),
  short_description: z.string().trim().default(''),
  description: z.string().trim().default(''),
  repo_url: optionalHttpUrlField('Invalid Repository URL').transform((val) => val || ''),
  demo_url: optionalHttpUrlField('Invalid Demo URL').transform((val) => val || ''),
  tags: z.string().trim().optional(),
});

/**
 * Schema for updating an existing project.
 * Same as create but requires an `id` field.
 */
export const ProjectUpdateSchema = ProjectCreateSchema.extend({
  id: z.string().min(1, 'Project ID is required'),
  current_image_url: z.string().default(''),
});

/** Inferred type for project creation data */
export type ProjectCreateInput = z.infer<typeof ProjectCreateSchema>;

/** Inferred type for project update data */
export type ProjectUpdateInput = z.infer<typeof ProjectUpdateSchema>;

/** Form-level validation: validates URL fields specifically */
export const ProjectUrlSchema = z.object({
  repo_url: optionalHttpUrlField('Invalid Repository URL'),
  demo_url: optionalHttpUrlField('Invalid Demo URL'),
});

export type ProjectUrlInput = z.infer<typeof ProjectUrlSchema>;
