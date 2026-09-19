import { useOptimistic, useTransition } from 'react'
import { Check, Clock, RotateCcw, SkipForward } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from '@/components/ui/use-toast'
import { cn, formatMinutes } from '@/lib/utils'
import { useOnlineStatus } from '@/hooks/use-online-status'
import type { DailyTaskRow, TaskCategory, TaskSource } from '@/types/database.types'
import { deferTask, updateTaskStatus } from '../api'

const CATEGORY_LABELS: Record<TaskCategory, string> = {
  'ai-ml': 'AI/ML',
  dsa: 'DSA',
  cs: 'CS',
  aptitude: 'Aptitude',
  project: 'Project',
  career: 'Career',
  review: 'Revision',
}

const SOURCE_VARIANTS: Record<TaskSource, 'muted' | 'info' | 'warning'> = {
  curriculum: 'muted',
  revision: 'info',
  backlog: 'warning',
  project: 'muted',
  career: 'muted',
  manual: 'muted',
}

export function TaskCard({ task }: { task: DailyTaskRow }) {
  const [isPending, startTransition] = useTransition()
  const { isOnline } = useOnlineStatus()
  const [optimisticStatus, setOptimisticStatus] = useOptimistic(task.status)

  const isComplete = optimisticStatus === 'completed'
  const disabled = isPending || !isOnline

  function setStatus(status: 'completed' | 'planned' | 'skipped') {
    startTransition(async () => {
      setOptimisticStatus(status)
      const result = await updateTaskStatus({ task_id: task.id, status })
      if ('error' in result) {
        toast.error('Failed to save', result.error)
        return
      }
      if (status === 'completed') toast.success('Task marked complete')
    })
  }

  function handleDefer() {
    startTransition(async () => {
      setOptimisticStatus('rescheduled')
      const result = await deferTask(task.id, 'Moved to tomorrow by you')
      if ('error' in result) {
        toast.error('Failed to move task', result.error)
        return
      }
      toast.success('Moved to tomorrow', 'It stays in your backlog until it is done.')
    })
  }

  return (
    <li
      className={cn(
        'flex items-start gap-3 rounded-md border p-3 transition-colors duration-200',
        isComplete && 'bg-muted/40',
        optimisticStatus === 'rescheduled' && 'opacity-60'
      )}
    >
      <Checkbox
        id={`task-${task.id}`}
        checked={isComplete}
        disabled={disabled}
        onCheckedChange={(checked) => setStatus(checked === true ? 'completed' : 'planned')}
        aria-label={`Mark "${task.title}" ${isComplete ? 'incomplete' : 'complete'}`}
        className="mt-0.5"
      />

      <div className="min-w-0 flex-1">
        <label
          htmlFor={`task-${task.id}`}
          className={cn(
            'block cursor-pointer text-sm font-medium',
            isComplete && 'text-muted-foreground line-through'
          )}
        >
          {task.title}
        </label>
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          <Badge variant="muted" className="gap-1">
            <Clock className="h-3 w-3" aria-hidden />
            {formatMinutes(task.estimated_minutes)}
          </Badge>
          <Badge variant="outline">{CATEGORY_LABELS[task.category]}</Badge>
          {task.source !== 'curriculum' ? (
            <Badge variant={SOURCE_VARIANTS[task.source]}>
              {task.source === 'backlog' ? `Carried over` : task.source}
            </Badge>
          ) : null}
          {task.reschedule_count > 0 ? (
            <Badge variant="warning">
              Moved {task.reschedule_count}x
            </Badge>
          ) : null}
        </div>
        {task.non_completion_reason ? (
          <p className="mt-1.5 text-xs text-muted-foreground">{task.non_completion_reason}</p>
        ) : null}
      </div>

      {!isComplete ? (
        <div className="flex shrink-0 gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDefer}
            disabled={disabled}
            aria-label={`Move "${task.title}" to tomorrow`}
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setStatus('skipped')}
            disabled={disabled}
            aria-label={`Skip "${task.title}"`}
          >
            <SkipForward className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <Check className="mt-1 h-4 w-4 shrink-0 text-emerald-500" aria-hidden />
      )}
    </li>
  )
}
