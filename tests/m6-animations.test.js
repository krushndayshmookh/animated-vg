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

describe('M6: parse and edit SMIL animations', () => {
  beforeEach(() => {
    Object.defineProperty(HTMLElement.prototype, 'getBoundingClientRect', {
      configurable: true,
      value() {
        return { left: 0, top: 0, right: 800, bottom: 600, width: 800, height: 600 }
      },
    })
  })

  it('lists animations for selected element', async () => {
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

    // add opacity anim via UI
    await wrapper.find('[data-test="timeline-add-opacity"]').trigger('click')
    await nextTick()
    const rows = wrapper.findAll('[data-test="timeline-anim-row"]')
    expect(rows.length).toBe(1)
    expect(rows[0].text()).toContain('opacity')
  })

  it('edits animation dur/from/to via Save', async () => {
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

    await wrapper.find('[data-test="timeline-add-opacity"]').trigger('click')
    await nextTick()

    const inputFrom = wrapper.find('[data-test="timeline-anim-from-0"]')
    const inputTo = wrapper.find('[data-test="timeline-anim-to-0"]')
    const inputDur = wrapper.find('[data-test="timeline-anim-dur-0"]')
    await inputFrom.setValue('0')
    await inputTo.setValue('1')
    await inputDur.setValue('2s')
    await wrapper.find('[data-test="timeline-anim-save-0"]').trigger('click')
    const xml = store.exportXml()
    expect(xml).toContain('from="0"')
    expect(xml).toContain('to="1"')
    expect(xml).toContain('dur="2s"')
  })
})
