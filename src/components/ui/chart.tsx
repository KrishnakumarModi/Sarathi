import * as React from 'react'
import { ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts'
import { cn } from '@/lib/utils'

/**
 * Thin Recharts wrapper. Every chart needs an explicit height, so the
 * container requires one rather than collapsing to zero
 * (05_DESIGN_SYSTEM.md).
 */
export interface ChartConfig {
  [key: string]: { label: string; color: string }
}

interface ChartContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  config?: ChartConfig
  children: React.ReactElement
}

export function ChartContainer({ className, children, ...props }: ChartContainerProps) {
  return (
    <div className={cn('h-[300px] w-full', className)} {...props}>
      <ResponsiveContainer width="100%" height="100%">
        {children}
      </ResponsiveContainer>
    </div>
  )
}

interface TooltipEntry {
  name?: string | number
  value?: string | number
  color?: string
  dataKey?: string | number
}

interface ChartTooltipContentProps {
  active?: boolean
  payload?: TooltipEntry[]
  label?: string | number
  formatter?: (value: string | number, name: string) => string
}

export function ChartTooltipContent({
  active,
  payload,
  label,
  formatter,
}: ChartTooltipContentProps) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-md border bg-popover px-3 py-2 text-xs shadow-md">
      {label !== undefined ? <div className="mb-1 font-medium">{label}</div> : null}
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-muted-foreground">{String(entry.name ?? entry.dataKey ?? '')}</span>
          <span className="ml-auto font-medium">
            {formatter && entry.value !== undefined
              ? formatter(entry.value, String(entry.name ?? ''))
              : String(entry.value ?? '')}
          </span>
        </div>
      ))}
    </div>
  )
}

export const ChartTooltip = RechartsTooltip
export const ChartLegend = Legend

/** The five chart colours defined in globals.css. */
export const CHART_COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
] as const
