import { afterEach, describe, expect, it, vi } from 'vitest'

import { ApiError, toActionResult } from '@/lib/api-client'

/**
 * The contract the components depend on: a failed call becomes the same
 * `{ error, fieldErrors }` object the Server Actions used to return, never a
 * thrown exception. Every form in the app branches on `'error' in result`.
 */
describe('toActionResult', () => {
  afterEach(() => vi.restoreAllMocks())

  it('wraps a successful call', async () => {
    const result = await toActionResult(async () => ({ id: 'abc' }))
    expect(result).toEqual({ success: true, data: { id: 'abc' } })
  })

  it('turns an ApiError into a renderable message', async () => {
    const result = await toActionResult(async () => {
      throw new ApiError('Already exists', 400)
    })
    expect(result).toEqual({ error: 'Already exists' })
  })

  it('passes field errors through for inline form messages', async () => {
    const result = await toActionResult(async () => {
      throw new ApiError('Invalid input', 422, { company: ['Company is required'] })
    })
    expect(result).toEqual({
      error: 'Invalid input',
      fieldErrors: { company: ['Company is required'] },
    })
  })

  it('reports a transport failure without leaking the raw error', async () => {
    const result = await toActionResult(async () => {
      throw new TypeError('Failed to fetch')
    })
    expect(result).toEqual({ error: 'Network error. Check your connection and try again.' })
  })
})
