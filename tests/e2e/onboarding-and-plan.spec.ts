import { expect, test, type Page } from '@playwright/test'

/**
 * The core loop: onboard, generate a plan, complete a task, and see the
 * dashboard reflect it after a hard refresh.
 */

const password = 'test-password-123'

async function signUp(page: Page): Promise<string> {
  const email = `e2e-${Date.now()}-${Math.floor(Math.random() * 1e4)}@example.com`
  await page.goto('/signup')
  await page.getByLabel('Name').fill('Plan Tester')
  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Password', { exact: true }).fill(password)
  await page.getByLabel('Confirm password').fill(password)
  await page.getByRole('button', { name: 'Create account' }).click()
  await expect(page).toHaveURL(/\/onboarding/, { timeout: 15_000 })
  return email
}

async function completeOnboarding(page: Page) {
  // Step 1: identity
  await page.getByRole('button', { name: 'Continue' }).click()

  // Step 2: pick a target role and make it primary
  await page.getByRole('button', { name: /Applied AI Engineer/ }).first().click()
  await page.getByRole('button', { name: 'Continue' }).click()

  // Step 3: capacity
  await page.getByLabel('Hours available each week').fill('20')
  await page.getByRole('button', { name: 'Continue' }).click()

  // Step 4: start from fundamentals, skipping the questionnaire
  await page.getByRole('button', { name: /Start from fundamentals/ }).click()
  await page.getByRole('button', { name: 'Finish setup' }).click()

  await expect(page).toHaveURL(/\/today/, { timeout: 15_000 })
}

test.describe('core loop', () => {
  test('onboard, plan, complete a task, and see it persist', async ({ page }) => {
    await signUp(page)
    await completeOnboarding(page)

    // Generating a plan
    await page.getByRole('button', { name: /Generate plan/ }).click()
    await page.getByRole('button', { name: 'Generate', exact: true }).click()

    const firstTask = page.locator('li:has(button[role="checkbox"])').first()
    await expect(firstTask).toBeVisible({ timeout: 15_000 })

    // Completing the first task
    const checkbox = firstTask.getByRole('checkbox')
    await checkbox.click()
    await expect(checkbox).toHaveAttribute('data-state', 'checked')

    // Surviving a hard refresh — the write actually reached the database.
    await page.reload()
    const refreshed = page.locator('li:has(button[role="checkbox"])').first()
    await expect(refreshed.getByRole('checkbox')).toHaveAttribute('data-state', 'checked')

    // And the dashboard agrees.
    await page.goto('/dashboard')
    await expect(page.getByText(/tasks done today/)).toBeVisible()
  })

  test('capacity change re-balances future planning', async ({ page }) => {
    await signUp(page)
    await completeOnboarding(page)

    await page.goto('/settings')
    await page.getByLabel('Hours per week').fill('40')
    await page.getByRole('button', { name: 'Save settings' }).click()

    // 40 hours over 6 study days is about 400 minutes a day.
    await expect(page.getByText(/400 minutes/)).toBeVisible()
  })
})
