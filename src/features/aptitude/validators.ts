import { z } from 'zod'

export const recordAptitudeAttemptSchema = z
  .object({
    topic_id: z.string().min(1).max(200),
    questions_attempted: z.number().int().min(1, 'Log at least one question').max(200),
    questions_correct: z.number().int().min(0),
    time_seconds: z.number().int().min(0).max(24 * 3600),
    is_timed: z.boolean(),
    notes: z.string().max(500).optional(),
  })
  .refine((data) => data.questions_correct <= data.questions_attempted, {
    message: 'Correct cannot exceed attempted',
    path: ['questions_correct'],
  })

export type RecordAptitudeAttemptInput = z.infer<typeof recordAptitudeAttemptSchema>
