import { Progress } from '@/components/ui/progress'
import { formatMinutes, percent, progressColor } from '@/lib/utils'

interface CapacityBarProps {
  scheduledMinutes: number
  completedMinutes: number
  capacityMinutes: number
}

export function CapacityBar({
  scheduledMinutes,
  completedMinutes,
  capacityMinutes,
}: CapacityBarProps) {
  const completion = percent(completedMinutes, scheduledMinutes)
  const load = percent(scheduledMinutes, capacityMinutes)

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-baseline justify-between gap-2 text-sm">
        <span className="font-medium">
          {formatMinutes(completedMinutes)} of {formatMinutes(scheduledMinutes)} done
        </span>
        <span className="text-xs text-muted-foreground">
          {formatMinutes(capacityMinutes)} available today · {Math.round(load)}% allocated
        </span>
      </div>
      <Progress
        value={completion}
        indicatorClassName={progressColor(completion)}
        aria-label="Today's completed minutes"
      />
    </div>
  )
}
