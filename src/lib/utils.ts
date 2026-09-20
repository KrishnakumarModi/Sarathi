import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Clamp a number into [min, max]. */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

/** Percentage, guarded against a zero denominator. Returns 0, never NaN. */
export function percent(numerator: number, denominator: number): number {
  if (!denominator) return 0
  return (numerator / denominator) * 100
}

/** A date as YYYY-MM-DD in UTC — the format every DATE column uses. */
export function toDateString(date: Date = new Date()): string {
  return date.toISOString().slice(0, 10)
}

/** Add whole days to a YYYY-MM-DD string without tripping over local time. */
export function addDaysToDateString(dateStr: string, days: number): string {
  const d = new Date(`${dateStr}T00:00:00.000Z`)
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}

/** Whole days from `from` to `to` (negative when `to` is earlier). */
export function daysBetween(from: string, to: string): number {
  const a = Date.parse(`${from}T00:00:00.000Z`)
  const b = Date.parse(`${to}T00:00:00.000Z`)
  return Math.round((b - a) / 86_400_000)
}

/** Monday 00:00 UTC of the week containing `date`. */
export function getWeekStart(date: Date = new Date()): Date {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))
  const day = d.getUTCDay() // 0 = Sunday
  const diff = day === 0 ? 6 : day - 1
  d.setUTCDate(d.getUTCDate() - diff)
  return d
}

/** ISO-8601 week number and its year. */
export function getIsoWeek(date: Date = new Date()): { week: number; year: number } {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  const week = Math.ceil(((d.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7)
  return { week, year: d.getUTCFullYear() }
}

export function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes}m`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m ? `${h}h ${m}m` : `${h}h`
}

export function formatHours(hours: number): string {
  return hours >= 10 ? `${Math.round(hours)}h` : `${hours.toFixed(1)}h`
}

/**
 * Progress-bar threshold colours (05_DESIGN_SYSTEM.md).
 *
 * Lives here rather than beside the Progress component: that module is
 * `'use client'`, and a Server Component cannot call a function exported from
 * a client module — it may only render its components.
 */
export function progressColor(percent: number): string {
  if (percent >= 90) return 'bg-primary'
  if (percent >= 70) return 'bg-emerald-500'
  if (percent >= 40) return 'bg-amber-500'
  return 'bg-destructive'
}
