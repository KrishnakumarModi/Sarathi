/**
 * Auth, profile, settings, and onboarding API.
 *
 * `login`, `signup`, and `logout` replace the direct Supabase GoTrue calls
 * the forms used to make; `createUserProfile` is gone because the backend
 * now bootstraps the profile inside the signup transaction, which is what
 * makes a half-created account impossible.
 */

import { api, toActionResult } from '@/lib/api-client'
import { queryClient, refreshData } from '@/lib/query-client'
import { clearTokens, setTokens } from '@/lib/token-store'
import type { ProfileRow, RoleRow, UserSettingsRow } from '@/types/database.types'
import type { ActionResult } from '@/types/global'
import type { BaselineQuestion } from '../onboarding/lib/baseline-questions'
import type { OnboardingInput } from '../onboarding/validators'
import type { LoginInput, SettingsInput, SignupInput } from './validators'

interface SessionResponse {
  access_token: string
  expires_in: number
  user: { id: string; email: string; display_name: string | null }
  confirmation_required?: boolean
}

export interface CurrentUser {
  id: string
  email: string
  display_name: string | null
  onboarding_status: 'pending' | 'baseline' | 'complete'
  post_auth_redirect: string
}

export interface SettingsView {
  profile: ProfileRow
  settings: UserSettingsRow
  email: string
}

export interface OnboardingContext {
  roles: RoleRow[]
  defaultName: string
  defaultTimezone: string
  onboardingStatus: 'pending' | 'baseline' | 'complete'
  baselineQuestions: BaselineQuestion[]
}

function storeSession(session: SessionResponse): void {
  setTokens(session.access_token, session.expires_in)
}

export async function login(input: LoginInput): Promise<ActionResult<CurrentUser>> {
  const result = await toActionResult(async () => {
    const session = await api.anonymousPost<SessionResponse>('/auth/login', input)
    storeSession(session)
    return api.get<CurrentUser>('/auth/me')
  })
  if ('success' in result) refreshData()
  return result
}

export async function signup(
  input: SignupInput
): Promise<ActionResult<CurrentUser | { confirmationRequired: true }>> {
  return toActionResult(async () => {
    const session = await api.anonymousPost<SessionResponse>('/auth/signup', input)
    if (session.confirmation_required) return { confirmationRequired: true as const }
    storeSession(session)
    return api.get<CurrentUser>('/auth/me')
  })
}

export async function logout(): Promise<void> {
  try {
    await api.post('/auth/logout')
  } catch {
    // A failed logout must still clear the client: the refresh token expires
    // on its own, and leaving the user "signed in" locally is worse.
  }
  clearTokens()
  queryClient.clear()
}

export function fetchCurrentUser(signal?: AbortSignal): Promise<CurrentUser> {
  return api.get<CurrentUser>('/auth/me', signal)
}

export function fetchSettings(signal?: AbortSignal): Promise<SettingsView> {
  return api.get<SettingsView>('/settings', signal)
}

export async function updateUserSettings(input: SettingsInput): Promise<ActionResult> {
  const result = await toActionResult(() => api.patch('/settings', input))
  if ('success' in result) refreshData()
  return result as ActionResult
}

export async function uploadAvatar(file: File): Promise<ActionResult<{ avatar_url: string }>> {
  const result = await toActionResult(() =>
    api.upload<{ avatar_url: string }>('/settings/avatar', file)
  )
  if ('success' in result) refreshData()
  return result
}

export function fetchOnboardingContext(signal?: AbortSignal): Promise<OnboardingContext> {
  return api.get<OnboardingContext>('/onboarding', signal)
}

export async function completeOnboarding(input: OnboardingInput): Promise<ActionResult> {
  const result = await toActionResult(() => api.post('/onboarding', input))
  if ('success' in result) {
    // Awaited, not fire-and-forget: the wizard navigates straight to /today,
    // and the onboarding gate there reads `auth/me`. A stale "pending" would
    // bounce the user back to the wizard they just finished.
    await queryClient.invalidateQueries()
  }
  return result as ActionResult
}
