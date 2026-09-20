import { beforeEach, describe, expect, it, vi } from 'vitest'

import { clearTokens, getAccessToken, hasSession, setTokens } from '@/lib/token-store'

const storage = new Map<string, string>()

vi.stubGlobal('localStorage', {
  getItem: (key: string) => storage.get(key) ?? null,
  setItem: (key: string, value: string) => void storage.set(key, value),
  removeItem: (key: string) => void storage.delete(key),
})

describe('token store', () => {
  beforeEach(() => {
    storage.clear()
    clearTokens()
  })

  it('holds the access token in memory and persists only the refresh token', () => {
    setTokens('access-123', 'refresh-456', 600)
    expect(getAccessToken()).toBe('access-123')
    expect(storage.get('ai_career_os.refresh')).toBe('refresh-456')
    // The access token must never reach storage.
    expect([...storage.values()]).not.toContain('access-123')
  })

  it('treats an expired access token as absent so the client refreshes', () => {
    // A 10s lifetime is inside the 30s safety margin, so it is already stale.
    setTokens('access-123', 'refresh-456', 10)
    expect(getAccessToken()).toBeNull()
    // The session is still recoverable from the refresh token.
    expect(hasSession()).toBe(true)
  })

  it('clears both tokens on sign-out', () => {
    setTokens('access-123', 'refresh-456', 600)
    clearTokens()
    expect(getAccessToken()).toBeNull()
    expect(hasSession()).toBe(false)
  })
})
