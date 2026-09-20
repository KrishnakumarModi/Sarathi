/**
 * Minimal toast store. Durations follow 05_DESIGN_SYSTEM.md:
 * 3s for success, 5s for errors.
 */

import * as React from 'react'
import { TOAST_ERROR_MS, TOAST_SUCCESS_MS } from '@/lib/constants'

export type ToastVariant = 'default' | 'success' | 'warning' | 'destructive'

export interface ToastData {
  id: string
  title: string
  description?: string
  variant: ToastVariant
  duration: number
}

type Listener = (toasts: ToastData[]) => void

let toasts: ToastData[] = []
const listeners = new Set<Listener>()
let counter = 0

function emit() {
  for (const listener of listeners) listener(toasts)
}

function dismiss(id: string) {
  toasts = toasts.filter((t) => t.id !== id)
  emit()
}

interface ToastInput {
  title: string
  description?: string
  variant?: ToastVariant
  duration?: number
}

export function toast({ title, description, variant = 'default', duration }: ToastInput) {
  counter += 1
  const id = `toast-${counter}`
  const resolvedDuration =
    duration ?? (variant === 'destructive' ? TOAST_ERROR_MS : TOAST_SUCCESS_MS)

  toasts = [...toasts, { id, title, description, variant, duration: resolvedDuration }]
  emit()
  return { id, dismiss: () => dismiss(id) }
}

toast.success = (title: string, description?: string) =>
  toast({ title, description, variant: 'success' })
toast.error = (title: string, description?: string) =>
  toast({ title, description, variant: 'destructive' })
toast.warning = (title: string, description?: string) =>
  toast({ title, description, variant: 'warning' })

export function useToast() {
  const [current, setCurrent] = React.useState<ToastData[]>(toasts)

  React.useEffect(() => {
    listeners.add(setCurrent)
    setCurrent(toasts)
    return () => {
      listeners.delete(setCurrent)
    }
  }, [])

  return { toasts: current, toast, dismiss }
}
