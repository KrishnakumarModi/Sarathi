import { useOptimistic, useTransition } from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from '@/components/ui/use-toast'
import { COMPLETION_DIMENSIONS, type CompletionDimension } from '@/types/global'
import { useOnlineStatus } from '@/hooks/use-online-status'
import { updateTaskCompletion } from '../api'

const LABELS: Record<CompletionDimension, string> = {
  theory: 'Theory',
  practice: 'Practice',
  implementation: 'Implementation',
  quiz: 'Quiz',
  interview: 'Interview',
  project: 'Project',
}

export type DimensionState = Record<CompletionDimension, boolean>

interface CompletionTogglesProps {
  unitId: string
  unitName: string
  state: DimensionState
  disabled?: boolean
}

/**
 * The six completion dimensions.
 *
 * `useOptimistic` flips the checkbox immediately — a checkbox that waits for
 * a round trip feels broken — and the state reverts on failure because the
 * server render is the source of truth.
 */
export function CompletionToggles({ unitId, unitName, state, disabled }: CompletionTogglesProps) {
  const [isPending, startTransition] = useTransition()
  const { isOnline } = useOnlineStatus()
  const [optimisticState, applyOptimistic] = useOptimistic(
    state,
    (current, update: { dimension: CompletionDimension; value: boolean }) => ({
      ...current,
      [update.dimension]: update.value,
    })
  )

  function handleToggle(dimension: CompletionDimension, value: boolean) {
    startTransition(async () => {
      applyOptimistic({ dimension, value })
      const result = await updateTaskCompletion({ unit_id: unitId, dimension, value })

      if ('error' in result) {
        toast.error('Failed to save', result.error)
        return
      }
      if (result.data?.isComplete && value) {
        toast.success('Unit complete', unitName)
      }
      if (result.data?.revisionScheduled) {
        toast.success('Revision scheduled', 'First checkpoint in 3 days.')
      }
    })
  }

  const isDisabled = disabled || isPending || !isOnline

  return (
    <fieldset className="flex flex-wrap gap-x-4 gap-y-2" disabled={isDisabled}>
      <legend className="sr-only">{`Completion dimensions for ${unitName}`}</legend>
      {COMPLETION_DIMENSIONS.map((dimension) => {
        const inputId = `${unitId}-${dimension}`
        return (
          <label
            key={dimension}
            htmlFor={inputId}
            className="flex cursor-pointer items-center gap-2 text-xs data-[disabled=true]:cursor-not-allowed"
            data-disabled={isDisabled}
          >
            <Checkbox
              id={inputId}
              checked={optimisticState[dimension]}
              onCheckedChange={(checked) => handleToggle(dimension, checked === true)}
              disabled={isDisabled}
              aria-label={`${LABELS[dimension]} for ${unitName}`}
            />
            <span className={optimisticState[dimension] ? 'text-foreground' : 'text-muted-foreground'}>
              {LABELS[dimension]}
            </span>
          </label>
        )
      })}
    </fieldset>
  )
}
