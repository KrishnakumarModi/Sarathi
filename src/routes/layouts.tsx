import { Link, Navigate, Outlet, useLocation } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Home } from 'lucide-react'

import { Button } from '@/components/ui/button'

import { Header } from '@/components/shared/header'
import { MobileNav } from '@/components/shared/mobile-nav'
import { Sidebar } from '@/components/shared/sidebar'
import { Skeleton } from '@/components/ui/skeleton'
import { APP_NAME } from '@/lib/constants'
import { hasSession } from '@/lib/token-store'
import { fetchCurrentUser } from '@/features/settings/api'

export const currentUserKey = ['auth', 'me'] as const

export function useCurrentUser() {
  return useQuery({
    queryKey: currentUserKey,
    queryFn: ({ signal }) => fetchCurrentUser(signal),
    enabled: hasSession(),
    staleTime: 5 * 60_000,
    retry: false,
  })
}

export function AuthLayout() {
  return (
    <main
      id="main-content"
      className="relative flex min-h-screen flex-col items-center justify-center gap-6 px-4 py-10"
    >
      <Button variant="ghost" asChild className="absolute left-4 top-4 md:left-8 md:top-8">
        <Link to="/">
          <Home className="mr-2 h-4 w-4" />
          Home
        </Link>
      </Button>
      <div className="flex flex-col items-center gap-2">
        <img src="/images/sarathi-logo.svg" alt="Sarathi" className="h-28 w-24 object-cover object-top" />
        <span className="text-lg font-semibold tracking-tight">{APP_NAME}</span>
      </div>
      <div className="w-full max-w-sm">
        <Outlet />
      </div>
      <p className="max-w-sm text-center text-xs text-muted-foreground">
        A planning and evidence tracker. It does not guarantee outcomes or apply to jobs for you.
      </p>
    </main>
  )
}

/** Signed-in users have no business on /login or /signup. */
export function GuestOnly() {
  if (hasSession()) return <Navigate to="/dashboard" replace />
  return <Outlet />
}

function FullPageSkeleton() {
  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-3xl space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    </div>
  )
}

/**
 * The dashboard shell.
 *
 * Replaces the three gates the Next.js middleware and layout enforced:
 * redirect to /login without a session, load the profile once, and render
 * the chrome. Ownership of the data itself is enforced in the backend.
 */
export function DashboardLayout() {
  const location = useLocation()
  const user = useCurrentUser()

  if (!hasSession()) {
    const next = encodeURIComponent(location.pathname + location.search)
    return <Navigate to={`/login?next=${next}`} replace />
  }

  if (user.isPending) return <FullPageSkeleton />
  if (user.isError) return <Navigate to="/login" replace />

  return (
    <div className="app-shell min-h-screen">
      <Sidebar />
      <div className="lg:pl-64">
        <Header displayName={user.data.display_name} email={user.data.email} />
        <main
          id="main-content"
          className="page-enter mx-auto max-w-[1600px] p-4 pb-24 md:p-6 md:pb-6"
        >
          <Outlet />
        </main>
      </div>
      <MobileNav />
    </div>
  )
}

/**
 * Onboarding is a hard gate: every dashboard page redirects to /onboarding
 * until it is complete (06_PRODUCT_ALIGNMENT_PLAN.md Phase 1).
 */
export function RequireOnboarding() {
  const user = useCurrentUser()
  if (user.isPending) return <FullPageSkeleton />
  if (user.data && user.data.onboarding_status !== 'complete') {
    return <Navigate to="/onboarding" replace />
  }
  return <Outlet />
}
