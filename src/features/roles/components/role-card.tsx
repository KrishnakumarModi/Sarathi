import { useTransition } from 'react'
import { Info, Star } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { toast } from '@/components/ui/use-toast'
import { cn } from '@/lib/utils'
import { PROXIMITY_DESCRIPTIONS } from '../lib/readiness-calculator'
import type { RoleWithReadiness } from '../lib/role-queries'
import { setPrimaryRole, toggleRole } from '../api'
import { ReadinessBar } from './readiness-bar'

const TIER_VARIANT = { A: 'default', B: 'info', C: 'muted' } as const

interface RoleCardProps {
  role: RoleWithReadiness
  skillNames: Record<string, string>
}

export function RoleCard({ role, skillNames }: RoleCardProps) {
  const [isPending, startTransition] = useTransition()

  function handleToggle(enabled: boolean) {
    startTransition(async () => {
      const result = await toggleRole({ role_id: role.id, enabled })
      if ('error' in result) toast.error('Could not update role', result.error)
    })
  }

  function handleSetPrimary() {
    startTransition(async () => {
      const result = await setPrimaryRole({ role_id: role.id })
      if ('error' in result) {
        toast.error('Could not set primary role', result.error)
        return
      }
      toast.success('Primary role updated', role.name)
    })
  }

  return (
    <Card className={cn('flex h-full flex-col', role.isPrimary && 'border-primary/50')}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <CardTitle className="text-base">{role.name}</CardTitle>
            <CardDescription className="mt-1 line-clamp-2">{role.description}</CardDescription>
          </div>
          <Badge variant={TIER_VARIANT[role.tier]} className="shrink-0">
            Tier {role.tier}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-3">
        <ReadinessBar label={role.readiness.label} score={role.readiness.score} />

        <p className="text-xs text-muted-foreground">
          {PROXIMITY_DESCRIPTIONS[role.readiness.label]}
        </p>

        {role.readiness.isCapped ? (
          <p className="rounded-md bg-amber-500/10 p-2 text-xs text-amber-700 dark:text-amber-400">
            Held at 50% while a critical skill is below 40.
          </p>
        ) : null}

        <div className="flex flex-wrap gap-1">
          {role.core_skills.slice(0, 5).map((skillId) => (
            <Badge key={skillId} variant="muted">
              {skillNames[skillId] ?? skillId}
            </Badge>
          ))}
        </div>

        {role.readiness.nextAction ? (
          <div className="flex items-start gap-1.5 rounded-md bg-muted p-2 text-xs">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden />
            <span>{role.readiness.nextAction}</span>
          </div>
        ) : null}

        {role.readiness.gaps.length > 0 ? (
          <details className="text-xs">
            <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
              What this score is made of
            </summary>
            <div className="mt-2 space-y-1.5">
              {(
                [
                  ['Technical skills', role.readiness.contributions.technical, 50],
                  ['DSA', role.readiness.contributions.dsa, 15],
                  ['CS fundamentals', role.readiness.contributions.cs, 10],
                  ['Project evidence', role.readiness.contributions.projects, 15],
                  ['Interview practice', role.readiness.contributions.interview, 10],
                ] as const
              ).map(([label, value, max]) => (
                <div key={label} className="flex justify-between text-muted-foreground">
                  <span>{label}</span>
                  <span className="tabular-nums">
                    {value.toFixed(1)} / {max}
                  </span>
                </div>
              ))}
              <div className="pt-1">
                <span className="text-muted-foreground">Top gaps: </span>
                {role.readiness.gaps.slice(0, 3).map((gap) => (
                  <Badge key={gap.skill_id} variant="outline" className="mr-1">
                    {skillNames[gap.skill_id] ?? gap.skill_id} +{gap.potentialGain.toFixed(1)}
                  </Badge>
                ))}
              </div>
            </div>
          </details>
        ) : null}

        <div className="mt-auto flex items-center justify-between gap-2 border-t pt-3">
          <label htmlFor={`role-toggle-${role.id}`} className="flex items-center gap-2 text-sm">
            <Switch
              id={`role-toggle-${role.id}`}
              checked={role.isEnabled}
              disabled={isPending}
              onCheckedChange={handleToggle}
              aria-checked={role.isEnabled}
            />
            Target this role
          </label>

          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={handleSetPrimary}
                disabled={isPending || !role.isEnabled}
                aria-label="Set as primary role"
                aria-pressed={role.isPrimary}
                className={cn(
                  'rounded p-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-40',
                  role.isPrimary ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <Star className={cn('h-4 w-4', role.isPrimary && 'fill-current')} />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              {role.isPrimary
                ? 'This is your primary target'
                : role.isEnabled
                  ? 'Set as primary role'
                  : 'Enable the role first'}
            </TooltipContent>
          </Tooltip>
        </div>
      </CardContent>
    </Card>
  )
}
