import { CalendarCheck } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { DailyTaskRow } from '@/types/database.types'
import { CapacityBar } from './capacity-bar'
import { TaskCard } from './task-card'

interface DailyPlanViewProps {
  tasks: DailyTaskRow[]
  capacityMinutes: number
}

export function DailyPlanView({ tasks, capacityMinutes }: DailyPlanViewProps) {
  const active = tasks.filter((t) => t.status !== 'expired' && t.status !== 'rescheduled')
  const scheduledMinutes = active.reduce((sum, t) => sum + t.estimated_minutes, 0)
  const completedMinutes = active
    .filter((t) => t.status === 'completed')
    .reduce((sum, t) => sum + t.estimated_minutes, 0)
  const remaining = active.filter((t) => t.status !== 'completed').length

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <CalendarCheck className="h-4 w-4 text-muted-foreground" aria-hidden />
          Today&apos;s plan
        </CardTitle>
        <CardDescription>
          {remaining === 0
            ? 'Everything planned for today is done.'
            : `${remaining} task${remaining === 1 ? '' : 's'} left.`}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <CapacityBar
          scheduledMinutes={scheduledMinutes}
          completedMinutes={completedMinutes}
          capacityMinutes={capacityMinutes}
        />
        <ul className="space-y-2">
          {active.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
