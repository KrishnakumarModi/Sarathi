import { z } from 'zod'

export const SESSION_TYPES = [
  'dsa', 'ml', 'dl', 'llm', 'rag', 'python', 'sql', 'dbms', 'os', 'networks',
  'system-design', 'project', 'behavioral',
] as const

export const sessionTypeSchema = z.enum(SESSION_TYPES)

export const recordSessionSchema = z.object({
  session_type: sessionTypeSchema,
  total_questions: z.number().int().min(1).max(100),
  correct_answers: z.number().int().min(0).max(100),
  duration_minutes: z.number().int().min(0).max(600).optional(),
  project_id: z.string().uuid().nullable().optional(),
  notes: z.string().max(2000).optional(),
}).refine((data) => data.correct_answers <= data.total_questions, {
  message: 'Correct cannot exceed the number asked',
  path: ['correct_answers'],
})

export type SessionType = (typeof SESSION_TYPES)[number]
export type RecordSessionInput = z.infer<typeof recordSessionSchema>
