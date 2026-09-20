import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  BookOpen, CalendarCheck, Clock, Code, Flame, Layers, RefreshCw, Rocket, Send,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useDocumentTitle } from '@/components/shared/document-title'
import { EmptyState } from '@/components/shared/empty-state'
import { PageHeader } from '@/components/shared/page-header'
import { QueryBoundary } from '@/components/shared/query-boundary'
import { RealtimeSync } from '@/components/shared/realtime-sync'
import { StatCard } from '@/components/shared/stat-card'
import { FocusAreas } from '@/features/dashboard/components/focus-areas'
import { NextActionCard } from '@/features/dashboard/components/next-action-card'
import { RoleReadinessSection } from '@/features/dashboard/components/role-readiness-section'
import { WeeklyHoursChart } from '@/features/dashboard/components/weekly-hours-chart'
import { fetchDashboard } from '@/features/dashboard/api'
import { formatHours, formatMinutes } from '@/lib/utils'
import { XPBar } from '@/features/gamification/components/xp-bar'
import { DashboardSkeleton } from './skeletons/dashboard'

// Three tables at most, as the sync budget requires.
const REALTIME_TABLES = ['task_completions', 'daily_tasks', 'skill_mastery']

import { useState, useEffect } from 'react'

function useGreeting(): string {
  const [greeting, setGreeting] = useState(() => getGreetingText())

  useEffect(() => {
    const interval = setInterval(() => {
      setGreeting(getGreetingText())
    }, 60000)
    return () => clearInterval(interval)
  }, [])

  return greeting
}

function getGreetingText(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  if (hour < 21) return 'Good evening'
  return 'Good night'
}

export default function DashboardPage() {
  useDocumentTitle('Dashboard')
  const greetingText = useGreeting()
  const query = useQuery({
    queryKey: ['dashboard'],
    queryFn: ({ signal }) => fetchDashboard(signal),
  })

  return (
    <QueryBoundary query={query} skeleton={<DashboardSkeleton />}>
      {(data) => {
        if (!data.profile || data.profile.onboarding_status !== 'complete') {
          return (
            <div className="space-y-6">
              <PageHeader title={greetingText} />
              <EmptyState
                icon={Rocket}
                title="Let's get you set up"
                description="Four short steps: who you are, what you are aiming at, how much time you have, and where you are starting from."
                action={{ label: 'Start setup', href: '/onboarding' }}
              />
            </div>
          )
        }

        const name = data.profile.display_name?.split(' ')[0] ?? 'there'

        return (
          <div className="space-y-6">
            <RealtimeSync tables={REALTIME_TABLES} />

            <section className="hero-glow relative isolate overflow-hidden rounded-2xl px-5 py-7 text-white shadow-xl shadow-primary/15 sm:px-8 sm:py-9">
              <div className="absolute inset-y-0 right-0 -z-10 w-full sm:w-[58%]">
                <img
                  src="/images/ai-career-hero.png"
                  alt=""
                  loading="eager"
                  decoding="async"
                  className="h-full w-full object-cover object-[75%_center] opacity-65 mix-blend-screen"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[hsl(247_70%_22%)] via-[hsl(247_70%_22%/0.68)] to-transparent" />
              </div>
              <div className="relative max-w-xl">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
                  Your learning cockpit
                </p>
                <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">{`${greetingText}, ${name}`}</h1>
                <p className="mt-2 max-w-md text-sm leading-6 text-white/80">
                  {data.today.hasPlan
                    ? `${data.today.completed} of ${data.today.planned} tasks done today · ${formatMinutes(data.today.remainingMinutes)} left`
                    : 'Build momentum with one focused step today.'}
                </p>
                <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium backdrop-blur-sm">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-300" />
                  Progress sync is on
                </div>
              </div>
            </section>

            <XPBar />

            <NextActionCard action={data.nextAction} />

            {/* What to learn, what to revise, what is pending — in that order. */}
            <div className="grid gap-4 sm:grid-cols-3">
              <Card className="group overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-sm font-medium">
                    <span className="rounded-lg bg-violet-500/10 p-1.5 text-violet-600 dark:text-violet-300">
                      <CalendarCheck className="h-4 w-4" aria-hidden />
                    </span>
                    Today
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold tabular-nums">
                    {data.today.completed}
                    <span className="text-base font-normal text-muted-foreground">
                      /{data.today.planned}
                    </span>
                  </div>
                  <Button variant="link" size="sm" asChild className="h-auto p-0 text-xs">
                    <Link to="/today">{data.today.hasPlan ? 'Open plan' : 'Generate a plan'}</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="group overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-sm font-medium">
                    <span className="rounded-lg bg-sky-500/10 p-1.5 text-sky-600 dark:text-sky-300">
                      <RefreshCw className="h-4 w-4" aria-hidden />
                    </span>
                    Revision due
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold tabular-nums">{data.dueRevisionCount}</div>
                  <Button variant="link" size="sm" asChild className="h-auto p-0 text-xs">
                    <Link to="/revision">
                      {data.dueRevisionCount > 0 ? 'Start reviewing' : 'Nothing due'}
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="group overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-sm font-medium">
                    <span className="rounded-lg bg-amber-500/10 p-1.5 text-amber-600 dark:text-amber-300">
                      <Layers className="h-4 w-4" aria-hidden />
                    </span>
                    Pending
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold tabular-nums">{data.backlog.size}</div>
                  <p className="text-xs text-muted-foreground">
                    {data.backlog.size === 0
                      ? 'Nothing carried over'
                      : `oldest ${data.backlog.oldestAgeDays}d · ${formatMinutes(data.backlog.totalMinutes)} to clear`}
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              <div className="space-y-4 lg:col-span-2">
                <RoleReadinessSection roles={data.roleReadiness} skillNames={data.skillNames} />
                <WeeklyHoursChart data={data.weeklyHoursByCategory} />
              </div>

              <div className="space-y-4">
                <FocusAreas weaknesses={data.weakSkills} skillNames={data.skillNames} />

                <Card className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Quick links</CardTitle>
                    <CardDescription>Jump straight in.</CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-2">
                    {[
                      { href: '/curriculum', label: 'Browse curriculum' },
                      { href: '/dsa', label: 'DSA patterns' },
                      { href: '/applications', label: 'Add an application' },
                      { href: '/analytics', label: 'See the trends' },
                    ].map((link) => (
                      <Button
                        key={link.href}
                        variant="outline"
                        size="sm"
                        asChild
                        className="justify-start rounded-lg border-border/80 hover:border-primary/30 hover:bg-primary/5"
                      >
                        <Link to={link.href}>{link.label}</Link>
                      </Button>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Context, deliberately below the actionable half of the page. */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <StatCard
                label="Streak"
                value={`${data.streak}d`}
                icon={Flame}
                hint={data.streak === 0 ? 'Complete a unit to start one' : undefined}
              />
              <StatCard label="Hours logged" value={formatHours(data.totalHours)} icon={Clock} />
              <StatCard
                label="Curriculum"
                value={`${Math.round(data.curriculum.percent)}%`}
                icon={BookOpen}
                hint={`${data.curriculum.completed} of ${data.curriculum.total} units`}
              />
              <StatCard
                label="Problems solved"
                value={data.dsa.solved}
                icon={Code}
                hint={`${data.dsa.independent} unaided`}
              />
              <StatCard
                label="Applications"
                value={data.applicationsThisWeek}
                icon={Send}
                hint="this week"
              />
            </div>
          </div>
        )
      }}
    </QueryBoundary>
  )
}
