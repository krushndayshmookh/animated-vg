import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import App from '../src/App.vue'

// Minimal mount test focusing on template integrity

describe('App mount', () => {
  it('renders a router-view root', () => {
    const wrapper = mount(App, {
      global: {
        stubs: ['router-view'],
      },
    })
    expect(wrapper.html()).toContain('router-view')
  })
})
