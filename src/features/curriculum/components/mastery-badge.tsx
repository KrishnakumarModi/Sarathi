import { Badge } from '@/components/ui/badge'
import { MASTERY_LABELS, type MasteryLevel } from '@/types/global'
import { cn } from '@/lib/utils'

const LEVEL_CLASSES: Record<MasteryLevel, string> = {
  0: 'bg-muted text-muted-foreground',
  1: 'bg-slate-500/15 text-slate-700 dark:text-slate-300',
  2: 'bg-blue-500/15 text-blue-700 dark:text-blue-400',
  3: 'bg-amber-500/15 text-amber-700 dark:text-amber-400',
  4: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400',
  5: 'bg-violet-500/15 text-violet-700 dark:text-violet-400',
  6: 'bg-yellow-500/20 text-yellow-800 dark:text-yellow-300',
}

export function MasteryBadge({ level, className }: { level: number; className?: string }) {
  const safe = Math.max(0, Math.min(6, Math.round(level))) as MasteryLevel
  return (
    <Badge variant="outline" className={cn('border-transparent', LEVEL_CLASSES[safe], className)}>
      {MASTERY_LABELS[safe]}
    </Badge>
  )
}
