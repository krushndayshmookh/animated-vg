<template>
  <div ref="rootEl" class="editor-canvas fit bg-white" data-test="editor-canvas" @mousedown="onMouseDown" @mousemove="onMouseMove" @mouseup="onMouseUp" @click="onClick">
    <!-- eslint-disable-next-line vue/no-v-html -->
    <div class="fit" v-html="safeSvgHtml" />
    <div
      v-if="selectionBox"
      class="selection-outline"
      :style="selectionStyle"
      data-test="selection-outline"
      @mousedown.stop="onSelectionMouseDown"
    />
    <div
      v-if="rubberBand"
      class="rubber-outline"
      :style="rubberStyle"
      data-test="rubber-band"
    />
  </div>

</template>

<script setup>
import { computed, ref } from 'vue'
import { useEditorStore } from 'src/stores/editor-store.js'
import DOMPurify from 'dompurify'

const store = useEditorStore()

const smilAttrs = [
  'begin','dur','end','min','max','repeatCount','repeatDur','fill','restart','calcMode','keyPoints','keySplines','keyTimes','values','from','to','by','path','keyPoints'
]

function sanitizeSvg(html) {
  try {
    return DOMPurify.sanitize(html, {
      USE_PROFILES: { svg: true, svgFilters: true },
      ADD_ATTR: smilAttrs,
      // No scripts or event handlers
      FORBID_TAGS: ['script'],
      FORBID_ATTR: [/^on.*/i],
    })
  } catch {
    return html
  }
}

const safeSvgHtml = computed(() => sanitizeSvg(store.xml))

// Drawing state
const rootEl = ref(null)
const drawing = ref(false)
const start = ref({ x: 0, y: 0 })
const current = ref({ x: 0, y: 0 })
const draggingSelection = ref(false)
const dragOffset = ref({ dx: 0, dy: 0 })
const selectionBox = computed(() => {
  if (!store.selectedId) return null
  const rect = store.getRectById(store.selectedId)
  return rect
})
const selectionStyle = computed(() => {
  if (!selectionBox.value) return {}
  const { x, y, width, height } = selectionBox.value
  return {
    position: 'absolute',
    left: `${x}px`,
    top: `${y}px`,
    width: `${width}px`,
    height: `${height}px`,
    pointerEvents: 'auto',
    zIndex: 2,
  }
})

const rubberBand = computed(() => {
  if (!drawing.value) return null
  const x = Math.min(start.value.x, current.value.x)
  const y = Math.min(start.value.y, current.value.y)
  const w = Math.abs(current.value.x - start.value.x)
  const h = Math.abs(current.value.y - start.value.y)
  if (w < 2 || h < 2) return null
  return { x, y, width: w, height: h }
})

const rubberStyle = computed(() => {
  if (!rubberBand.value) return {}
  const { x, y, width, height } = rubberBand.value
  return {
    position: 'absolute',
    left: `${x}px`,
    top: `${y}px`,
    width: `${width}px`,
    height: `${height}px`,
    pointerEvents: 'none',
    zIndex: 1,
  }
})

function toLocalCoords(evt) {
  const host = rootEl.value || evt.currentTarget
  const rect = host.getBoundingClientRect()
  const x = evt.clientX - rect.left
  const y = evt.clientY - rect.top
  return { x, y }
}

function onMouseDown(evt) {
  if (store.activeTool === 'rect') {
    drawing.value = true
    start.value = toLocalCoords(evt)
    current.value = { ...start.value }
  }
}

function onMouseMove(evt) {
  if (drawing.value) {
    current.value = toLocalCoords(evt)
  }
  if (draggingSelection.value && store.selectedId) {
    const p = toLocalCoords(evt)
    const nx = p.x - dragOffset.value.dx
    const ny = p.y - dragOffset.value.dy
    store.moveSelectedTo(nx, ny)
  }
}

function onMouseUp(evt) {
  if (drawing.value && store.activeTool === 'rect') {
    const end = toLocalCoords(evt)
    const w = end.x - start.value.x
    const h = end.y - start.value.y
    if (Math.abs(w) > 2 && Math.abs(h) > 2) {
      store.addRect(start.value.x, start.value.y, w, h)
    }
    drawing.value = false
  }
  if (draggingSelection.value) {
    draggingSelection.value = false
  }
}

function onClick(evt) {
  if (store.activeTool !== 'select') return
  const p = toLocalCoords(evt)
  store.setSelectionByPoint(p.x, p.y)
}

function onSelectionMouseDown(evt) {
  if (store.activeTool !== 'select' || !selectionBox.value) return
  const p = toLocalCoords(evt)
  dragOffset.value = { dx: p.x - selectionBox.value.x, dy: p.y - selectionBox.value.y }
  draggingSelection.value = true
}
</script>

<style scoped>
.editor-canvas {
  background: #f8f9fa;
  position: relative;
}
.fit {
  width: 100%;
  height: 100%;
  display: block;
}
.selection-outline {
  border: 1px dashed #1976d2;
  box-shadow: 0 0 0 1px rgba(25,118,210,0.3) inset;
}
.rubber-outline {
  border: 1px dashed rgba(0,0,0,0.5);
  background: rgba(25,118,210,0.08);
}
</style>
