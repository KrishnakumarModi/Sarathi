/**
 * Where the session lives on the client.
 *
 * The short-lived access token stays in memory. The refresh token is an
 * HttpOnly cookie and is never exposed to JavaScript.
 */

let accessToken: string | null = null
let accessTokenExpiresAt = 0

type Listener = (authenticated: boolean) => void
const listeners = new Set<Listener>()

function notify(): void {
  const authenticated = Boolean(accessToken)
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

export function setTokens(access: string, expiresInSeconds: number): void {
  accessToken = access
  // Expire the local copy 30s early so a request never leaves with a token
  // that dies in flight.
  accessTokenExpiresAt = Date.now() + Math.max(0, expiresInSeconds - 30) * 1000
  notify()
}

export function clearTokens(): void {
  accessToken = null
  accessTokenExpiresAt = 0
  notify()
}

export function hasSession(): boolean {
  return Boolean(getAccessToken())
}
