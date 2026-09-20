import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { ApplicationStatus } from '@/types/database.types'

/** The twelve ATS statuses, coloured per 05_DESIGN_SYSTEM.md. */
export const STATUS_LABELS: Record<ApplicationStatus, string> = {
  discovered: 'Discovered',
  saved: 'Saved',
  shortlisted: 'Shortlisted',
  applied: 'Applied',
  assessment: 'Assessment',
  interview: 'Interview',
  'technical-round': 'Technical round',
  'hr-round': 'HR round',
  offer: 'Offer',
  rejected: 'Rejected',
  ghosted: 'Ghosted',
  withdrawn: 'Withdrawn',
}

const STATUS_CLASSES: Record<ApplicationStatus, string> = {
  discovered: 'bg-muted text-muted-foreground',
  saved: 'bg-blue-500/15 text-blue-700 dark:text-blue-400',
  shortlisted: 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-400',
  applied: 'bg-amber-500/15 text-amber-700 dark:text-amber-400',
  assessment: 'bg-orange-500/15 text-orange-700 dark:text-orange-400',
  interview: 'bg-violet-500/15 text-violet-700 dark:text-violet-400',
  'technical-round': 'bg-purple-500/15 text-purple-700 dark:text-purple-400',
  'hr-round': 'bg-pink-500/15 text-pink-700 dark:text-pink-400',
  offer: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400',
  rejected: 'bg-red-500/15 text-red-700 dark:text-red-400',
  ghosted: 'bg-slate-500/15 text-slate-700 dark:text-slate-300',
  withdrawn: 'bg-muted text-muted-foreground',
}

export const APPLICATION_STATUS_ORDER: ApplicationStatus[] = [
  'discovered', 'saved', 'shortlisted', 'applied', 'assessment', 'interview',
  'technical-round', 'hr-round', 'offer', 'rejected', 'ghosted', 'withdrawn',
]

export function ApplicationStatusBadge({ status }: { status: ApplicationStatus }) {
  return (
    <Badge variant="outline" className={cn('border-transparent', STATUS_CLASSES[status])}>
      {STATUS_LABELS[status]}
    </Badge>
  )
}
