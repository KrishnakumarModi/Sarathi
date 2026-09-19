/**
 * Where the session lives on the client.
 *
 * The access token is held in memory so it is not readable by anything that
 * can reach `localStorage`. The refresh token is persisted, because without
 * it a page reload would sign the user out; the backend also sets it as an
 * httpOnly cookie, and rotates and revokes it on every use, which is what
 * limits the damage if the stored copy is read.
 */

const REFRESH_KEY = 'ai_career_os.refresh'

let accessToken: string | null = null
let accessTokenExpiresAt = 0

type Listener = (authenticated: boolean) => void
const listeners = new Set<Listener>()

function notify(): void {
  const authenticated = Boolean(accessToken || getRefreshToken())
  for (const listener of listeners) listener(authenticated)
}

export function onAuthChange(listener: Listener): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function getAccessToken(): string | null {
  if (accessToken && Date.now() >= accessTokenExpiresAt) return null
  return accessToken
}

export function getRefreshToken(): string | null {
  try {
    return localStorage.getItem(REFRESH_KEY)
  } catch {
    // Private mode, or blocked site data: the in-memory token still works
    // for this tab.
    return null
  }
}

export function setTokens(access: string, refresh: string, expiresInSeconds: number): void {
  accessToken = access
  // Expire the local copy 30s early so a request never leaves with a token
  // that dies in flight.
  accessTokenExpiresAt = Date.now() + Math.max(0, expiresInSeconds - 30) * 1000
  try {
    localStorage.setItem(REFRESH_KEY, refresh)
  } catch {
    /* ignore */
  }
  notify()
}

export function clearTokens(): void {
  accessToken = null
  accessTokenExpiresAt = 0
  try {
    localStorage.removeItem(REFRESH_KEY)
  } catch {
    /* ignore */
  }
  notify()
}

export function hasSession(): boolean {
  return Boolean(accessToken || getRefreshToken())
}
