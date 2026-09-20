import { z } from 'zod'

export const csMasteryFieldSchema = z.enum([
  'concept_understood',
  'questions_practiced',
  'quiz_passed',
  'interview_ready',
])

export const updateCsMasterySchema = z.object({
  topic_id: z.string().min(1).max(200),
  field: csMasteryFieldSchema,
  value: z.boolean(),
})

export const updateCsConfidenceSchema = z.object({
  topic_id: z.string().min(1).max(200),
  confidence: z.number().int().min(0).max(5),
})

export type CsMasteryField = z.infer<typeof csMasteryFieldSchema>
