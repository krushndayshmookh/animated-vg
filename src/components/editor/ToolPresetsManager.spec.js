import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { Quasar, Notify, Dialog } from 'quasar'
import ToolPresetsManager from './ToolPresetsManager.vue'
import { useEditorStore } from 'src/stores/editor-store.js'

// Mock fs-client
vi.mock('src/services/fs-client', () => ({
  saveDialog: vi.fn(),
  openDialog: vi.fn(),
}))

describe('ToolPresetsManager', () => {
  let wrapper
  let store

  beforeEach(() => {
    setActivePinia(createPinia())
    store = useEditorStore()

    wrapper = mount(ToolPresetsManager, {
      props: {
        modelValue: true,
      },
      global: {
        plugins: [
          [
            Quasar,
            {
              plugins: { Notify, Dialog },
            },
          ],
        ],
      },
    })
  })

  it('renders the dialog when modelValue is true', () => {
    expect(wrapper.find('.text-h6').text()).toBe('Tool Presets')
  })

  it('displays empty state when no presets exist', () => {
    expect(wrapper.find('.empty-state').exists()).toBe(true)
    expect(wrapper.find('.empty-state').text()).toBe('No presets saved')
  })

  it('displays empty state for custom tools when none exist', () => {
    expect(wrapper.find('.empty-state-small').exists()).toBe(true)
    expect(wrapper.find('.empty-state-small').text()).toBe('No custom tools')
  })

  it('shows presets list when presets exist', async () => {
    store.presets = [{ id: 'p1', name: 'Test Preset', tool: 'select', config: {} }]

    await wrapper.vm.$nextTick()

    expect(wrapper.find('.empty-state').exists()).toBe(false)
    expect(wrapper.text()).toContain('Test Preset')
  })

  it('shows custom tools list when tools exist', async () => {
    store.customTools = [{ id: 't1', name: 'Custom Tool', icon: 'eva-cube-outline', meta: {} }]

    await wrapper.vm.$nextTick()

    expect(wrapper.find('.empty-state-small').exists()).toBe(false)
    expect(wrapper.text()).toContain('Custom Tool')
  })

  it('has tool options including built-in and custom tools', async () => {
    store.customTools = [{ id: 't1', name: 'Custom Tool', icon: 'eva-cube-outline', meta: {} }]

    await wrapper.vm.$nextTick()

    const toolOptions = wrapper.vm.toolOptions
    expect(toolOptions.length).toBeGreaterThan(5) // 5 built-in + custom
    expect(toolOptions.some((opt) => opt.value === 'select')).toBe(true)
    expect(toolOptions.some((opt) => opt.value === 'Custom Tool')).toBe(true)
  })

  it('resets form when resetForm is called', async () => {
    wrapper.vm.form = { id: 'test', name: 'Test', tool: 'pan', configJson: '{"test": true}' }
    wrapper.vm.resetForm()

    expect(wrapper.vm.form).toEqual({
      id: null,
      name: '',
      tool: 'select',
      configJson: '{}',
    })
  })

  it('resets tool form when resetToolForm is called', async () => {
    wrapper.vm.toolForm = {
      id: 'test',
      name: 'Test',
      icon: 'test-icon',
      metaJson: '{"test": true}',
    }
    wrapper.vm.resetToolForm()

    expect(wrapper.vm.toolForm).toEqual({
      id: null,
      name: '',
      icon: '',
      metaJson: '{}',
    })
  })

  it('loads preset into form when selectPreset is called', () => {
    const preset = {
      id: 'p1',
      name: 'Test Preset',
      tool: 'pan',
      config: { snapEnabled: true },
    }

    wrapper.vm.selectPreset(preset)

    expect(wrapper.vm.form.id).toBe('p1')
    expect(wrapper.vm.form.name).toBe('Test Preset')
    expect(wrapper.vm.form.tool).toBe('pan')
    expect(wrapper.vm.form.configJson).toContain('snapEnabled')
  })

  it('loads custom tool into form when selectCustomTool is called', () => {
    const tool = {
      id: 't1',
      name: 'Custom Tool',
      icon: 'eva-cube-outline',
      meta: { description: 'Test' },
    }

    wrapper.vm.selectCustomTool(tool)

    expect(wrapper.vm.toolForm.id).toBe('t1')
    expect(wrapper.vm.toolForm.name).toBe('Custom Tool')
    expect(wrapper.vm.toolForm.icon).toBe('eva-cube-outline')
    expect(wrapper.vm.toolForm.metaJson).toContain('description')
  })
})
