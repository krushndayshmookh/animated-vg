import { test, expect } from '@playwright/test'

// Assumes quasar dev is running at localhost:9000

test.describe('App smoke', () => {
  test('loads landing page', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/AnimatedVG|Quasar App/i)
    await expect(page.locator('body')).toBeVisible()
  })
})
