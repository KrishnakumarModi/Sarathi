import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CHART_COLORS, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'

interface WeeklyHoursChartProps {
  data: Array<{ category: string; hours: number }>
}

const CATEGORY_LABELS: Record<string, string> = {
  'ai-ml': 'AI/ML',
  dsa: 'DSA',
  cs: 'CS',
  aptitude: 'Aptitude',
  project: 'Project',
  career: 'Career',
  review: 'Revision',
}

export function WeeklyHoursChart({ data }: WeeklyHoursChartProps) {
  const total = data.reduce((sum, item) => sum + item.hours, 0)

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Hours this week</CardTitle>
        <CardDescription>
          {total > 0 ? `${total.toFixed(1)} hours logged` : 'No sessions logged yet this week.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {total === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Completing a planned task records time automatically.
          </p>
        ) : (
          <ChartContainer className="h-[220px]">
            <BarChart
              data={data.map((item) => ({
                ...item,
                label: CATEGORY_LABELS[item.category] ?? item.category,
              }))}
            >
              <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={11} />
              <YAxis tickLine={false} axisLine={false} fontSize={11} width={28} />
              <ChartTooltip
                content={<ChartTooltipContent formatter={(value) => `${value}h`} />}
              />
              <Bar dataKey="hours" fill={CHART_COLORS[0]} radius={[4, 4, 0, 0]} name="hours" />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
