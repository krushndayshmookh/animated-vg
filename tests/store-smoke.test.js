import { describe, it, expect } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useCounterStore } from '../src/stores/example-store.js'

describe('store smoke', () => {
  it('increments counter', () => {
    setActivePinia(createPinia())
    const store = useCounterStore()
    expect(store.counter).toBe(0)
    store.increment()
    expect(store.counter).toBe(1)
  })
})
