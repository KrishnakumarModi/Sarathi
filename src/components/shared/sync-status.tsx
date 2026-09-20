import { useIsFetching, useIsMutating } from '@tanstack/react-query'

import { useOnlineStatus } from '@/hooks/use-online-status'
import { cn } from '@/lib/utils'

type Status = 'connected' | 'connecting' | 'disconnected'

/**
 * Connection health.
 *
 * Under Supabase this watched a realtime channel. It now reflects what the
 * user actually cares about: whether the browser is online, and whether a
 * read or write is in flight right now.
 */
export function SyncStatus() {
  const { isOnline } = useOnlineStatus()
  const fetching = useIsFetching()
  const mutating = useIsMutating()

  const effective: Status = !isOnline
    ? 'disconnected'
    : fetching + mutating > 0
      ? 'connecting'
      : 'connected'

  const label =
    effective === 'connected' ? 'Synced' : effective === 'connecting' ? 'Syncing...' : 'Offline'

  return (
    <div className="flex items-center gap-1.5 text-xs" role="status" aria-live="polite">
      <span
        aria-hidden
        className={cn(
          'h-2 w-2 rounded-full',
          effective === 'connected' && 'bg-emerald-500',
          effective === 'connecting' && 'animate-pulse bg-amber-500',
          effective === 'disconnected' && 'bg-destructive'
        )}
      />
      <span className="hidden text-muted-foreground sm:inline">{label}</span>
      <span className="sr-only">{`Connection status: ${label}`}</span>
    </div>
  )
}
