import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { nextTick } from 'vue'
import EditorPage from '../src/pages/EditorPage.vue'
import { useEditorStore } from '../src/stores/editor-store.js'

function mountPage() {
  const pinia = createPinia()
  setActivePinia(pinia)
  const wrapper = mount(EditorPage, {
    global: {
      plugins: [pinia],
      stubs: {
        'q-page': { template: '<div><slot /></div>' },
        'q-toolbar': { template: '<div><slot /></div>' },
        'q-toolbar-title': { template: '<div><slot /></div>' },
        'q-btn': { template: '<button><slot /></button>' },
        'q-splitter': { template: '<div><slot name="before" /><slot name="after" /></div>' },
        'q-drawer': { template: '<div><slot /></div>' },
        'q-list': { template: '<ul><slot /></ul>' },
        'q-item': { template: '<li><slot /></li>' },
        'q-item-section': { template: '<div><slot /></div>' },
        'q-input': { template: '<input />' },
        'q-slide-transition': { template: '<div><slot /></div>' },
      },
    },
  })
  const store = useEditorStore()
  return { wrapper, store }
}

describe('M3 drawing and selection', () => {
  beforeEach(() => {
    // Provide a stable bounding rect for coordinate math in tests
    Object.defineProperty(HTMLElement.prototype, 'getBoundingClientRect', {
      configurable: true,
      value() {
        return { left: 0, top: 0, right: 800, bottom: 600, width: 800, height: 600 }
      },
    })
  })
  it('draws a rectangle when using rect tool', async () => {
    const { wrapper, store } = mountPage()
    store.setActiveTool('rect')
    const canvas = wrapper.find('[data-test="editor-canvas"]')
    await canvas.trigger('mousedown', { clientX: 10, clientY: 10 })
    await canvas.trigger('mousemove', { clientX: 110, clientY: 60 })
    await canvas.trigger('mouseup', { clientX: 110, clientY: 60 })
    await nextTick()
    // the underlying store xml should now contain a rect
    const html = wrapper.html()
    expect(html.includes('<rect')).toBe(true)
  })

  it('selects a rectangle on click when using select tool', async () => {
    const { wrapper, store } = mountPage()
    // draw one rect first
    store.setActiveTool('rect')
    const canvas = wrapper.find('[data-test="editor-canvas"]')
    await canvas.trigger('mousedown', { clientX: 10, clientY: 10 })
    await canvas.trigger('mouseup', { clientX: 50, clientY: 40 })
    await nextTick()

    // switch to select and click inside the rect
    store.setActiveTool('select')
    await canvas.trigger('click', { clientX: 15, clientY: 15 })
    await nextTick()
    expect(store.selectedId).not.toBeNull()
  })

  it('shows rubber-band preview while drawing', async () => {
    const { wrapper, store } = mountPage()
    store.setActiveTool('rect')
    const canvas = wrapper.find('[data-test="editor-canvas"]')
    await canvas.trigger('mousedown', { clientX: 10, clientY: 10 })
    await canvas.trigger('mousemove', { clientX: 80, clientY: 50 })
    await nextTick()
  const rubber = wrapper.find('[data-test="rubber-band"]')
  const exists = rubber.exists() || wrapper.find('.rubber-outline').exists()
  expect(exists).toBe(true)
    await canvas.trigger('mouseup', { clientX: 80, clientY: 50 })
  })

  it('drags selected rect using selection overlay', async () => {
    const { wrapper, store } = mountPage()
    // create rect
    store.setActiveTool('rect')
    const canvas = wrapper.find('[data-test="editor-canvas"]')
    await canvas.trigger('mousedown', { clientX: 10, clientY: 10 })
    await canvas.trigger('mouseup', { clientX: 60, clientY: 40 })
    await nextTick()
    // select it
    store.setActiveTool('select')
    await canvas.trigger('click', { clientX: 15, clientY: 15 })
    await nextTick()
    const before = store.getRectById(store.selectedId)
    // drag selection overlay
    const overlay = wrapper.find('[data-test="selection-outline"]')
    await overlay.trigger('mousedown', { clientX: before.x + 2, clientY: before.y + 2 })
    await canvas.trigger('mousemove', { clientX: before.x + 20, clientY: before.y + 25 })
    await canvas.trigger('mouseup', { clientX: before.x + 20, clientY: before.y + 25 })
    await nextTick()
    const after = store.getRectById(store.selectedId)
    expect(after.x).toBe(before.x + 18)
    expect(after.y).toBe(before.y + 23)
  })
})
