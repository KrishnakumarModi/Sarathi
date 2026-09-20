/**
 * HTTP client for the FastAPI backend.
 *
 * Three jobs:
 *
 *   1. carry the access token, and transparently refresh it once when the
 *      server says it has expired — a single in-flight refresh is shared by
 *      every waiting request, so a page that fires eight queries at once
 *      does not trigger eight refreshes;
 *   2. translate transport and validation errors into the same
 *      `{ error, fieldErrors }` shape the Server Actions used to return, so
 *      the components that render them did not have to change;
 *   3. keep the tokens in one place (`token-store`) rather than scattered
 *      through components.
 */

import type { ActionResult } from '@/types/global'
import { clearTokens, getAccessToken, setTokens } from './token-store'

const BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? '/api/v1'

export class ApiError extends Error {
  readonly status: number
  readonly fieldErrors?: Record<string, string[]>

  constructor(message: string, status: number, fieldErrors?: Record<string, string[]>) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.fieldErrors = fieldErrors
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE'
  body?: unknown
  /** Skip the Authorization header and the refresh dance (login, signup). */
  anonymous?: boolean
  signal?: AbortSignal
}

let refreshInFlight: Promise<boolean> | null = null

/** Exchange the refresh token for a new pair. At most one runs at a time. */
async function refreshSession(): Promise<boolean> {
  if (refreshInFlight) return refreshInFlight

  refreshInFlight = (async () => {
    try {
      const response = await fetch(`${BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      })
      if (!response.ok) {
        clearTokens()
        return false
      }
      const data = (await response.json()) as {
        access_token: string
        expires_in: number
      }
      setTokens(data.access_token, data.expires_in)
      return true
    } catch {
      return false
    } finally {
      refreshInFlight = null
    }
  })()

  return refreshInFlight
}

/** Restore the in-memory token from the HttpOnly refresh cookie on reload. */
export async function restoreSession(): Promise<boolean> {
  return refreshSession()
}

async function parseError(response: Response): Promise<ApiError> {
  let message = 'Something went wrong. Please try again.'
  let fieldErrors: Record<string, string[]> | undefined

  try {
    const payload = (await response.json()) as {
      error?: string
      detail?: string
      fieldErrors?: Record<string, string[]>
    }
    message = payload.error ?? payload.detail ?? message
    fieldErrors = payload.fieldErrors
  } catch {
    // A non-JSON body (a gateway timeout page, say) keeps the generic text.
  }

  return new ApiError(message, response.status, fieldErrors)
}

async function send<T>(path: string, options: RequestOptions, retrying = false): Promise<T> {
  const headers: Record<string, string> = {}
  if (options.body !== undefined) headers['Content-Type'] = 'application/json'

  const token = options.anonymous ? null : getAccessToken()
  if (token) headers.Authorization = `Bearer ${token}`

  const response = await fetch(`${BASE_URL}${path}`, {
    method: options.method ?? 'GET',
    headers,
    credentials: 'include',
    signal: options.signal,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  })

  if (response.status === 401 && !options.anonymous && !retrying) {
    if (await refreshSession()) return send<T>(path, options, true)
    clearTokens()
    throw new ApiError('Your session has expired. Please log in again.', 401)
  }

  if (!response.ok) throw await parseError(response)
  if (response.status === 204) return undefined as T

  return (await response.json()) as T
}

export const api = {
  get: <T>(path: string, signal?: AbortSignal) => send<T>(path, { signal }),
  post: <T>(path: string, body?: unknown) => send<T>(path, { method: 'POST', body }),
  patch: <T>(path: string, body?: unknown) => send<T>(path, { method: 'PATCH', body }),
  delete: <T>(path: string) => send<T>(path, { method: 'DELETE' }),
  /** Login and signup: no token to send, and no refresh to attempt. */
  anonymousPost: <T>(path: string, body?: unknown) =>
    send<T>(path, { method: 'POST', body, anonymous: true }),
  /** Multipart upload (avatars). */
  upload: async <T>(path: string, file: File): Promise<T> => {
    const form = new FormData()
    form.append('file', file)
    const token = getAccessToken()
    const response = await fetch(`${BASE_URL}${path}`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      credentials: 'include',
      body: form,
    })
    if (!response.ok) throw await parseError(response)
    return (await response.json()) as T
  },
}

/**
 * Run a mutation and return the `ActionResult` the UI already knows how to
 * render, instead of throwing. Components keep their
 * `if ('error' in result)` branches untouched.
 */
export async function toActionResult<T>(work: () => Promise<T>): Promise<ActionResult<T>> {
  try {
    const data = await work()
    return { success: true, data }
  } catch (error) {
    if (error instanceof ApiError) {
      return { error: error.message, fieldErrors: error.fieldErrors }
    }
    return { error: 'Network error. Check your connection and try again.' }
  }
}
