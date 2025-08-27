import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { nextTick } from 'vue'
import EditorPage from '../src/pages/EditorPage.vue'
import { useEditorStore } from '../src/stores/editor-store.js'

function mountPage() {
  const pinia = createPinia()
  setActivePinia(pinia)
  const wrapper = mount(EditorPage, {
    attachTo: document.body,
    global: {
      plugins: [pinia],
      stubs: {
        'q-page': { template: '<div><slot /></div>' },
        'q-toolbar': { template: '<div><slot /></div>' },
        'q-toolbar-title': { template: '<div><slot /></div>' },
        'q-btn': {
          props: ['label'],
          template: '<button @click="$emit(\'click\')"><slot />{{ label }}</button>',
        },
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

describe('M5 Timeline minimal animation', () => {
  beforeEach(() => {
    Object.defineProperty(HTMLElement.prototype, 'getBoundingClientRect', {
      configurable: true,
      value() {
        return { left: 0, top: 0, right: 800, bottom: 600, width: 800, height: 600 }
      },
    })
  })

  it('adds an opacity animation to selected element', async () => {
    const { wrapper, store } = mountPage()
    const canvas = wrapper.find('[data-test="editor-canvas"]')
    // draw and select a rect
    store.setActiveTool('rect')
    await canvas.trigger('mousedown', { clientX: 10, clientY: 10 })
    await canvas.trigger('mouseup', { clientX: 40, clientY: 40 })
    await nextTick()
    store.setActiveTool('select')
    await canvas.trigger('click', { clientX: 15, clientY: 15 })
    await nextTick()

    const addBtn = wrapper.find('[data-test="timeline-add-opacity"]')
    await addBtn.trigger('click')
    const xml = store.exportXml(true)
    expect(xml).toContain('<animate')
    expect(xml).toContain('attributeName="opacity"')
  })

  it('calls play/pause/stop on svg if available', async () => {
    const { wrapper } = mountPage()
    const host = document.querySelector('[data-test="editor-canvas"]')
    // Patch the existing inline svg rendered by Canvas
    const realSvg =
      host.querySelector('svg') || document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    // Attach spies
    realSvg.unpauseAnimations = vi.fn()
    realSvg.pauseAnimations = vi.fn()
    realSvg.setCurrentTime = vi.fn()
    // Ensure it is present under host
    if (!realSvg.isConnected) host.appendChild(realSvg)
    await nextTick()
    await wrapper.find('[data-test="timeline-play"]').trigger('click')
    await wrapper.find('[data-test="timeline-pause"]').trigger('click')
    await wrapper.find('[data-test="timeline-stop"]').trigger('click')
    expect(realSvg.unpauseAnimations).toHaveBeenCalled()
    expect(realSvg.pauseAnimations).toHaveBeenCalled()
    expect(realSvg.setCurrentTime).toHaveBeenCalledWith(0)
  })
})
