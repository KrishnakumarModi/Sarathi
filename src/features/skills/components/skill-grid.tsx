import { useMemo, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { cn, progressColor } from '@/lib/utils'
import { MasteryBadge } from '@/features/curriculum/components/mastery-badge'
import type { SkillWithMasteryView } from '../lib/skill-queries'

const EVIDENCE_LABELS: Record<string, string> = {
  completion: 'curriculum',
  assessment: 'assessment',
  applied_work: 'applied work',
  project: 'project',
  interview: 'interview',
  revision: 'revision',
}

const CATEGORY_LABELS: Record<string, string> = {
  programming: 'Programming',
  'ml-frameworks': 'ML frameworks',
  'llm-stack': 'LLM stack',
  retrieval: 'Retrieval',
  'cloud-deployment': 'Cloud & deployment',
  mlops: 'MLOps',
  nlp: 'NLP',
  'math-stats': 'Maths & stats',
  dsa: 'DSA',
  'cs-fundamentals': 'CS fundamentals',
}

interface SkillGridProps {
  skills: SkillWithMasteryView[]
  categories: string[]
  enabledRoleIds: string[]
}

export function SkillGrid({ skills, categories, enabledRoleIds }: SkillGridProps) {
  const [category, setCategory] = useState<string | null>(null)
  const [onlyTargeted, setOnlyTargeted] = useState(enabledRoleIds.length > 0)

  const filtered = useMemo(
    () =>
      skills.filter((skill) => {
        if (category && skill.category !== category) return false
        if (onlyTargeted && enabledRoleIds.length > 0) {
          return skill.roles.some((role) => enabledRoleIds.includes(role.roleId))
        }
        return true
      }),
    [skills, category, onlyTargeted, enabledRoleIds]
  )

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant={category === null ? 'default' : 'outline'}
          size="sm"
          onClick={() => setCategory(null)}
        >
          All
        </Button>
        {categories.map((value) => (
          <Button
            key={value}
            variant={category === value ? 'default' : 'outline'}
            size="sm"
            onClick={() => setCategory(value)}
          >
            {CATEGORY_LABELS[value] ?? value}
          </Button>
        ))}
        {enabledRoleIds.length > 0 ? (
          <Button
            variant={onlyTargeted ? 'secondary' : 'ghost'}
            size="sm"
            className="ml-auto"
            onClick={() => setOnlyTargeted((current) => !current)}
            aria-pressed={onlyTargeted}
          >
            {onlyTargeted ? 'Showing role-relevant only' : 'Showing all skills'}
          </Button>
        ) : null}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((skill) => (
          <Card key={skill.id} className="content-auto">
            <CardContent className="space-y-3 p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="truncate text-sm font-medium">{skill.name}</h3>
                  {skill.description ? (
                    <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                      {skill.description}
                    </p>
                  ) : null}
                </div>
                <MasteryBadge level={skill.masteryLevel} />
              </div>

              <div className="space-y-1.5">
                <Progress
                  value={skill.masteryScore}
                  indicatorClassName={progressColor(skill.masteryScore)}
                  aria-label={`${skill.name} mastery`}
                />
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="tabular-nums">{Math.round(skill.masteryScore)}%</span>
                  {skill.freshnessDays !== null ? (
                    <span
                      className={cn(
                        skill.freshnessDays > 60 && 'text-amber-600 dark:text-amber-400'
                      )}
                    >
                      last evidence {skill.freshnessDays}d ago
                    </span>
                  ) : (
                    <span>no evidence yet</span>
                  )}
                </div>
              </div>

              {skill.evidence.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {skill.evidence.map((item) => (
                    <Badge key={item.sourceType} variant="muted">
                      {EVIDENCE_LABELS[item.sourceType] ?? item.sourceType} ×{item.count}
                    </Badge>
                  ))}
                </div>
              ) : null}

              {skill.roles.length > 0 ? (
                <div className="flex flex-wrap gap-1 border-t pt-2">
                  {skill.roles.slice(0, 3).map((role) => (
                    <Badge
                      key={role.roleId}
                      variant={role.isCritical ? 'warning' : 'outline'}
                      title={`${role.roleName}: weight ${role.weight}${role.isCritical ? ', critical' : ''}`}
                    >
                      {role.roleName} {role.weight}
                    </Badge>
                  ))}
                  {skill.roles.length > 3 ? (
                    <Badge variant="muted">+{skill.roles.length - 3}</Badge>
                  ) : null}
                </div>
              ) : null}
            </CardContent>
          </Card>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
          No skills match this filter.
        </p>
      ) : null}
    </div>
  )
}
