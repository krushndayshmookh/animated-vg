import { describe, it, expect, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useEditorStore } from '../src/stores/editor-store.js'

describe('M7: advanced tools and polish', () => {
  beforeEach(() => {
    const pinia = createPinia()
    setActivePinia(pinia)
  })

  it('snaps drawing and movement when enabled', () => {
    const store = useEditorStore()
    store.setSnap(true, 10)
    const id = store.addRect(3, 7, 11, 14)
    const rect = store.getRectById(id)
    expect(rect.x).toBe(0)
    expect(rect.y).toBe(10)
    expect(rect.width % 10).toBe(0)
    expect(rect.height % 10).toBe(0)
    store.selectedId = id
    store.moveSelectedTo(23, 26)
    const moved = store.getRectById(id)
    expect(moved.x).toBe(20)
    expect(moved.y).toBe(30)
  })

  it('groups and ungroups', () => {
    const store = useEditorStore()
    const a = store.addRect(10, 10, 20, 20)
    store.selectedId = a
    const gid = store.groupSelected()
    expect(gid).toBeTruthy()
    // target still exists and is child of group
    const doc = new DOMParser().parseFromString(store.xml, 'image/svg+xml')
    const g = doc.getElementById(gid)
    expect(g).toBeTruthy()
    expect(g.children.length).toBe(1)
    store.selectedId = gid
    store.ungroupSelected()
    const doc2 = new DOMParser().parseFromString(store.xml, 'image/svg+xml')
    const g2 = doc2.getElementById(gid)
    expect(g2).toBeFalsy()
  })

  it('z-order changes', () => {
    const store = useEditorStore()
    const a = store.addRect(0, 0, 10, 10)
    const b = store.addRect(0, 0, 10, 10)
    store.selectedId = a
    store.bringToFront()
    let doc = new DOMParser().parseFromString(store.xml, 'image/svg+xml')
    const svg = doc.documentElement
    expect(svg.lastElementChild.getAttribute('id')).toBe(a)
    store.selectedId = b
    store.sendToBack()
    doc = new DOMParser().parseFromString(store.xml, 'image/svg+xml')
    expect(doc.documentElement.firstElementChild.getAttribute('id')).toBe(b)
  })

  it('converts rect/line to path', () => {
    const store = useEditorStore()
    const rid = store.addRect(5, 5, 10, 10)
    store.selectedId = rid
    store.convertSelectedToPath()
    let doc = new DOMParser().parseFromString(store.xml, 'image/svg+xml')
    const path = doc.getElementById(rid)
    expect(path.tagName.toLowerCase()).toBe('path')
    expect(path.getAttribute('d')).toContain('Z')

    const lid = store.addLine(0, 0, 10, 10)
    store.selectedId = lid
    store.convertSelectedToPath()
    doc = new DOMParser().parseFromString(store.xml, 'image/svg+xml')
    const lpath = doc.getElementById(lid)
    expect(lpath.tagName.toLowerCase()).toBe('path')
    expect(lpath.getAttribute('fill')).toBe('none')
  })
})
