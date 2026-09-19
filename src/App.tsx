import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'

import { AppProviders } from '@/components/providers/app-providers'
import { RootErrorBoundary } from '@/components/shared/root-error-boundary'
import { Skeleton } from '@/components/ui/skeleton'
import { hasSession } from '@/lib/token-store'
import { AuthLayout, DashboardLayout, GuestOnly, RequireOnboarding } from '@/routes/layouts'
import { LoginPage, SignupPage } from '@/routes/auth'
import NotFoundPage from '@/routes/not-found'

// Route-level code splitting: the login screen must not pull in Recharts,
// the curriculum tree, or the project tracker.
const DashboardPage = lazy(() => import('@/routes/dashboard'))
const TodayPage = lazy(() => import('@/routes/today'))
const RevisionPage = lazy(() => import('@/routes/revision'))
const RoadmapPage = lazy(() => import('@/routes/roadmap'))
const CurriculumPage = lazy(() => import('@/routes/curriculum'))
const CurriculumDomainPage = lazy(() => import('@/routes/curriculum-domain'))
const SkillsPage = lazy(() => import('@/routes/skills'))
const RolesPage = lazy(() => import('@/routes/roles'))
const DsaPage = lazy(() => import('@/routes/dsa'))
const DsaPatternPage = lazy(() => import('@/routes/dsa-pattern'))
const CsPage = lazy(() => import('@/routes/cs'))
const AptitudePage = lazy(() => import('@/routes/aptitude'))
const ProjectsPage = lazy(() => import('@/routes/projects'))
const ProjectDetailPage = lazy(() => import('@/routes/project-detail'))
const ApplicationsPage = lazy(() => import('@/routes/applications'))
const InterviewsPage = lazy(() => import('@/routes/interviews'))
const AnalyticsPage = lazy(() => import('@/routes/analytics'))
const SettingsPage = lazy(() => import('@/routes/settings'))
const OnboardingPage = lazy(() => import('@/routes/onboarding'))

function RouteFallback() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-80" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-28" />
        ))}
      </div>
    </div>
  )
}

export default function App() {
  return (
    <RootErrorBoundary>
      <AppProviders>
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route
              path="/"
              element={<Navigate to={hasSession() ? '/dashboard' : '/login'} replace />}
            />

            <Route element={<GuestOnly />}>
              <Route element={<AuthLayout />}>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
              </Route>
            </Route>

            <Route element={<DashboardLayout />}>
              {/* Onboarding itself must stay reachable while incomplete. */}
              <Route path="/onboarding" element={<OnboardingPage />} />

              <Route element={<RequireOnboarding />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/today" element={<TodayPage />} />
                <Route path="/revision" element={<RevisionPage />} />
                <Route path="/roadmap" element={<RoadmapPage />} />
                <Route path="/curriculum" element={<CurriculumPage />} />
                <Route path="/curriculum/:domainId" element={<CurriculumDomainPage />} />
                <Route path="/skills" element={<SkillsPage />} />
                <Route path="/roles" element={<RolesPage />} />
                <Route path="/dsa" element={<DsaPage />} />
                <Route path="/dsa/:patternId" element={<DsaPatternPage />} />
                <Route path="/cs" element={<CsPage />} />
                <Route path="/aptitude" element={<AptitudePage />} />
                <Route path="/projects" element={<ProjectsPage />} />
                <Route path="/projects/:projectId" element={<ProjectDetailPage />} />
                <Route path="/applications" element={<ApplicationsPage />} />
                <Route path="/interviews" element={<InterviewsPage />} />
                <Route path="/analytics" element={<AnalyticsPage />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Route>
            </Route>

            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </AppProviders>
    </RootErrorBoundary>
  )
}
