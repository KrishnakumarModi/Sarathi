import { QueryClient } from '@tanstack/react-query'

import { ApiError } from './api-client'

/**
 * One client for the app.
 *
 * `staleTime` of 30s plus refetch-on-focus is what replaces Supabase
 * Realtime: coming back to the tab, or finishing a mutation, re-reads the
 * view models rather than holding a WebSocket open per page. The backend
 * caches those reads in Redis, so a refetch is cheap.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 5 * 60_000,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      retry: (failureCount, error) => {
        // Never retry an auth failure: the refresh interceptor has already
        // had its turn, and a retry loop would just hammer the API.
        if (error instanceof ApiError && error.status === 401) return false
        return failureCount < 2
      },
    },
    mutations: { retry: 0 },
  },
})

/**
 * The replacement for `revalidatePath` / `router.refresh()`. Every mutation
 * calls it, so a write is followed by a re-read of whatever the page shows.
 */
export function refreshData(): void {
  void queryClient.invalidateQueries()
}
