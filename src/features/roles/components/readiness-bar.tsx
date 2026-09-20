import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { ProximityLabel } from '@/types/global'

const LABEL_STYLES: Record<ProximityLabel, string> = {
  EXPLORING: 'bg-muted text-muted-foreground',
  BUILDING: 'bg-amber-500/15 text-amber-700 dark:text-amber-400',
  APPROACHING: 'bg-blue-500/15 text-blue-700 dark:text-blue-400',
  'STRONG ALIGNMENT': 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400',
}

const LABEL_TEXT: Record<ProximityLabel, string> = {
  EXPLORING: 'Exploring',
  BUILDING: 'Building',
  APPROACHING: 'Approaching',
  'STRONG ALIGNMENT': 'Strong alignment',
}

function barColor(score: number): string {
  if (score >= 70) return 'bg-emerald-500'
  if (score >= 40) return 'bg-amber-500'
  return 'bg-destructive'
}

interface ReadinessBarProps {
  label: ProximityLabel
  score: number
  name?: string
  showLabel?: boolean
}

export function ReadinessBar({ label, score, name, showLabel = true }: ReadinessBarProps) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        {name ? <span className="truncate text-sm font-medium">{name}</span> : null}
        <div className="ml-auto flex items-center gap-2">
          {showLabel ? (
            <Badge variant="outline" className={cn('border-transparent', LABEL_STYLES[label])}>
              {LABEL_TEXT[label]}
            </Badge>
          ) : null}
          <span className="text-sm font-medium tabular-nums">{Math.round(score)}%</span>
        </div>
      </div>
      <Progress
        value={score}
        indicatorClassName={barColor(score)}
        aria-label={name ? `${name} proximity` : 'Role proximity'}
      />
    </div>
  )
}
