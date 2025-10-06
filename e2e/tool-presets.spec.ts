import { test, expect } from '@playwright/test'

test.describe('Tool Presets Feature', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:9000')
    await page.waitForSelector('[data-test="editor-page"]')
  })

  test('should open Tool Presets Manager when clicking bookmark icon', async ({ page }) => {
    // Find and click the presets button (bookmark icon)
    const presetsButton = page.locator('button:has(i.eva-bookmark-outline)')
    await presetsButton.click()

    // Verify dialog opens
    await expect(page.locator('text=Tool Presets')).toBeVisible()
    await expect(page.locator('text=Create, apply and manage tool presets')).toBeVisible()
  })

  test('should create a new preset', async ({ page }) => {
    // Open Tool Presets Manager
    await page.locator('button:has(i.eva-bookmark-outline)').click()
    await page.waitForSelector('text=Tool Presets')

    // Fill in preset form
    await page.fill('input[aria-label="Preset name"]', 'Test Preset')
    
    // Select tool from dropdown
    await page.click('.q-select')
    await page.click('text=select')

    // Fill in config JSON
    await page.fill('textarea[aria-label="Config (JSON)"]', '{"snapEnabled": true}')

    // Click Save button
    await page.click('button:has-text("SAVE")')

    // Verify success notification appears
    await expect(page.locator('.q-notification')).toBeVisible()
    await expect(page.locator('text=Preset saved successfully')).toBeVisible()

    // Verify preset appears in list
    await expect(page.locator('text=Test Preset')).toBeVisible()
  })

  test('should show empty state when no presets exist', async ({ page }) => {
    // Clear localStorage to ensure no presets
    await page.evaluate(() => localStorage.clear())
    await page.reload()

    // Open Tool Presets Manager
    await page.locator('button:has(i.eva-bookmark-outline)').click()

    // Verify empty state
    await expect(page.locator('text=No presets saved')).toBeVisible()
    await expect(page.locator('text=No custom tools')).toBeVisible()
  })

  test('should create a custom tool', async ({ page }) => {
    // Open Tool Presets Manager
    await page.locator('button:has(i.eva-bookmark-outline)').click()

    // Click NEW TOOL button
    await page.click('button:has-text("NEW TOOL")')

    // Fill in custom tool form
    await page.fill('input[aria-label="Tool name"]', 'My Custom Tool')
    await page.fill('input[aria-label="Icon (optional)"]', 'eva-brush-outline')
    await page.fill('textarea[aria-label="Meta (JSON)"]', '{"description": "Test tool"}')

    // Click Save Tool button
    await page.click('button:has-text("SAVE TOOL")')

    // Verify success notification
    await expect(page.locator('text=Custom tool saved successfully')).toBeVisible()

    // Verify tool appears in list
    await expect(page.locator('text=My Custom Tool')).toBeVisible()
  })

  test('should validate required fields', async ({ page }) => {
    // Open Tool Presets Manager
    await page.locator('button:has(i.eva-bookmark-outline)').click()

    // Try to save without preset name
    await page.click('button:has-text("SAVE")')

    // Verify error notification
    await expect(page.locator('text=Preset name is required')).toBeVisible()
  })

  test('should validate JSON format', async ({ page }) => {
    // Open Tool Presets Manager
    await page.locator('button:has(i.eva-bookmark-outline)').click()

    // Fill in preset with invalid JSON
    await page.fill('input[aria-label="Preset name"]', 'Test')
    await page.fill('textarea[aria-label="Config (JSON)"]', '{invalid json}')
    await page.click('button:has-text("SAVE")')

    // Verify error notification
    await expect(page.locator('text=Invalid JSON in Config field')).toBeVisible()
  })

  test('should apply a preset', async ({ page }) => {
    // First create a preset
    await page.locator('button:has(i.eva-bookmark-outline)').click()
    await page.fill('input[aria-label="Preset name"]', 'Apply Test')
    await page.fill('textarea[aria-label="Config (JSON)"]', '{"snapEnabled": true}')
    await page.click('button:has-text("SAVE")')
    await page.waitForSelector('text=Preset saved successfully')

    // Click apply button (checkmark icon)
    await page.click('button:has(i.eva-checkmark-outline)')

    // Verify success notification
    await expect(page.locator('text=Preset applied successfully')).toBeVisible()
  })

  test('should delete a preset with confirmation', async ({ page }) => {
    // First create a preset
    await page.locator('button:has(i.eva-bookmark-outline)').click()
    await page.fill('input[aria-label="Preset name"]', 'Delete Test')
    await page.fill('textarea[aria-label="Config (JSON)"]', '{}')
    await page.click('button:has-text("SAVE")')
    await page.waitForSelector('text=Preset saved successfully')

    // Click delete button (trash icon)
    await page.click('button:has(i.eva-trash-2-outline)')

    // Verify confirmation dialog appears
    await expect(page.locator('text=Are you sure you want to delete this preset?')).toBeVisible()

    // Confirm deletion
    await page.click('button:has-text("OK")')

    // Verify success notification
    await expect(page.locator('text=Preset deleted')).toBeVisible()

    // Verify preset is removed from list
    await expect(page.locator('text=Delete Test')).not.toBeVisible()
  })

  test('should persist presets after page reload', async ({ page }) => {
    // Create a preset
    await page.locator('button:has(i.eva-bookmark-outline)').click()
    await page.fill('input[aria-label="Preset name"]', 'Persist Test')
    await page.fill('textarea[aria-label="Config (JSON)"]', '{}')
    await page.click('button:has-text("SAVE")')
    await page.waitForSelector('text=Preset saved successfully')

    // Close dialog
    await page.click('button:has-text("Close")')

    // Reload page
    await page.reload()
    await page.waitForSelector('[data-test="editor-page"]')

    // Open Tool Presets Manager again
    await page.locator('button:has(i.eva-bookmark-outline)').click()

    // Verify preset still exists
    await expect(page.locator('text=Persist Test')).toBeVisible()
  })

  test('should close dialog when clicking Close button', async ({ page }) => {
    // Open Tool Presets Manager
    await page.locator('button:has(i.eva-bookmark-outline)').click()
    await expect(page.locator('text=Tool Presets')).toBeVisible()

    // Click Close button
    await page.click('button:has-text("Close")')

    // Verify dialog is closed
    await expect(page.locator('text=Tool Presets')).not.toBeVisible()
  })

  test('should clear form when clicking CANCEL', async ({ page }) => {
    // Open Tool Presets Manager
    await page.locator('button:has(i.eva-bookmark-outline)').click()

    // Fill in form
    await page.fill('input[aria-label="Preset name"]', 'Cancel Test')
    await page.fill('textarea[aria-label="Config (JSON)"]', '{"test": true}')

    // Click CANCEL
    await page.click('button:has-text("CANCEL")')

    // Verify form is cleared
    const nameInput = page.locator('input[aria-label="Preset name"]')
    await expect(nameInput).toHaveValue('')
  })
})
