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
        'q-input': {
          props: ['modelValue'],
          emits: ['update:modelValue'],
          template:
            '<input :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
        },
        'q-slide-transition': { template: '<div><slot /></div>' },
      },
    },
  })
  const store = useEditorStore()
  return { wrapper, store }
}

describe('M4 Inspector attribute editing', () => {
  beforeEach(() => {
    Object.defineProperty(HTMLElement.prototype, 'getBoundingClientRect', {
      configurable: true,
      value() {
        return { left: 0, top: 0, right: 800, bottom: 600, width: 800, height: 600 }
      },
    })
  })

  it('updates fill and stroke on selected rect', async () => {
    const { wrapper, store } = mountPage()
    // draw a rect
    const canvas = wrapper.find('[data-test="editor-canvas"]')
    store.setActiveTool('rect')
    await canvas.trigger('mousedown', { clientX: 10, clientY: 10 })
    await canvas.trigger('mouseup', { clientX: 40, clientY: 40 })
    await nextTick()
    // select it
    store.setActiveTool('select')
    await canvas.trigger('click', { clientX: 15, clientY: 15 })
    await nextTick()
    // change attributes via inspector
    const inputs = wrapper.findAll('input')
    // using stubbed order: fill, stroke, opacity, x, y, width, height
    await inputs[0].setValue('#ff0000')
    await inputs[1].setValue('#00ff00')
    await nextTick()
    const attrs = store.getSelectedAttrs()
    expect(attrs.fill).toBe('#ff0000')
    expect(attrs.stroke).toBe('#00ff00')
    const xml = store.exportXml()
    expect(xml).toContain('fill="#ff0000"')
    expect(xml).toContain('stroke="#00ff00"')
  })

  it('updates opacity and coordinates on selected rect', async () => {
    const { wrapper, store } = mountPage()
    const canvas = wrapper.find('[data-test="editor-canvas"]')
    store.setActiveTool('rect')
    await canvas.trigger('mousedown', { clientX: 10, clientY: 10 })
    await canvas.trigger('mouseup', { clientX: 40, clientY: 40 })
    await nextTick()
    store.setActiveTool('select')
    await canvas.trigger('click', { clientX: 15, clientY: 15 })
    await nextTick()
    const inputs = wrapper.findAll('input')
    // opacity (index 2), x (3), y (4), width (5), height (6)
    await inputs[2].setValue('0.5')
    await inputs[3].setValue('20')
    await inputs[4].setValue('25')
    await inputs[5].setValue('60')
    await inputs[6].setValue('70')
    await nextTick()
    const attrs = store.getSelectedAttrs()
    expect(attrs.opacity).toBe(0.5)
    expect(attrs.x).toBe(20)
    expect(attrs.y).toBe(25)
    expect(attrs.width).toBe(60)
    expect(attrs.height).toBe(70)
  })
})
