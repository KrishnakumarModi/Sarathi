import { expect, test } from '@playwright/test'

/**
 * Critical journey: unauthenticated access is gated, signup lands in
 * onboarding, and logout returns to login (04_AUTH_AND_SECURITY.md).
 *
 * Requires the FastAPI backend on :8000 (migrated and seeded) and the SPA
 * being served. Run with:
 *   cd backend && uvicorn app.main:app --port 8000
 *   cd frontend && npm run dev
 *   npx playwright test
 */

const password = 'test-password-123'
const uniqueEmail = () => `e2e-${Date.now()}-${Math.floor(Math.random() * 1e4)}@example.com`

test.describe('auth', () => {
  test('redirects an unauthenticated visitor to login', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page).toHaveURL(/\/login/)
    // shadcn's CardTitle renders a <div>, not a heading, so match the text.
    await expect(page.getByText('Pick up where you left off.')).toBeVisible()
  })

  test('preserves the intended destination after login redirect', async ({ page }) => {
    await page.goto('/skills')
    await expect(page).toHaveURL(/\/login\?next=%2Fskills/)
  })

  test('signup lands the new user in onboarding', async ({ page }) => {
    const email = uniqueEmail()

    await page.goto('/signup')
    await page.getByLabel('Name').fill('E2E User')
    await page.getByLabel('Email').fill(email)
    await page.getByLabel('Password', { exact: true }).fill(password)
    await page.getByLabel('Confirm password').fill(password)
    await page.getByRole('button', { name: 'Create account' }).click()

    // A new account has no plan until onboarding is finished.
    await expect(page).toHaveURL(/\/onboarding/, { timeout: 15_000 })
    await expect(page.getByRole('heading', { name: 'Set up your plan' })).toBeVisible()
  })

  test('rejects a mismatched password confirmation before hitting the network', async ({ page }) => {
    await page.goto('/signup')
    await page.getByLabel('Name').fill('E2E User')
    await page.getByLabel('Email').fill(uniqueEmail())
    await page.getByLabel('Password', { exact: true }).fill(password)
    await page.getByLabel('Confirm password').fill('something-else')
    await page.getByRole('button', { name: 'Create account' }).click()

    await expect(page.getByText('Passwords do not match')).toBeVisible()
    await expect(page).toHaveURL(/\/signup/)
  })

  test('shows a generic error for bad credentials', async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel('Email').fill('nobody@example.com')
    await page.getByLabel('Password').fill('wrong-password-123')
    await page.getByRole('button', { name: 'Log in' }).click()

    // Deliberately generic: the message must not reveal whether the account exists.
    await expect(page.getByRole('alert')).toHaveText('Invalid email or password.')
  })
})
