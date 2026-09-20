import { expect, test } from '@playwright/test'

/**
 * Navigation and the tracker surfaces. These assume an authenticated
 * session; run them after auth-flow.spec.ts in the same worker, or seed a
 * logged-in storage state.
 */

test.describe('navigation and trackers', () => {
  // Needs an onboarded account. Create one once, then:
  //   E2E_EMAIL=... E2E_PASSWORD=... npx playwright test tracking
  test.skip(!process.env.E2E_EMAIL, 'set E2E_EMAIL/E2E_PASSWORD for an onboarded account')

  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel('Email').fill(process.env.E2E_EMAIL as string)
    await page.getByLabel('Password').fill(process.env.E2E_PASSWORD ?? 'test-password-123')
    await page.getByRole('button', { name: 'Log in' }).click()
    await expect(page).toHaveURL(/\/(dashboard|onboarding|today)/, { timeout: 15_000 })
  })

  test('DSA patterns load and open a detail page', async ({ page }) => {
    await page.goto('/dsa')
    // The sticky header also renders the section name, so pin to the h1.
    await expect(page.getByRole('heading', { name: 'DSA', level: 1 })).toBeVisible()

    await page.locator('a[id^="pattern-"]').first().click()
    await expect(page.getByText('Recognition cues')).toBeVisible()
  })

  test('CS tracker toggles persist across a refresh', async ({ page }) => {
    await page.goto('/cs')
    const firstToggle = page.locator('button[role="checkbox"]').first()
    const wasChecked = (await firstToggle.getAttribute('data-state')) === 'checked'

    await firstToggle.click()
    await page.reload()

    await expect(page.locator('button[role="checkbox"]').first()).toHaveAttribute(
      'data-state',
      wasChecked ? 'unchecked' : 'checked'
    )
  })

  test('curriculum domain tree renders and filters', async ({ page }) => {
    await page.goto('/curriculum')
    await page.locator('a[id^="domain-"]').first().click()

    await expect(page.getByLabel('Search units')).toBeVisible()
    await page.getByLabel('Search units').fill('zzzz-no-such-unit')
    await page.getByLabel('Search units').blur()
    await expect(page.getByText('No units match your filters')).toBeVisible()
  })

  test('every primary route renders without an error boundary', async ({ page }) => {
    const routes = [
      '/dashboard', '/today', '/revision', '/roadmap', '/curriculum', '/skills',
      '/roles', '/dsa', '/cs', '/aptitude', '/projects', '/applications',
      '/interviews', '/analytics', '/settings',
    ]

    for (const route of routes) {
      await page.goto(route)
      await expect(page.getByText('Something went wrong')).toHaveCount(0)
    }
  })
})

test.describe('mobile layout', () => {
  test.use({ viewport: { width: 375, height: 812 } })

  test('bottom navigation is usable at 375px', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByText('Pick up where you left off.')).toBeVisible()

    // No horizontal overflow at the narrowest supported width.
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth)
    expect(scrollWidth).toBeLessThanOrEqual(375)
  })
})
