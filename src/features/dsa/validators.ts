import { z } from 'zod'

export const recordAttemptSchema = z
  .object({
    problem_id: z.string().min(1).max(200),
    solved: z.boolean(),
    solved_independently: z.boolean(),
    hint_used: z.boolean(),
    editorial_used: z.boolean(),
    time_minutes: z.number().int().min(1, 'Enter the time you spent').max(600),
    confidence: z.number().int().min(1).max(5),
    approach: z.string().max(1000).optional(),
    mistake_category: z.enum(['logic', 'edge-case', 'timeout', 'wrong-pattern', 'syntax', 'none']),
    notes: z.string().max(1000).optional(),
    needs_revision: z.boolean().default(false),
  })
  .refine((data) => !data.solved_independently || (!data.hint_used && !data.editorial_used), {
    message: 'An independent solve cannot also use a hint or the editorial',
    path: ['solved_independently'],
  })

export type RecordAttemptInput = z.infer<typeof recordAttemptSchema>
