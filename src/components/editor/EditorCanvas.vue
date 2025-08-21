<template>
  <div class="editor-canvas fit bg-white" data-test="editor-canvas" @mousedown="onMouseDown" @mousemove="onMouseMove" @mouseup="onMouseUp" @click="onClick">
  <!-- eslint-disable-next-line vue/no-v-html -->
  <div class="fit" v-html="safeSvgHtml" />
  <div v-if="selectionBox" class="selection-outline" :style="selectionStyle" data-test="selection-outline" />
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
const drawing = ref(false)
const start = ref({ x: 0, y: 0 })
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
    pointerEvents: 'none',
  }
})

function toLocalCoords(evt) {
  const rect = (evt.currentTarget).getBoundingClientRect()
  const x = evt.clientX - rect.left
  const y = evt.clientY - rect.top
  return { x, y }
}

function onMouseDown(evt) {
  if (store.activeTool !== 'rect') return
  drawing.value = true
  start.value = toLocalCoords(evt)
}

function onMouseMove() {
  // MVP: no live rubber-banding; next iteration can add overlay
}

function onMouseUp(evt) {
  if (!drawing.value || store.activeTool !== 'rect') return
  const end = toLocalCoords(evt)
  const w = end.x - start.value.x
  const h = end.y - start.value.y
  if (Math.abs(w) > 2 && Math.abs(h) > 2) {
    store.addRect(start.value.x, start.value.y, w, h)
  }
  drawing.value = false
}

function onClick(evt) {
  if (store.activeTool !== 'select') return
  const p = toLocalCoords(evt)
  store.setSelectionByPoint(p.x, p.y)
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
</style>
