import { useMemo, useState } from 'react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { EmptyState } from '@/components/shared/empty-state'
import { SearchX } from 'lucide-react'
import { UnitCard } from './unit-card'
import type { DomainTree, UnitWithProgress } from '../types'
import { progressColor } from '@/lib/utils'

interface CurriculumTreeProps {
  domain: DomainTree
  unitNames: Record<string, string>
  initialOpenModuleId?: string
  filters: { difficulty?: number; status?: string; search?: string }
}

function matches(unit: UnitWithProgress, filters: CurriculumTreeProps['filters']): boolean {
  if (filters.difficulty !== undefined && unit.difficulty !== filters.difficulty) return false

  if (filters.status === 'not-started' && unit.masteryScore > 0) return false
  if (filters.status === 'complete' && !unit.completion?.completed_at) return false
  if (
    filters.status === 'in-progress' &&
    (unit.masteryScore === 0 || Boolean(unit.completion?.completed_at))
  ) {
    return false
  }

  if (filters.search) {
    const needle = filters.search.toLowerCase()
    if (!unit.name.toLowerCase().includes(needle)) return false
  }
  return true
}

function averageMastery(units: UnitWithProgress[]): number {
  if (units.length === 0) return 0
  return Math.round(units.reduce((sum, u) => sum + u.masteryScore, 0) / units.length)
}

export function CurriculumTree({
  domain,
  unitNames,
  initialOpenModuleId,
  filters,
}: CurriculumTreeProps) {
  const filtered = useMemo(() => {
    return domain.modules
      .map((module) => ({
        ...module,
        topics: module.topics
          .map((topic) => ({
            ...topic,
            subtopics: topic.subtopics
              .map((subtopic) => ({
                ...subtopic,
                units: subtopic.units.filter((unit) => matches(unit, filters)),
              }))
              .filter((subtopic) => subtopic.units.length > 0),
          }))
          .filter((topic) => topic.subtopics.length > 0),
      }))
      .filter((module) => module.topics.length > 0)
  }, [domain, filters])

  const [openModules, setOpenModules] = useState<string[]>(() =>
    initialOpenModuleId && filtered.some((module) => module.id === initialOpenModuleId)
      ? [initialOpenModuleId]
      : filtered.length > 0
        ? [filtered[0].id]
        : []
  )

  if (filtered.length === 0) {
    return (
      <EmptyState
        icon={SearchX}
        title="No units match your filters"
        description="Try clearing the difficulty, status, or search filters."
      />
    )
  }

  return (
    <Accordion
      type="multiple"
      value={openModules}
      onValueChange={setOpenModules}
      className="rounded-lg border px-4"
    >
      {filtered.map((module) => {
        const moduleUnits = module.topics.flatMap((t) => t.subtopics.flatMap((s) => s.units))
        const moduleMastery = averageMastery(moduleUnits)

        return (
          <AccordionItem key={module.id} value={module.id}>
            <AccordionTrigger>
              <div className="flex min-w-0 flex-1 items-center gap-3 pr-2">
                <span className="truncate font-semibold">{module.name}</span>
                <Badge variant="muted" className="shrink-0">
                  {moduleUnits.length} units
                </Badge>
                <div className="ml-auto hidden w-28 shrink-0 items-center gap-2 sm:flex">
                  <Progress
                    value={moduleMastery}
                    indicatorClassName={progressColor(moduleMastery)}
                    className="h-1.5"
                    aria-label={`${module.name} mastery`}
                  />
                  <span className="w-9 text-right text-xs tabular-nums text-muted-foreground">
                    {moduleMastery}%
                  </span>
                </div>
              </div>
            </AccordionTrigger>

            <AccordionContent>
              <div className="space-y-4 pl-1 sm:pl-3">
                {module.topics.map((topic) => (
                  <section key={topic.id} className="space-y-3">
                    <h3 className="text-sm font-semibold text-muted-foreground">{topic.name}</h3>
                    {topic.subtopics.map((subtopic) => (
                      <div key={subtopic.id} className="space-y-2 sm:pl-3">
                        <h4 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                          {subtopic.name}
                        </h4>
                        <div className="space-y-2">
                          {subtopic.units.map((unit) => (
                            <UnitCard key={unit.id} unit={unit} unitNames={unitNames} />
                          ))}
                        </div>
                      </div>
                    ))}
                  </section>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        )
      })}
    </Accordion>
  )
}
