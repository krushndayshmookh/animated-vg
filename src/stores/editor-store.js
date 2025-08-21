import { defineStore } from 'pinia'
import { importSvg, exportSvg } from 'src/services/svg-io'

export const useEditorStore = defineStore('editor', {
  state: () => ({
    xml: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600"></svg>',
    metadata: { title: '', viewBox: '0 0 800 600', size: { w: 800, h: 600 } },
    activeTool: 'select',
    selectedId: null,
    _idCounter: 1,
  }),
  actions: {
    loadFromXml(xml) {
      const { metadata } = importSvg(xml)
      this.xml = xml
      this.metadata = metadata
    },
    setActiveTool(tool) {
      this.activeTool = tool
    },
    setTitle(title) {
      this.metadata.title = title
      const doc = new DOMParser().parseFromString(this.xml, 'image/svg+xml')
      let titleEl = doc.querySelector('svg > title')
      if (!titleEl) {
        titleEl = doc.createElement('title')
        doc.documentElement.insertBefore(titleEl, doc.documentElement.firstChild)
      }
      titleEl.textContent = title
      this.xml = new XMLSerializer().serializeToString(doc.documentElement)
    },
    _genId(prefix = 'el') {
      const id = `${prefix}-${this._idCounter++}`
      return id
    },
    addRect(x, y, width, height, attrs = {}) {
      const doc = new DOMParser().parseFromString(this.xml, 'image/svg+xml')
      const svg = doc.documentElement
      const rect = doc.createElement('rect')
      const id = this._genId('rect')
      rect.setAttribute('id', id)
      rect.setAttribute('x', String(Math.min(x, x + width)))
      rect.setAttribute('y', String(Math.min(y, y + height)))
      rect.setAttribute('width', String(Math.abs(width)))
      rect.setAttribute('height', String(Math.abs(height)))
      rect.setAttribute('fill', attrs.fill || 'rgba(0,0,0,0.1)')
      rect.setAttribute('stroke', attrs.stroke || '#333')
      rect.setAttribute('stroke-width', attrs.strokeWidth ? String(attrs.strokeWidth) : '1')
      svg.appendChild(rect)
      this.xml = new XMLSerializer().serializeToString(svg)
      return id
    },
    clearSelection() {
      this.selectedId = null
    },
    setSelectionByPoint(px, py) {
      const doc = new DOMParser().parseFromString(this.xml, 'image/svg+xml')
      const rects = Array.from(doc.querySelectorAll('rect'))
      let picked = null
      for (const r of rects) {
        const x = parseFloat(r.getAttribute('x') || '0')
        const y = parseFloat(r.getAttribute('y') || '0')
        const w = parseFloat(r.getAttribute('width') || '0')
        const h = parseFloat(r.getAttribute('height') || '0')
        if (px >= x && px <= x + w && py >= y && py <= y + h) {
          picked = r.getAttribute('id')
        }
      }
      this.selectedId = picked
      return picked
    },
    getRectById(id) {
      const doc = new DOMParser().parseFromString(this.xml, 'image/svg+xml')
      const el = doc.getElementById(id)
      if (!el || el.tagName !== 'rect') return null
      const x = parseFloat(el.getAttribute('x') || '0')
      const y = parseFloat(el.getAttribute('y') || '0')
      const width = parseFloat(el.getAttribute('width') || '0')
      const height = parseFloat(el.getAttribute('height') || '0')
      return { x, y, width, height }
    },
    moveSelectedTo(nx, ny) {
      if (!this.selectedId) return
      const doc = new DOMParser().parseFromString(this.xml, 'image/svg+xml')
      const el = doc.getElementById(this.selectedId)
      if (!el) return
      if (el.tagName === 'rect') {
        el.setAttribute('x', String(nx))
        el.setAttribute('y', String(ny))
      }
      const svg = doc.documentElement
      this.xml = new XMLSerializer().serializeToString(svg)
    },
    exportXml(pretty = false) {
      return exportSvg(this.xml, { pretty })
    },
  },
})
