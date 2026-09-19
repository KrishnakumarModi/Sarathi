import { Lock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { formatMinutes } from '@/lib/utils'
import { CompletionToggles, type DimensionState } from './completion-toggles'
import { DifficultyBadge } from './difficulty-badge'
import { MasteryBadge } from './mastery-badge'
import type { UnitWithProgress } from '../types'

interface UnitCardProps {
  unit: UnitWithProgress
  /** Prerequisite unit id -> display name, for the locked tooltip. */
  unitNames: Record<string, string>
}

export function UnitCard({ unit, unitNames }: UnitCardProps) {
  const locked = !unit.unlock.isUnlocked
  const missing = unit.unlock.missingPrerequisites.map((id) => unitNames[id] ?? id)

  const state: DimensionState = {
    theory: unit.completion?.theory_complete ?? false,
    practice: unit.completion?.practice_complete ?? false,
    implementation: unit.completion?.implementation_complete ?? false,
    quiz: unit.completion?.quiz_complete ?? false,
    interview: unit.completion?.interview_complete ?? false,
    project: unit.completion?.project_complete ?? false,
  }

  return (
    <article
      id={`unit-${unit.id}`}
      data-locked={locked}
      className="content-auto rounded-md border p-3 transition-colors duration-200 hover:border-primary/30"
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            {locked ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span tabIndex={0} className="text-muted-foreground" aria-label="Locked">
                    <Lock className="h-3.5 w-3.5" />
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    Finish theory and practice for: {missing.join(', ')}
                  </p>
                </TooltipContent>
              </Tooltip>
            ) : null}
            <h4 className="truncate text-sm font-medium">{unit.name}</h4>
          </div>
          {locked ? (
            <p className="mt-0.5 text-xs text-muted-foreground">
              Locked until you finish: {missing.join(', ')}
            </p>
          ) : null}
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-1.5">
          <Badge variant="muted">{formatMinutes(unit.estimated_minutes)}</Badge>
          <DifficultyBadge level={unit.difficulty} />
          <MasteryBadge level={unit.masteryLevel} />
        </div>
      </div>

      <div className="mt-3">
        <CompletionToggles
          unitId={unit.id}
          unitName={unit.name}
          state={state}
          disabled={locked}
        />
      </div>
    </article>
  )
}
