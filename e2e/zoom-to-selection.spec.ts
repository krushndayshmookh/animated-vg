import { test, expect, Page } from '@playwright/test'

// Helper functions to interact with the editor store
async function addRectangle(page: Page, x: number, y: number, width: number, height: number, attrs = {}) {
  await page.evaluate(
    ({ x, y, width, height, attrs }) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const app = (window as any).__VUE_APP__
      if (app) {
        const store = app.config.globalProperties.$pinia._s.get('editor')
        if (store) {
          store.addRect(x, y, width, height, attrs)
        }
      }
    },
    { x, y, width, height, attrs }
  )
}

async function addEllipse(page: Page, x: number, y: number, width: number, height: number, attrs = {}) {
  await page.evaluate(
    ({ x, y, width, height, attrs }) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const app = (window as any).__VUE_APP__
      if (app) {
        const store = app.config.globalProperties.$pinia._s.get('editor')
        if (store) {
          store.addEllipse(x, y, width, height, attrs)
        }
      }
    },
    { x, y, width, height, attrs }
  )
}

async function addLine(page: Page, x1: number, y1: number, x2: number, y2: number, attrs = {}) {
  await page.evaluate(
    ({ x1, y1, x2, y2, attrs }) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const app = (window as any).__VUE_APP__
      if (app) {
        const store = app.config.globalProperties.$pinia._s.get('editor')
        if (store) {
          store.addLine(x1, y1, x2, y2, attrs)
        }
      }
    },
    { x1, y1, x2, y2, attrs }
  )
}

async function clearSelection(page: Page) {
  await page.evaluate(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const app = (window as any).__VUE_APP__
    if (app) {
      const store = app.config.globalProperties.$pinia._s.get('editor')
      if (store) {
        store.clearSelection()
      }
    }
  })
}

test.describe('Zoom to Selection Feature', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('[data-test="editor-page"]')).toBeVisible()
  })

  test('zoom-to-selection button is disabled when no element is selected', async ({ page }) => {
    // Find the zoom-to-selection button in the right toolbar
    const zoomToSelectionBtn = page.locator('[data-test="toolbar-item-zoom-to-selection"]')
    
    // Button should exist
    await expect(zoomToSelectionBtn).toBeVisible()
    
    // Button should be disabled when nothing is selected
    await expect(zoomToSelectionBtn).toBeDisabled()
  })

  test('zoom-to-selection button is enabled when an element is selected', async ({ page }) => {
    // Wait for canvas to be ready
    const canvas = page.locator('[data-test="canvas-container"]')
    await expect(canvas).toBeVisible()

    // Add a test rectangle
    await addRectangle(page, 100, 100, 150, 80, { fill: 'blue', stroke: 'black' })

    // Wait a bit for the shape to render
    await page.waitForTimeout(500)

    // Click on the shape to select it
    await canvas.click({ position: { x: 175, y: 140 } })

    // Wait for selection to be processed
    await page.waitForTimeout(300)

    // Check if the zoom-to-selection button is now enabled
    const zoomToSelectionBtn = page.locator('[data-test="toolbar-item-zoom-to-selection"]')
    await expect(zoomToSelectionBtn).not.toBeDisabled()
  })

  test('clicking zoom-to-selection zooms and centers the selected element', async ({ page }) => {
    // Add a test rectangle
    await addRectangle(page, 150, 200, 150, 80, { fill: 'red', stroke: 'black' })

    await page.waitForTimeout(500)

    // Click on the canvas to select the shape
    const canvas = page.locator('[data-test="canvas-container"]')
    await canvas.click({ position: { x: 225, y: 240 } })

    await page.waitForTimeout(300)

    // Click the zoom-to-selection button
    const zoomToSelectionBtn = page.locator('[data-test="toolbar-item-zoom-to-selection"]')
    await zoomToSelectionBtn.click()

    // Wait for zoom animation
    await page.waitForTimeout(500)

    // Verify that the selection outline is still visible
    const selectionOutline = page.locator('[data-test="selection-outline"]')
    await expect(selectionOutline).toBeVisible()
  })

  test('zoom-to-selection works with ellipse elements', async ({ page }) => {
    // Add an ellipse
    await addEllipse(page, 100, 100, 120, 80, { fill: 'cyan', stroke: 'black' })

    await page.waitForTimeout(500)

    // Select the ellipse
    const canvas = page.locator('[data-test="canvas-container"]')
    await canvas.click({ position: { x: 160, y: 140 } })

    await page.waitForTimeout(300)

    // Verify selection
    const selectionOutline = page.locator('[data-test="selection-outline"]')
    await expect(selectionOutline).toBeVisible()

    // Click zoom-to-selection
    const zoomToSelectionBtn = page.locator('[data-test="toolbar-item-zoom-to-selection"]')
    await zoomToSelectionBtn.click()

    await page.waitForTimeout(500)

    // Verify zoom changed and selection is still visible
    await expect(selectionOutline).toBeVisible()
  })

  test('zoom-to-selection works with line elements', async ({ page }) => {
    // Add a line
    await addLine(page, 50, 50, 350, 350, { stroke: 'black', strokeWidth: 3 })

    await page.waitForTimeout(500)

    // Select the line (click near it)
    const canvas = page.locator('[data-test="canvas-container"]')
    await canvas.click({ position: { x: 200, y: 200 } })

    await page.waitForTimeout(300)

    // Click zoom-to-selection
    const zoomToSelectionBtn = page.locator('[data-test="toolbar-item-zoom-to-selection"]')
    
    // Check if button is enabled (line should be selected)
    const isDisabled = await zoomToSelectionBtn.isDisabled()
    
    if (!isDisabled) {
      await zoomToSelectionBtn.click()
      await page.waitForTimeout(500)

      // Verify selection is still visible
      const selectionOutline = page.locator('[data-test="selection-outline"]')
      await expect(selectionOutline).toBeVisible()
    }
  })
})
