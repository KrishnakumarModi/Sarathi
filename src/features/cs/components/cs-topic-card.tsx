import { useOptimistic, useState, useTransition } from 'react'
import { ChevronDown, Star } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from '@/components/ui/use-toast'
import { cn } from '@/lib/utils'
import { useOnlineStatus } from '@/hooks/use-online-status'
import type { CsQuestionRow, Importance } from '@/types/database.types'
import { calculateTopicCompleteness, getCompletenessColor, type CSTopicWithMastery } from '../lib/cs-calculations'
import { updateCsConfidence, updateCsMastery } from '../api'
import type { CsMasteryField } from '../validators'

const FIELDS: Array<{ key: CsMasteryField; label: string }> = [
  { key: 'concept_understood', label: 'Concept' },
  { key: 'questions_practiced', label: 'Practice' },
  { key: 'quiz_passed', label: 'Quiz' },
  { key: 'interview_ready', label: 'Interview' },
]

const IMPORTANCE_VARIANT: Record<Importance, 'destructive' | 'warning' | 'info' | 'muted'> = {
  critical: 'destructive',
  high: 'warning',
  medium: 'info',
  low: 'muted',
}

interface CsTopicCardProps {
  topic: CSTopicWithMastery
  questions: CsQuestionRow[]
}

export function CsTopicCard({ topic, questions }: CsTopicCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [isPending, startTransition] = useTransition()
  const { isOnline } = useOnlineStatus()
  const [optimistic, applyOptimistic] = useOptimistic(
    topic,
    (current, update: Partial<CSTopicWithMastery>) => ({ ...current, ...update })
  )

  const completeness = calculateTopicCompleteness(optimistic)
  const disabled = isPending || !isOnline

  function toggle(field: CsMasteryField, value: boolean) {
    startTransition(async () => {
      applyOptimistic({ [field]: value })
      const result = await updateCsMastery({ topic_id: topic.id, field, value })
      if ('error' in result) toast.error('Failed to save', result.error)
    })
  }

  function setConfidence(confidence: number) {
    startTransition(async () => {
      applyOptimistic({ confidence })
      const result = await updateCsConfidence({ topic_id: topic.id, confidence })
      if ('error' in result) toast.error('Failed to save', result.error)
    })
  }

  return (
    <article
      className={cn(
        'content-auto space-y-3 rounded-md border border-l-4 p-3 transition-colors',
        getCompletenessColor(completeness)
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h3 className="text-sm font-medium">{topic.name}</h3>
        <div className="flex shrink-0 items-center gap-1.5">
          <Badge variant={IMPORTANCE_VARIANT[topic.importance]} className="capitalize">
            {topic.importance}
          </Badge>
          <Badge variant="outline">Difficulty {topic.difficulty}</Badge>
        </div>
      </div>

      <fieldset className="flex flex-wrap gap-x-4 gap-y-2" disabled={disabled}>
        <legend className="sr-only">{`Mastery dimensions for ${topic.name}`}</legend>
        {FIELDS.map(({ key, label }) => (
          <label
            key={key}
            htmlFor={`${topic.id}-${key}`}
            className="flex cursor-pointer items-center gap-2 text-xs"
          >
            <Checkbox
              id={`${topic.id}-${key}`}
              checked={optimistic[key]}
              onCheckedChange={(checked) => toggle(key, checked === true)}
              disabled={disabled}
              aria-label={`${label} for ${topic.name}`}
            />
            <span className={optimistic[key] ? 'text-foreground' : 'text-muted-foreground'}>
              {label}
            </span>
          </label>
        ))}
      </fieldset>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1" role="group" aria-label={`Confidence for ${topic.name}`}>
          <span className="mr-1 text-xs text-muted-foreground">Confidence</span>
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setConfidence(value)}
              disabled={disabled}
              aria-label={`Set confidence to ${value} of 5`}
              aria-pressed={(optimistic.confidence ?? 0) >= value}
              className="rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Star
                className={cn(
                  'h-3.5 w-3.5',
                  (optimistic.confidence ?? 0) >= value
                    ? 'fill-amber-400 text-amber-400'
                    : 'text-muted-foreground'
                )}
              />
            </button>
          ))}
        </div>

        {questions.length > 0 ? (
          <button
            type="button"
            onClick={() => setExpanded((current) => !current)}
            aria-expanded={expanded}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            {questions.length} question{questions.length === 1 ? '' : 's'}
            <ChevronDown className={cn('h-3.5 w-3.5 transition-transform', expanded && 'rotate-180')} />
          </button>
        ) : null}
      </div>

      {expanded ? (
        <ol className="space-y-2 border-t pt-3">
          {questions.map((question) => (
            <li key={question.id} className="text-xs">
              <p className="font-medium">{question.question}</p>
              {question.answer_summary ? (
                <p className="mt-0.5 text-muted-foreground">{question.answer_summary}</p>
              ) : null}
            </li>
          ))}
        </ol>
      ) : null}
    </article>
  )
}
