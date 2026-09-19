import { z } from 'zod'

const optionalUrl = z
  .string()
  .trim()
  .max(500)
  .refine((value) => value === '' || /^https?:\/\/\S+$/.test(value), 'Enter a valid URL')
  .optional()

export const projectStatusSchema = z.enum([
  'idea', 'planning', 'in-progress', 'testing', 'deployed', 'archived',
])

export const createProjectSchema = z.object({
  title: z.string().trim().min(1, 'Give the project a title').max(200),
  description: z.string().max(2000).optional(),
  template_id: z.string().max(100).nullable().optional(),
  tech_stack: z.array(z.string().max(50)).max(30).default([]),
})

export const updateProjectSchema = z.object({
  id: z.string().uuid(),
  title: z.string().trim().min(1).max(200).optional(),
  description: z.string().max(2000).optional(),
  status: projectStatusSchema.optional(),
  github_url: optionalUrl,
  live_url: optionalUrl,
  architecture_notes: z.string().max(5000).optional(),
  failure_modes: z.string().max(5000).optional(),
  scaling_notes: z.string().max(5000).optional(),
  tech_stack: z.array(z.string().max(50)).max(30).optional(),
})

export const projectTaskSchema = z.object({
  project_id: z.string().uuid(),
  title: z.string().trim().min(1, 'Describe the task').max(200),
})

export const toggleProjectTaskSchema = z.object({
  task_id: z.string().uuid(),
  is_completed: z.boolean(),
})

export type CreateProjectInput = z.infer<typeof createProjectSchema>
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>
