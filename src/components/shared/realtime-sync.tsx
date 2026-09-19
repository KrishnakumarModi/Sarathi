import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'

import { useOnlineStatus } from '@/hooks/use-online-status'

/** How often a watched page re-reads its data while it is visible. */
const SYNC_INTERVAL_MS = 30_000

interface RealtimeSyncProps {
  /** Kept for call-site compatibility; the token already identifies the user. */
  userId?: string
  /** The tables this page's data depends on. Documentation now, not channels. */
  tables: string[]
}

/**
 * Keeps the page's data fresh.
 *
 * The Supabase build held a WebSocket per page and called `router.refresh()`
 * on every change. With a REST backend there is no such socket, so the same
 * guarantee — "what you see reflects what is stored" — is met by re-reading
 * on an interval and whenever the tab regains focus. The reads are cheap:
 * the backend serves these view models from Redis.
 *
 * It deliberately keeps no duplicate client state; the server's view model
 * is still the single source of truth.
 */
export function RealtimeSync({ tables }: RealtimeSyncProps) {
  const queryClient = useQueryClient()
  const { isOnline } = useOnlineStatus()

  useEffect(() => {
    if (tables.length === 0 || !isOnline) return

    function sync() {
      // Only refetch what is actually mounted; a background tab does nothing.
      if (document.visibilityState !== 'visible') return
      void queryClient.invalidateQueries({ refetchType: 'active' })
    }

    const interval = window.setInterval(sync, SYNC_INTERVAL_MS)
    document.addEventListener('visibilitychange', sync)
    return () => {
      window.clearInterval(interval)
      document.removeEventListener('visibilitychange', sync)
    }
    // `tables` is a literal array at each call site, so join it for a stable key.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tables.join(','), isOnline, queryClient])

  return null
}
