import { Badge } from '@/components/ui/badge'
import { DIFFICULTY_LABELS } from '@/types/global'
import { cn } from '@/lib/utils'

const LEVEL_CLASSES: string[] = [
  'text-muted-foreground',
  'text-green-600 dark:text-green-400',
  'text-emerald-600 dark:text-emerald-400',
  'text-blue-600 dark:text-blue-400',
  'text-amber-600 dark:text-amber-400',
  'text-orange-600 dark:text-orange-400',
  'text-red-600 dark:text-red-400',
  'text-purple-600 dark:text-purple-400',
]

export function DifficultyBadge({ level, className }: { level: number; className?: string }) {
  const safe = Math.max(0, Math.min(7, Math.round(level)))
  return (
    <Badge variant="outline" className={cn(LEVEL_CLASSES[safe], className)}>
      {DIFFICULTY_LABELS[safe]}
    </Badge>
  )
}
