import { z } from 'zod'

export const onboardingSchema = z.object({
  displayName: z.string().min(1, 'Enter a name').max(80),
  timezone: z.string().min(1).max(64),
  goalMode: z.enum(['open', 'targeted']),
  /** Empty when exploring without a specific target. */
  roleIds: z.array(z.string().min(1)).max(5, 'Pick at most five target roles'),
  primaryRoleId: z.string().min(1).nullable(),
  timelineWeeks: z.number().int().min(1).max(104).nullable(),
  weeklyHours: z.number().min(1, 'At least one hour a week').max(100, 'That is more than a week holds'),
  planningDays: z.number().int().min(1).max(7),
  baselineMode: z.enum(['assessment', 'fundamentals']),
  /** question_id -> option value. Empty when starting from fundamentals. */
  baselineAnswers: z.record(z.string(), z.string()),
}).refine(
  (data) => data.goalMode === 'open' || data.roleIds.length > 0,
  { message: 'Pick at least one role, or choose to explore instead', path: ['roleIds'] }
).refine(
  (data) => data.primaryRoleId === null || data.roleIds.includes(data.primaryRoleId),
  { message: 'The primary role must be one of your selected roles', path: ['primaryRoleId'] }
)

export type OnboardingInput = z.infer<typeof onboardingSchema>
