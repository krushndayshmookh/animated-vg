import { defineStore } from 'pinia'
import { importSvg, exportSvg } from 'src/services/svg-io'

export const useEditorStore = defineStore('editor', {
  state: () => ({
    sidebarLeftOpen: false,
    sidebarRightOpen: false,
    sidebarBottomOpen: false,

    xml: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600"></svg>',
    metadata: { title: '', viewBox: '0 0 800 600', size: { w: 800, h: 600 } },
    activeTool: 'select',
    selectedId: null,
    _idCounter: 1,
    undoStack: [],
    redoStack: [],
    // M7 settings
    snapEnabled: false,
    snapSize: 10,
    showGrid: false,
  }),
  actions: {
    toggleSidebarLeft() {
      this.sidebarLeftOpen = !this.sidebarLeftOpen
    },
    toggleSidebarRight() {
      this.sidebarRightOpen = !this.sidebarRightOpen
    },
    toggleSidebarBottom() {
      this.sidebarBottomOpen = !this.sidebarBottomOpen
    },

    // Settings
    setSnap(enabled, size) {
      this.snapEnabled = !!enabled
      if (typeof size === 'number' && size > 0) this.snapSize = size
    },
    setShowGrid(show) {
      this.showGrid = !!show
    },
    _snap(n) {
      if (!this.snapEnabled) return n
      const s = this.snapSize || 10
      return Math.round(n / s) * s
    },
    loadFromXml(xml) {
      const { metadata } = importSvg(xml)
      this.xml = xml
      this.metadata = metadata
      this.undoStack = []
      this.redoStack = []
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
      const before = this.xml
      const doc = new DOMParser().parseFromString(this.xml, 'image/svg+xml')
      const svg = doc.documentElement
      const rect = doc.createElement('rect')
      const id = this._genId('rect')
      const sx = this._snap(x)
      const sy = this._snap(y)
      const ex = this._snap(x + width)
      const ey = this._snap(y + height)
      const nx = Math.min(sx, ex)
      const ny = Math.min(sy, ey)
      const nw = Math.abs(ex - sx)
      const nh = Math.abs(ey - sy)
      rect.setAttribute('id', id)
      rect.setAttribute('x', String(nx))
      rect.setAttribute('y', String(ny))
      rect.setAttribute('width', String(nw))
      rect.setAttribute('height', String(nh))
      rect.setAttribute('fill', attrs.fill || 'rgba(0,0,0,0.1)')
      rect.setAttribute('stroke', attrs.stroke || '#333')
      rect.setAttribute('stroke-width', attrs.strokeWidth ? String(attrs.strokeWidth) : '1')
      svg.appendChild(rect)
      this.xml = new XMLSerializer().serializeToString(svg)
      this.undoStack.push(before)
      this.redoStack = []
      return id
    },
    addEllipse(x, y, width, height, attrs = {}) {
      const before = this.xml
      const doc = new DOMParser().parseFromString(this.xml, 'image/svg+xml')
      const svg = doc.documentElement
      const el = doc.createElement('ellipse')
      const id = this._genId('ellipse')
      const sx = this._snap(x)
      const sy = this._snap(y)
      const ex = this._snap(x + width)
      const ey = this._snap(y + height)
      const nx = Math.min(sx, ex)
      const ny = Math.min(sy, ey)
      const w = Math.abs(ex - sx)
      const h = Math.abs(ey - sy)
      const cx = nx + w / 2
      const cy = ny + h / 2
      const rx = Math.max(0, w / 2)
      const ry = Math.max(0, h / 2)
      el.setAttribute('id', id)
      el.setAttribute('cx', String(cx))
      el.setAttribute('cy', String(cy))
      el.setAttribute('rx', String(rx))
      el.setAttribute('ry', String(ry))
      el.setAttribute('fill', attrs.fill || 'rgba(0,0,0,0.1)')
      el.setAttribute('stroke', attrs.stroke || '#333')
      el.setAttribute('stroke-width', attrs.strokeWidth ? String(attrs.strokeWidth) : '1')
      svg.appendChild(el)
      this.xml = new XMLSerializer().serializeToString(svg)
      this.undoStack.push(before)
      this.redoStack = []
      return id
    },
    addLine(x1, y1, x2, y2, attrs = {}) {
      const before = this.xml
      const doc = new DOMParser().parseFromString(this.xml, 'image/svg+xml')
      const svg = doc.documentElement
      const el = doc.createElement('line')
      const id = this._genId('line')
      const sx1 = this._snap(x1)
      const sy1 = this._snap(y1)
      const sx2 = this._snap(x2)
      const sy2 = this._snap(y2)
      el.setAttribute('id', id)
      el.setAttribute('x1', String(sx1))
      el.setAttribute('y1', String(sy1))
      el.setAttribute('x2', String(sx2))
      el.setAttribute('y2', String(sy2))
      el.setAttribute('stroke', attrs.stroke || '#333')
      el.setAttribute('stroke-width', attrs.strokeWidth ? String(attrs.strokeWidth) : '2')
      el.setAttribute('fill', 'none')
      svg.appendChild(el)
      this.xml = new XMLSerializer().serializeToString(svg)
      this.undoStack.push(before)
      this.redoStack = []
      return id
    },
    addOpacityAnimation(
      targetId,
      { from = 1, to = 0.5, dur = '1s', begin = '0s', fill = 'freeze' } = {},
    ) {
      const before = this.xml
      const doc = new DOMParser().parseFromString(this.xml, 'image/svg+xml')
      const target = doc.getElementById(targetId)
      if (!target) return null
      // Avoid adding an identical duplicate
      const existing = Array.from(target.children).find(
        (c) =>
          (c.tagName || '').toLowerCase() === 'animate' &&
          c.getAttribute('attributeName') === 'opacity' &&
          c.getAttribute('from') === String(from) &&
          c.getAttribute('to') === String(to) &&
          c.getAttribute('dur') === String(dur) &&
          c.getAttribute('begin') === String(begin) &&
          c.getAttribute('fill') === String(fill),
      )
      if (existing) return existing
      const anim = doc.createElement('animate')
      anim.setAttribute('attributeName', 'opacity')
      anim.setAttribute('from', String(from))
      anim.setAttribute('to', String(to))
      anim.setAttribute('dur', String(dur))
      anim.setAttribute('begin', String(begin))
      anim.setAttribute('fill', String(fill))
      target.appendChild(anim)
      this.xml = new XMLSerializer().serializeToString(doc.documentElement)
      this.undoStack.push(before)
      this.redoStack = []
      return anim
    },
    clearSelection() {
      this.selectedId = null
    },
    setSelectionByPoint(px, py) {
      const doc = new DOMParser().parseFromString(this.xml, 'image/svg+xml')
      const svg = doc.documentElement
      const candidates = Array.from(svg.children)
      let picked = null
      for (const el of candidates) {
        const tag = el.tagName
        if (tag === 'rect') {
          const x = parseFloat(el.getAttribute('x') || '0')
          const y = parseFloat(el.getAttribute('y') || '0')
          const w = parseFloat(el.getAttribute('width') || '0')
          const h = parseFloat(el.getAttribute('height') || '0')
          if (px >= x && px <= x + w && py >= y && py <= y + h) picked = el.getAttribute('id')
        } else if (tag === 'ellipse') {
          const cx = parseFloat(el.getAttribute('cx') || '0')
          const cy = parseFloat(el.getAttribute('cy') || '0')
          const rx = parseFloat(el.getAttribute('rx') || '0')
          const ry = parseFloat(el.getAttribute('ry') || '0')
          const nx = (px - cx) / (rx || 1)
          const ny = (py - cy) / (ry || 1)
          if (nx * nx + ny * ny <= 1) picked = el.getAttribute('id')
        } else if (tag === 'line') {
          const x1 = parseFloat(el.getAttribute('x1') || '0')
          const y1 = parseFloat(el.getAttribute('y1') || '0')
          const x2 = parseFloat(el.getAttribute('x2') || '0')
          const y2 = parseFloat(el.getAttribute('y2') || '0')
          const dist = (function distanceToSegment(px, py, x1, y1, x2, y2) {
            const A = px - x1
            const B = py - y1
            const C = x2 - x1
            const D = y2 - y1
            const dot = A * C + B * D
            const len_sq = C * C + D * D || 1
            let t = dot / len_sq
            t = Math.max(0, Math.min(1, t))
            const xx = x1 + t * C
            const yy = y1 + t * D
            const dx = px - xx
            const dy = py - yy
            return Math.sqrt(dx * dx + dy * dy)
          })(px, py, x1, y1, x2, y2)
          if (dist <= 3) picked = el.getAttribute('id')
        }
      }
      this.selectedId = picked
      return picked
    },
    getBBoxById(id) {
      const doc = new DOMParser().parseFromString(this.xml, 'image/svg+xml')
      const el = doc.getElementById(id)
      if (!el) return null
      if (el.tagName === 'rect') {
        const x = parseFloat(el.getAttribute('x') || '0')
        const y = parseFloat(el.getAttribute('y') || '0')
        const width = parseFloat(el.getAttribute('width') || '0')
        const height = parseFloat(el.getAttribute('height') || '0')
        return { x, y, width, height }
      }
      if (el.tagName === 'ellipse') {
        const cx = parseFloat(el.getAttribute('cx') || '0')
        const cy = parseFloat(el.getAttribute('cy') || '0')
        const rx = parseFloat(el.getAttribute('rx') || '0')
        const ry = parseFloat(el.getAttribute('ry') || '0')
        return { x: cx - rx, y: cy - ry, width: rx * 2, height: ry * 2 }
      }
      if (el.tagName === 'line') {
        const x1 = parseFloat(el.getAttribute('x1') || '0')
        const y1 = parseFloat(el.getAttribute('y1') || '0')
        const x2 = parseFloat(el.getAttribute('x2') || '0')
        const y2 = parseFloat(el.getAttribute('y2') || '0')
        const x = Math.min(x1, x2)
        const y = Math.min(y1, y2)
        const width = Math.abs(x2 - x1)
        const height = Math.abs(y2 - y1)
        return { x, y, width, height }
      }
      return null
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
    getSelectedAttrs() {
      if (!this.selectedId) return null
      const doc = new DOMParser().parseFromString(this.xml, 'image/svg+xml')
      const el = doc.getElementById(this.selectedId)
      if (!el) return null
      const tag = el.tagName
      const common = {
        fill: el.getAttribute('fill') ?? '',
        stroke: el.getAttribute('stroke') ?? '',
        opacity: el.hasAttribute('opacity') ? parseFloat(el.getAttribute('opacity')) : 1,
      }
      if (tag === 'rect') {
        return {
          tag,
          ...common,
          x: parseFloat(el.getAttribute('x') || '0'),
          y: parseFloat(el.getAttribute('y') || '0'),
          width: parseFloat(el.getAttribute('width') || '0'),
          height: parseFloat(el.getAttribute('height') || '0'),
        }
      }
      if (tag === 'ellipse') {
        return {
          tag,
          ...common,
          cx: parseFloat(el.getAttribute('cx') || '0'),
          cy: parseFloat(el.getAttribute('cy') || '0'),
          rx: parseFloat(el.getAttribute('rx') || '0'),
          ry: parseFloat(el.getAttribute('ry') || '0'),
        }
      }
      if (tag === 'line') {
        return {
          tag,
          ...common,
          x1: parseFloat(el.getAttribute('x1') || '0'),
          y1: parseFloat(el.getAttribute('y1') || '0'),
          x2: parseFloat(el.getAttribute('x2') || '0'),
          y2: parseFloat(el.getAttribute('y2') || '0'),
        }
      }
      return { tag, ...common }
    },
    setSelectedAttrs(attrs = {}) {
      if (!this.selectedId) return
      const before = this.xml
      const doc = new DOMParser().parseFromString(this.xml, 'image/svg+xml')
      const el = doc.getElementById(this.selectedId)
      if (!el) return
      if (attrs.fill != null) el.setAttribute('fill', String(attrs.fill))
      if (attrs.stroke != null) el.setAttribute('stroke', String(attrs.stroke))
      if (attrs.opacity != null) el.setAttribute('opacity', String(Number(attrs.opacity)))
      if (el.tagName === 'rect') {
        if (attrs.x != null) el.setAttribute('x', String(Number(attrs.x)))
        if (attrs.y != null) el.setAttribute('y', String(Number(attrs.y)))
        if (attrs.width != null) el.setAttribute('width', String(Number(attrs.width)))
        if (attrs.height != null) el.setAttribute('height', String(Number(attrs.height)))
      } else if (el.tagName === 'ellipse') {
        if (attrs.cx != null) el.setAttribute('cx', String(Number(attrs.cx)))
        if (attrs.cy != null) el.setAttribute('cy', String(Number(attrs.cy)))
        if (attrs.rx != null) el.setAttribute('rx', String(Number(attrs.rx)))
        if (attrs.ry != null) el.setAttribute('ry', String(Number(attrs.ry)))
      } else if (el.tagName === 'line') {
        if (attrs.x1 != null) el.setAttribute('x1', String(Number(attrs.x1)))
        if (attrs.y1 != null) el.setAttribute('y1', String(Number(attrs.y1)))
        if (attrs.x2 != null) el.setAttribute('x2', String(Number(attrs.x2)))
        if (attrs.y2 != null) el.setAttribute('y2', String(Number(attrs.y2)))
      }
      const svg = doc.documentElement
      this.xml = new XMLSerializer().serializeToString(svg)
      this.undoStack.push(before)
      this.redoStack = []
    },
    moveSelectedTo(nx, ny) {
      if (!this.selectedId) return
      const doc = new DOMParser().parseFromString(this.xml, 'image/svg+xml')
      const el = doc.getElementById(this.selectedId)
      if (!el) return
      const sx = this._snap(nx)
      const sy = this._snap(ny)
      if (el.tagName === 'rect') {
        el.setAttribute('x', String(sx))
        el.setAttribute('y', String(sy))
      } else if (el.tagName === 'ellipse') {
        const rx = parseFloat(el.getAttribute('rx') || '0')
        const ry = parseFloat(el.getAttribute('ry') || '0')
        el.setAttribute('cx', String(sx + rx))
        el.setAttribute('cy', String(sy + ry))
      } else if (el.tagName === 'line') {
        const x1 = parseFloat(el.getAttribute('x1') || '0')
        const y1 = parseFloat(el.getAttribute('y1') || '0')
        const x2 = parseFloat(el.getAttribute('x2') || '0')
        const y2 = parseFloat(el.getAttribute('y2') || '0')
        const cur = { x: Math.min(x1, x2), y: Math.min(y1, y2) }
        const dx = sx - cur.x
        const dy = sy - cur.y
        el.setAttribute('x1', String(x1 + dx))
        el.setAttribute('y1', String(y1 + dy))
        el.setAttribute('x2', String(x2 + dx))
        el.setAttribute('y2', String(y2 + dy))
      }
      const svg = doc.documentElement
      this.xml = new XMLSerializer().serializeToString(svg)
    },
    // Grouping
    groupSelected() {
      if (!this.selectedId) return null
      const before = this.xml
      const doc = new DOMParser().parseFromString(this.xml, 'image/svg+xml')
      const svg = doc.documentElement
      const el = doc.getElementById(this.selectedId)
      if (!el || (el.parentNode === svg && el.tagName === 'g')) return null
      const parent = el.parentNode
      const g = doc.createElement('g')
      const gid = this._genId('group')
      g.setAttribute('id', gid)
      parent.replaceChild(g, el)
      g.appendChild(el)
      this.xml = new XMLSerializer().serializeToString(svg)
      this.undoStack.push(before)
      this.redoStack = []
      this.selectedId = el.getAttribute('id') // keep selection on child
      return gid
    },
    ungroupSelected() {
      if (!this.selectedId) return
      const before = this.xml
      const doc = new DOMParser().parseFromString(this.xml, 'image/svg+xml')
      const svg = doc.documentElement
      const el = doc.getElementById(this.selectedId)
      if (!el) return
      let group = null
      if (el.tagName === 'g') group = el
      else if (el.parentNode && el.parentNode.tagName === 'g') group = el.parentNode
      if (!group) return
      const parent = group.parentNode
      while (group.firstChild) {
        parent.insertBefore(group.firstChild, group)
      }
      parent.removeChild(group)
      this.xml = new XMLSerializer().serializeToString(svg)
      this.undoStack.push(before)
      this.redoStack = []
    },
    // Z-order
    _reorderSelected(direction) {
      if (!this.selectedId) return
      const before = this.xml
      const doc = new DOMParser().parseFromString(this.xml, 'image/svg+xml')
      const el = doc.getElementById(this.selectedId)
      if (!el || !el.parentNode) return
      const parent = el.parentNode
      const siblings = Array.from(parent.children)
      const idx = siblings.indexOf(el)
      if (idx === -1) return
      if (direction === 'front' && el.nextSibling) parent.appendChild(el)
      else if (direction === 'back' && el.previousSibling)
        parent.insertBefore(el, parent.firstChild)
      else if (direction === 'forward' && el.nextSibling) parent.insertBefore(el.nextSibling, el)
      else if (direction === 'backward' && el.previousSibling)
        parent.insertBefore(el, el.previousSibling)
      else return
      this.xml = new XMLSerializer().serializeToString(doc.documentElement)
      this.undoStack.push(before)
      this.redoStack = []
    },
    bringToFront() {
      this._reorderSelected('front')
    },
    sendToBack() {
      this._reorderSelected('back')
    },
    bringForward() {
      this._reorderSelected('forward')
    },
    sendBackward() {
      this._reorderSelected('backward')
    },
    // Path conversion (MVP: rect, line)
    convertSelectedToPath() {
      if (!this.selectedId) return
      const before = this.xml
      const doc = new DOMParser().parseFromString(this.xml, 'image/svg+xml')
      const el = doc.getElementById(this.selectedId)
      if (!el) return
      const tag = el.tagName
      const id = el.getAttribute('id')
      const parent = el.parentNode
      const path = doc.createElement('path')
      path.setAttribute('id', id)
      // carry over styling
      ;['fill', 'stroke', 'stroke-width', 'opacity'].forEach((a) => {
        if (el.hasAttribute(a)) path.setAttribute(a, el.getAttribute(a))
      })
      if (tag === 'rect') {
        const x = parseFloat(el.getAttribute('x') || '0')
        const y = parseFloat(el.getAttribute('y') || '0')
        const w = parseFloat(el.getAttribute('width') || '0')
        const h = parseFloat(el.getAttribute('height') || '0')
        const d = `M ${x} ${y} L ${x + w} ${y} L ${x + w} ${y + h} L ${x} ${y + h} Z`
        path.setAttribute('d', d)
      } else if (tag === 'line') {
        const x1 = parseFloat(el.getAttribute('x1') || '0')
        const y1 = parseFloat(el.getAttribute('y1') || '0')
        const x2 = parseFloat(el.getAttribute('x2') || '0')
        const y2 = parseFloat(el.getAttribute('y2') || '0')
        const d = `M ${x1} ${y1} L ${x2} ${y2}`
        path.setAttribute('d', d)
        path.setAttribute('fill', 'none')
      } else {
        return
      }
      parent.replaceChild(path, el)
      this.xml = new XMLSerializer().serializeToString(doc.documentElement)
      this.undoStack.push(before)
      this.redoStack = []
    },
    exportXml(pretty = false) {
      return exportSvg(this.xml, { pretty })
    },
    // M6: SMIL parse/list/update (animate only for MVP)
    _ensureElementIds(doc) {
      let changed = false
      const svg = doc.documentElement
      for (const el of Array.from(svg.children)) {
        if (!el.getAttribute) continue
        if (!el.getAttribute('id')) {
          const id = this._genId(el.tagName.toLowerCase())
          el.setAttribute('id', id)
          changed = true
        }
      }
      return changed
    },
    listAnimations(filterTargetId = null) {
      const doc = new DOMParser().parseFromString(this.xml, 'image/svg+xml')
      const changed = this._ensureElementIds(doc)
      if (changed) {
        this.xml = new XMLSerializer().serializeToString(doc.documentElement)
      }
      const svg = doc.documentElement
      const all = []
      for (const el of Array.from(svg.children)) {
        const targetId = el.getAttribute && el.getAttribute('id')
        if (!targetId) continue
        if (filterTargetId && targetId !== filterTargetId) continue
        const anims = Array.from(el.children).filter(
          (c) => (c.tagName || '').toLowerCase() === 'animate',
        )
        anims.forEach((animEl, idx) => {
          const entry = {
            kind: 'animate',
            animIndex: idx,
            targetId,
            attributeName: animEl.getAttribute('attributeName') || '',
            begin: animEl.getAttribute('begin') || '',
            dur: animEl.getAttribute('dur') || '',
            from: animEl.getAttribute('from') || '',
            to: animEl.getAttribute('to') || '',
            values: animEl.getAttribute('values') || '',
            keyTimes: animEl.getAttribute('keyTimes') || '',
            repeatCount: animEl.getAttribute('repeatCount') || '',
            fill: animEl.getAttribute('fill') || '',
          }
          all.push(entry)
        })
      }
      return all
    },
    updateAnimation(ref, props = {}) {
      // ref: { targetId, animIndex, kind: 'animate' }
      if (!ref || !ref.targetId) return
      const before = this.xml
      const doc = new DOMParser().parseFromString(this.xml, 'image/svg+xml')
      const target = doc.getElementById(ref.targetId)
      if (!target) return
      const list = Array.from(target.children).filter(
        (c) => (c.tagName || '').toLowerCase() === 'animate',
      )
      const anim = list[ref.animIndex || 0]
      if (!anim) return
      for (const [k, v] of Object.entries(props)) {
        if (v == null) continue
        anim.setAttribute(k, String(v))
      }
      this.xml = new XMLSerializer().serializeToString(doc.documentElement)
      this.undoStack.push(before)
      this.redoStack = []
    },
  },
})
