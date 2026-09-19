import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(8, 'Minimum 8 characters'),
})

export const signupSchema = z
  .object({
    displayName: z.string().min(1, 'Enter a name').max(80, 'Name is too long'),
    email: z.string().email('Enter a valid email address'),
    password: z.string().min(8, 'Minimum 8 characters'),
    confirmPassword: z.string().min(8, 'Minimum 8 characters'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export const settingsSchema = z.object({
  display_name: z.string().min(1, 'Enter a name').max(80).optional(),
  timezone: z.string().min(1).max(64).optional(),
  weekly_capacity_minutes: z
    .number()
    .int()
    .min(0, 'Cannot be negative')
    .max(7 * 24 * 60, 'That is more hours than a week has')
    .optional(),
  planning_days_per_week: z.number().int().min(1).max(7).optional(),
  max_daily_minutes: z.number().int().min(15).max(960).optional(),
  theme: z.enum(['light', 'dark', 'system']).optional(),
  study_intensity: z.enum(['light', 'moderate', 'intense']).optional(),
  dsa_weekly_target: z.number().int().min(0).max(100).optional(),
  application_daily_target: z.number().int().min(0).max(50).optional(),
  notifications_enabled: z.boolean().optional(),
  target_timeline_weeks: z.number().int().min(1).max(104).nullable().optional(),
})

export type LoginInput = z.infer<typeof loginSchema>
export type SignupInput = z.infer<typeof signupSchema>
export type SettingsInput = z.infer<typeof settingsSchema>
