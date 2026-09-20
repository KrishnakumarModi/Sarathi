import {
  Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart,
  PolarAngleAxis, PolarGrid, Radar, RadarChart, XAxis, YAxis,
} from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CHART_COLORS, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { cn } from '@/lib/utils'
import type { RoleWithReadiness } from '@/features/roles/lib/role-queries'
import type { PatternCoverage } from '@/features/dsa/lib/dsa-calculations'
import type { DailyHours } from '../lib/analytics-calculations'
import type { CurriculumSplit, SkillRadarPoint } from '../lib/analytics-queries'

function EmptyChart({ message }: { message: string }) {
  return (
    <div className="flex h-[220px] items-center justify-center rounded-md border border-dashed">
      <p className="max-w-xs text-center text-sm text-muted-foreground">{message}</p>
    </div>
  )
}

const CATEGORY_LABELS: Record<string, string> = {
  programming: 'Programming',
  'ml-frameworks': 'ML',
  'llm-stack': 'LLM',
  retrieval: 'Retrieval',
  'cloud-deployment': 'Cloud',
  mlops: 'MLOps',
  nlp: 'NLP',
  'math-stats': 'Maths',
  dsa: 'DSA',
  'cs-fundamentals': 'CS',
}

export function LearningVelocityChart({ data }: { data: DailyHours[] }) {
  const hasData = data.some((d) => d.hours > 0)

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Learning velocity</CardTitle>
        <CardDescription>Hours per day over the last 30 days.</CardDescription>
      </CardHeader>
      <CardContent>
        {!hasData ? (
          <EmptyChart message="No study sessions yet. Completing planned tasks records time automatically." />
        ) : (
          <ChartContainer className="h-[220px]">
            <LineChart data={data}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.3} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                fontSize={11}
                tickFormatter={(value: string) => value.slice(5)}
                minTickGap={24}
              />
              <YAxis tickLine={false} axisLine={false} fontSize={11} width={28} />
              <ChartTooltip content={<ChartTooltipContent formatter={(v) => `${v}h`} />} />
              <Line
                type="monotone"
                dataKey="hours"
                stroke={CHART_COLORS[0]}
                strokeWidth={2}
                dot={false}
                name="hours"
              />
            </LineChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}

export function SkillRadarChart({ data }: { data: SkillRadarPoint[] }) {
  const hasData = data.some((d) => d.mastery > 0)

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Skill coverage</CardTitle>
        <CardDescription>Average mastery per skill category.</CardDescription>
      </CardHeader>
      <CardContent>
        {!hasData ? (
          <EmptyChart message="Complete some curriculum units to see skill mastery." />
        ) : (
          <ChartContainer className="h-[260px]">
            <RadarChart
              data={data.slice(0, 8).map((d) => ({
                ...d,
                label: CATEGORY_LABELS[d.category] ?? d.category,
              }))}
            >
              <PolarGrid />
              <PolarAngleAxis dataKey="label" fontSize={11} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Radar
                dataKey="mastery"
                stroke={CHART_COLORS[0]}
                fill={CHART_COLORS[0]}
                fillOpacity={0.3}
                name="mastery"
              />
            </RadarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}

export function RoleReadinessChart({ roles }: { roles: RoleWithReadiness[] }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Role proximity</CardTitle>
        <CardDescription>Directional alignment with each targeted role.</CardDescription>
      </CardHeader>
      <CardContent>
        {roles.length === 0 ? (
          <EmptyChart message="Enable target roles in Roles to see proximity here." />
        ) : (
          <ChartContainer className="h-[260px]">
            <BarChart
              layout="vertical"
              data={roles.map((r) => ({ name: r.name, score: Math.round(r.readiness.score) }))}
              margin={{ left: 12, right: 12 }}
            >
              <CartesianGrid horizontal={false} strokeDasharray="3 3" opacity={0.3} />
              <XAxis type="number" domain={[0, 100]} tickLine={false} axisLine={false} fontSize={11} />
              <YAxis
                type="category"
                dataKey="name"
                tickLine={false}
                axisLine={false}
                fontSize={11}
                width={130}
              />
              <ChartTooltip content={<ChartTooltipContent formatter={(v) => `${v}%`} />} />
              <Bar dataKey="score" radius={[0, 4, 4, 0]} name="proximity">
                {roles.map((role, index) => (
                  <Cell
                    key={index}
                    fill={
                      role.readiness.score >= 70
                        ? 'hsl(160 84% 39%)'
                        : role.readiness.score >= 40
                          ? 'hsl(38 92% 50%)'
                          : 'hsl(0 84% 60%)'
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}

export function CurriculumDonut({ data }: { data: CurriculumSplit }) {
  const total = data.notStarted + data.inProgress + data.complete
  const segments = [
    { name: 'Complete', value: data.complete, color: 'hsl(160 84% 39%)' },
    { name: 'In progress', value: data.inProgress, color: 'hsl(38 92% 50%)' },
    { name: 'Not started', value: data.notStarted, color: 'hsl(var(--muted))' },
  ].filter((segment) => segment.value > 0)

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Curriculum</CardTitle>
        <CardDescription>
          {total > 0 ? `${data.complete} of ${total} units complete` : 'No curriculum loaded.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {total === 0 || segments.length === 0 ? (
          <EmptyChart message="Start a unit to see progress here." />
        ) : (
          <ChartContainer className="h-[220px]">
            <PieChart>
              <Pie
                data={segments}
                dataKey="value"
                nameKey="name"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={2}
              >
                {segments.map((segment, index) => (
                  <Cell key={index} fill={segment.color} />
                ))}
              </Pie>
              <ChartTooltip content={<ChartTooltipContent />} />
            </PieChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}

/**
 * DSA heatmap — a CSS grid, not a Recharts component
 * (05_DESIGN_SYSTEM.md explicitly requires this).
 */
export function DsaHeatmap({
  coverage,
  patternNames,
}: {
  coverage: PatternCoverage[]
  patternNames: Record<string, string>
}) {
  function cellClass(solved: number): string {
    if (solved === 0) return 'bg-muted'
    if (solved <= 2) return 'bg-amber-500/40'
    return 'bg-emerald-500/60'
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Pattern coverage</CardTitle>
        <CardDescription>
          Solving two or more problems in a pattern counts it toward role proximity.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {coverage.map((pattern) => (
            <div
              key={pattern.patternId}
              className={cn('rounded-md p-2 text-xs', cellClass(pattern.solved))}
              title={`${patternNames[pattern.patternId] ?? pattern.patternId}: ${pattern.solved} of ${pattern.total} solved`}
            >
              <div className="truncate font-medium">
                {patternNames[pattern.patternId] ?? pattern.patternId}
              </div>
              <div className="tabular-nums opacity-80">
                {pattern.solved}/{pattern.total}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="h-3 w-3 rounded bg-muted" /> none
          </span>
          <span className="flex items-center gap-1">
            <span className="h-3 w-3 rounded bg-amber-500/40" /> 1-2
          </span>
          <span className="flex items-center gap-1">
            <span className="h-3 w-3 rounded bg-emerald-500/60" /> 3+
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
