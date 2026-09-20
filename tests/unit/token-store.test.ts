import { beforeEach, describe, expect, it } from 'vitest'

import { clearTokens, getAccessToken, hasSession, setTokens } from '@/lib/token-store'

describe('token store', () => {
  beforeEach(() => {
    clearTokens()
  })

  it('holds the access token only in memory', () => {
    setTokens('access-123', 600)
    expect(getAccessToken()).toBe('access-123')
  })

  it('treats an expired access token as absent so the client refreshes', () => {
    // A 10s lifetime is inside the 30s safety margin, so it is already stale.
    setTokens('access-123', 10)
    expect(getAccessToken()).toBeNull()
    expect(hasSession()).toBe(false)
  })

  it('clears both tokens on sign-out', () => {
    setTokens('access-123', 600)
    clearTokens()
    expect(getAccessToken()).toBeNull()
    expect(hasSession()).toBe(false)
  })
})
