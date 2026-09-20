import { useState } from 'react'
import { useRouter } from '@/hooks/use-navigation'
import { ArrowLeft, ArrowRight, Check, Loader2, Star } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { toast } from '@/components/ui/use-toast'
import { cn } from '@/lib/utils'
import type { RoleRow } from '@/types/database.types'
import { BASELINE_QUESTIONS } from '../lib/baseline-questions'
import { completeOnboarding } from '../api'

const STEPS = ['You', 'Direction', 'Capacity', 'Baseline'] as const
type Step = 0 | 1 | 2 | 3

interface OnboardingWizardProps {
  roles: RoleRow[]
  defaultName: string
  defaultTimezone: string
}

const TIER_LABELS: Record<string, string> = {
  A: 'Tier A · highest demand for this profile',
  B: 'Tier B · strong adjacent options',
  C: 'Tier C · specialised directions',
}

export function OnboardingWizard({ roles, defaultName, defaultTimezone }: OnboardingWizardProps) {
  const router = useRouter()
  const [step, setStep] = useState<Step>(0)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [displayName, setDisplayName] = useState(defaultName)
  const [timezone, setTimezone] = useState(defaultTimezone)
  const [goalMode, setGoalMode] = useState<'open' | 'targeted'>('targeted')
  const [roleIds, setRoleIds] = useState<string[]>([])
  const [primaryRoleId, setPrimaryRoleId] = useState<string | null>(null)
  const [timelineWeeks, setTimelineWeeks] = useState<number | null>(12)
  const [weeklyHours, setWeeklyHours] = useState(20)
  const [planningDays, setPlanningDays] = useState(6)
  const [baselineMode, setBaselineMode] = useState<'assessment' | 'fundamentals'>('assessment')
  const [baselineAnswers, setBaselineAnswers] = useState<Record<string, string>>({})

  function toggleRole(roleId: string) {
    setRoleIds((current) => {
      if (current.includes(roleId)) {
        if (primaryRoleId === roleId) setPrimaryRoleId(null)
        return current.filter((id) => id !== roleId)
      }
      if (current.length >= 5) {
        toast.warning('Five roles is the maximum', 'Focus beats breadth this early.')
        return current
      }
      // The first role picked becomes primary until the user says otherwise.
      if (current.length === 0) setPrimaryRoleId(roleId)
      return [...current, roleId]
    })
  }

  async function handleSubmit() {
    setPending(true)
    setError(null)

    const result = await completeOnboarding({
      displayName,
      timezone,
      goalMode,
      roleIds: goalMode === 'open' ? [] : roleIds,
      primaryRoleId: goalMode === 'open' ? null : primaryRoleId,
      timelineWeeks,
      weeklyHours,
      planningDays,
      baselineMode,
      baselineAnswers: baselineMode === 'assessment' ? baselineAnswers : {},
    })

    if ('error' in result) {
      setError(result.error)
      setPending(false)
      return
    }

    toast.success('You are set up', 'Generate your first plan whenever you are ready.')
    router.push('/today')
    router.refresh()
  }

  const canContinue =
    step === 0
      ? displayName.trim().length > 0
      : step === 1
        ? goalMode === 'open' || roleIds.length > 0
        : step === 2
          ? weeklyHours > 0
          : true

  const rolesByTier = (['A', 'B', 'C'] as const).map((tier) => ({
    tier,
    roles: roles.filter((r) => r.tier === tier),
  }))

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <Badge variant="muted">
            Step {step + 1} of {STEPS.length}
          </Badge>
          <span className="text-xs text-muted-foreground">{STEPS[step]}</span>
        </div>
        <Progress value={((step + 1) / STEPS.length) * 100} className="mt-2" />
        <CardTitle className="pt-2">
          {step === 0 && 'Tell us who you are'}
          {step === 1 && 'What are you aiming at?'}
          {step === 2 && 'How much time do you actually have?'}
          {step === 3 && 'Where are you starting from?'}
        </CardTitle>
        <CardDescription>
          {step === 0 && 'Used to personalise your plan. Nothing is shared.'}
          {step === 1 && 'Pick up to five roles, or explore without a target for now. You can change this any time.'}
          {step === 2 && 'Be honest rather than ambitious — the planner allocates against this number.'}
          {step === 3 && 'A quick self-assessment so you are not started on things you already know.'}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {step === 0 ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="onboarding-name">Name</Label>
              <Input
                id="onboarding-name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                autoComplete="name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="onboarding-timezone">Timezone</Label>
              <Input
                id="onboarding-timezone"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                placeholder="Asia/Kolkata"
              />
              <p className="text-xs text-muted-foreground">
                Your day boundary for plans and revision checkpoints.
              </p>
            </div>
          </div>
        ) : null}

        {step === 1 ? (
          <div className="space-y-5">
            <div className="grid gap-2 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setGoalMode('targeted')}
                aria-pressed={goalMode === 'targeted'}
                className={cn(
                  'rounded-md border p-3 text-left text-sm transition-colors',
                  goalMode === 'targeted' ? 'border-primary bg-primary/5' : 'hover:border-primary/40'
                )}
              >
                <span className="font-medium">I have roles in mind</span>
                <span className="mt-1 block text-xs text-muted-foreground">
                  Work is prioritised against those role profiles.
                </span>
              </button>
              <button
                type="button"
                onClick={() => setGoalMode('open')}
                aria-pressed={goalMode === 'open'}
                className={cn(
                  'rounded-md border p-3 text-left text-sm transition-colors',
                  goalMode === 'open' ? 'border-primary bg-primary/5' : 'hover:border-primary/40'
                )}
              >
                <span className="font-medium">I am still exploring</span>
                <span className="mt-1 block text-xs text-muted-foreground">
                  Start with broadly useful foundations. Add a target later.
                </span>
              </button>
            </div>

            {goalMode === 'targeted' ? (
              <div className="space-y-4">
                {rolesByTier.map(({ tier, roles: tierRoles }) => (
                  <fieldset key={tier} className="space-y-2">
                    <legend className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      {TIER_LABELS[tier]}
                    </legend>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {tierRoles.map((role) => {
                        const selected = roleIds.includes(role.id)
                        return (
                          <div
                            key={role.id}
                            className={cn(
                              'rounded-md border p-3 transition-colors',
                              selected ? 'border-primary bg-primary/5' : 'hover:border-primary/40'
                            )}
                          >
                            <button
                              type="button"
                              onClick={() => toggleRole(role.id)}
                              aria-pressed={selected}
                              className="w-full text-left"
                            >
                              <span className="flex items-center gap-2 text-sm font-medium">
                                {selected ? <Check className="h-3.5 w-3.5 text-primary" /> : null}
                                {role.name}
                              </span>
                              <span className="mt-1 block text-xs text-muted-foreground">
                                {role.description}
                              </span>
                            </button>
                            {selected ? (
                              <button
                                type="button"
                                onClick={() => setPrimaryRoleId(role.id)}
                                aria-label={`Set ${role.name} as primary role`}
                                aria-pressed={primaryRoleId === role.id}
                                className={cn(
                                  'mt-2 flex items-center gap-1 text-xs',
                                  primaryRoleId === role.id
                                    ? 'text-primary'
                                    : 'text-muted-foreground hover:text-foreground'
                                )}
                              >
                                <Star
                                  className={cn('h-3 w-3', primaryRoleId === role.id && 'fill-current')}
                                />
                                {primaryRoleId === role.id ? 'Primary role' : 'Make primary'}
                              </button>
                            ) : null}
                          </div>
                        )
                      })}
                    </div>
                  </fieldset>
                ))}
              </div>
            ) : null}

            <div className="space-y-2">
              <Label htmlFor="onboarding-timeline">Target timeline (weeks, optional)</Label>
              <Input
                id="onboarding-timeline"
                type="number"
                min={1}
                max={104}
                value={timelineWeeks ?? ''}
                onChange={(e) =>
                  setTimelineWeeks(e.target.value === '' ? null : Number(e.target.value))
                }
              />
            </div>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="onboarding-hours">Hours available each week</Label>
              <Input
                id="onboarding-hours"
                type="number"
                min={1}
                max={100}
                step={0.5}
                value={weeklyHours}
                onChange={(e) => setWeeklyHours(Number(e.target.value))}
              />
              <p className="text-xs text-muted-foreground">
                Change this whenever life changes. Future days re-balance; finished work never moves.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="onboarding-days">Days a week you plan to study</Label>
              <Select
                value={String(planningDays)}
                onValueChange={(value) => setPlanningDays(Number(value))}
              >
                <SelectTrigger id="onboarding-days">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7].map((days) => (
                    <SelectItem key={days} value={String(days)}>
                      {days} {days === 1 ? 'day' : 'days'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="rounded-md bg-muted p-3 text-sm">
              That is roughly{' '}
              <span className="font-medium tabular-nums">
                {Math.floor((weeklyHours * 60) / planningDays)} minutes
              </span>{' '}
              of planned work per study day.
            </div>
          </div>
        ) : null}

        {step === 3 ? (
          <div className="space-y-5">
            <div className="grid gap-2 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setBaselineMode('assessment')}
                aria-pressed={baselineMode === 'assessment'}
                className={cn(
                  'rounded-md border p-3 text-left text-sm transition-colors',
                  baselineMode === 'assessment' ? 'border-primary bg-primary/5' : 'hover:border-primary/40'
                )}
              >
                <span className="font-medium">Quick self-assessment</span>
                <span className="mt-1 block text-xs text-muted-foreground">
                  Ten questions. Skips things you already know.
                </span>
              </button>
              <button
                type="button"
                onClick={() => setBaselineMode('fundamentals')}
                aria-pressed={baselineMode === 'fundamentals'}
                className={cn(
                  'rounded-md border p-3 text-left text-sm transition-colors',
                  baselineMode === 'fundamentals' ? 'border-primary bg-primary/5' : 'hover:border-primary/40'
                )}
              >
                <span className="font-medium">Start from fundamentals</span>
                <span className="mt-1 block text-xs text-muted-foreground">
                  Begin at the beginning, no questions asked.
                </span>
              </button>
            </div>

            {baselineMode === 'assessment' ? (
              <div className="space-y-4">
                {BASELINE_QUESTIONS.map((question) => (
                  <div key={question.id} className="space-y-2">
                    <Label htmlFor={question.id}>{question.prompt}</Label>
                    <Select
                      value={baselineAnswers[question.id] ?? ''}
                      onValueChange={(value) =>
                        setBaselineAnswers((current) => ({ ...current, [question.id]: value }))
                      }
                    >
                      <SelectTrigger id={question.id}>
                        <SelectValue placeholder="Choose one" />
                      </SelectTrigger>
                      <SelectContent>
                        {question.options.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
                <p className="text-xs text-muted-foreground">
                  Unanswered questions are treated as no evidence, not as zero skill.
                </p>
              </div>
            ) : null}
          </div>
        ) : null}

        {error ? (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        ) : null}

        <div className="flex items-center justify-between gap-2 pt-2">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setStep((s) => Math.max(0, s - 1) as Step)}
            disabled={step === 0 || pending}
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>

          {step < 3 ? (
            <Button
              type="button"
              onClick={() => setStep((s) => Math.min(3, s + 1) as Step)}
              disabled={!canContinue}
            >
              Continue
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button type="button" onClick={handleSubmit} disabled={pending} id="finish-onboarding">
              {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {pending ? 'Setting up...' : 'Finish setup'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
