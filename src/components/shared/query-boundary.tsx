import type { ReactNode } from 'react'
import type { UseQueryResult } from '@tanstack/react-query'

import { ErrorDisplay } from './error-display'

interface QueryBoundaryProps<T> {
  query: UseQueryResult<T>
  /** What `loading.tsx` used to render while the server component streamed. */
  skeleton: ReactNode
  description?: string
  children: (data: T) => ReactNode
}

/**
 * The client-side equivalent of a route's `loading.tsx` plus `error.tsx`.
 *
 * Every page renders its skeleton on the first load and an explicit,
 * retryable error state on failure — the same three states the App Router
 * gave for free.
 */
export function QueryBoundary<T>({
  query,
  skeleton,
  description = 'This section could not be loaded. Your saved data is unaffected.',
  children,
}: QueryBoundaryProps<T>) {
  if (query.isPending) return <>{skeleton}</>

  if (query.isError) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <ErrorDisplay description={description} retry={() => void query.refetch()} />
      </div>
    )
  }

  return <>{children(query.data as T)}</>
}
