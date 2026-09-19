import { z } from 'zod'
import { APPLICATION_STATUSES } from '@/types/database.types'

const optionalUrl = z
  .string()
  .trim()
  .max(500)
  .refine((v) => v === '' || /^https?:\/\/\S+$/.test(v), 'Enter a valid URL')
  .optional()

export const applicationStatusSchema = z.enum(APPLICATION_STATUSES)

export const createApplicationSchema = z.object({
  company: z.string().trim().min(1, 'Company is required').max(200),
  role_title: z.string().trim().min(1, 'Role is required').max(200),
  location: z.string().max(200).optional(),
  is_remote: z.boolean().default(false),
  salary_range: z.string().max(100).optional(),
  job_url: optionalUrl,
  source: z.string().max(100).optional(),
  status: applicationStatusSchema.default('discovered'),
  notes: z.string().max(2000).optional(),
  required_skills: z.array(z.string().max(100)).max(50).default([]),
  matched_skills: z.array(z.string().max(100)).max(50).default([]),
  missing_skills: z.array(z.string().max(100)).max(50).default([]),
  match_percentage: z.number().int().min(0).max(100).nullable().optional(),
})

export const updateApplicationStatusSchema = z.object({
  id: z.string().uuid(),
  status: applicationStatusSchema,
})

export const analyzeJdSchema = z.object({
  jd_text: z.string().trim().min(20, 'Paste the job description first').max(50_000),
})

export type CreateApplicationInput = z.infer<typeof createApplicationSchema>
