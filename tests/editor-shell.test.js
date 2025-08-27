import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import EditorPage from '../src/pages/EditorPage.vue'

function mountWithQuasar(component) {
  // Mount with minimal stubs for Quasar components used in EditorPage
  return mount(component, {
    global: {
      plugins: [createPinia()],
      stubs: {
        'q-page': true,
        'q-toolbar': true,
        'q-toolbar-title': true,
        'q-btn': true,
        'q-splitter': true,
        'q-drawer': true,
        'q-list': true,
        'q-item': true,
        'q-item-section': true,
        'q-input': true,
        'q-slide-transition': true,
      },
    },
  })
}

describe('Editor shell UI', () => {
  it('renders editor page containers', () => {
    const wrapper = mountWithQuasar(EditorPage)
    expect(wrapper.find('[data-test="editor-page"]').exists()).toBe(true)
  })
})
