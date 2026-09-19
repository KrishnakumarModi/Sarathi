/**
 * Drop-in replacements for the `next/navigation` hooks.
 *
 * Keeping the same names and the same call shapes meant the copied
 * components needed one changed import line each, rather than a rewrite.
 */

import { useMemo } from 'react'
import {
  useLocation,
  useNavigate,
  useSearchParams as useRouterSearchParams,
} from 'react-router-dom'

import { refreshData } from '@/lib/query-client'

export function usePathname(): string {
  return useLocation().pathname
}

export interface AppRouter {
  push: (href: string) => void
  replace: (href: string, options?: { scroll?: boolean }) => void
  back: () => void
  /** What `router.refresh()` meant: re-read the server's view of the data. */
  refresh: () => void
}

export function useRouter(): AppRouter {
  const navigate = useNavigate()
  return useMemo<AppRouter>(
    () => ({
      push: (href) => navigate(href),
      replace: (href) => navigate(href, { replace: true }),
      back: () => navigate(-1),
      refresh: () => refreshData(),
    }),
    [navigate]
  )
}

/**
 * Next returns the params object directly; react-router returns a tuple.
 * The components only ever read, so expose just the object.
 */
export function useSearchParams(): URLSearchParams {
  const [params] = useRouterSearchParams()
  return params
}
