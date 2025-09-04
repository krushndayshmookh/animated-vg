<template>
  <div class="canvas-container" data-test="canvas-container">
    <!-- Scrollable Canvas Area -->
    <div ref="scrollContainer" class="canvas-scroll-area" @scroll="onScroll" @wheel="onWheel">
      <div ref="canvasWrapper" class="canvas-wrapper" :style="canvasWrapperStyle">
        <!-- Canvas Background -->
        <div ref="canvasBackground" class="canvas-background" :style="canvasBackgroundStyle">
          <!-- Canvas Border -->
          <div class="canvas-border" :style="canvasBorderStyle"></div>

          <!-- SVG Content -->
          <div
            ref="svgContainer"
            class="svg-container"
            :style="svgContainerStyle"
            @mousedown="onMouseDown"
            @mousemove="onMouseMove"
            @mouseup="onMouseUp"
            @click="onClick"
          >
            <!-- eslint-disable-next-line vue/no-v-html -->
            <div v-html="safeSvgHtml"></div>

            <!-- Selection Outline -->
            <div
              v-if="selectionBox"
              class="selection-outline"
              :style="selectionStyle"
              data-test="selection-outline"
              @mousedown.stop="onSelectionMouseDown"
            />

            <!-- Rubber Band -->
            <div
              v-if="rubberBand"
              class="rubber-outline"
              :style="rubberStyle"
              data-test="rubber-band"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useEditorStore } from 'src/stores/editor-store.js'
import DOMPurify from 'dompurify'

const props = defineProps({
  zoom: {
    type: Number,
    default: 1,
  },
})

const emit = defineEmits(['zoom-in', 'zoom-out'])

const store = useEditorStore()

const smilAttrs = [
  'begin',
  'dur',
  'end',
  'min',
  'max',
  'repeatCount',
  'repeatDur',
  'fill',
  'restart',
  'calcMode',
  'keyPoints',
  'keySplines',
  'keyTimes',
  'values',
  'from',
  'to',
  'by',
  'path',
  'keyPoints',
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

// Canvas state
const scrollContainer = ref(null)
const canvasWrapper = ref(null)
const canvasBackground = ref(null)
const svgContainer = ref(null)

// Canvas dimensions and zoom
const canvasWidth = computed(() => store.canvasWidth)
const canvasHeight = computed(() => store.canvasHeight)
const scrollX = ref(0)
const scrollY = ref(0)

// Drawing state
const drawing = ref(false)
const start = ref({ x: 0, y: 0 })
const current = ref({ x: 0, y: 0 })
const draggingSelection = ref(false)
const dragOffset = ref({ dx: 0, dy: 0 })

// Computed styles
const canvasWrapperStyle = computed(() => ({
  width: `${canvasWidth.value * props.zoom}px`,
  height: `${canvasHeight.value * props.zoom}px`,
  position: 'relative',
}))

const canvasBackgroundStyle = computed(() => ({
  width: `${canvasWidth.value * props.zoom}px`,
  height: `${canvasHeight.value * props.zoom}px`,
  position: 'relative',
  background: '#f8f9fa',
  border: '1px solid #e0e0e0',
}))

const canvasBorderStyle = computed(() => ({
  position: 'absolute',
  top: '0',
  left: '0',
  width: `${canvasWidth.value * props.zoom}px`,
  height: `${canvasHeight.value * props.zoom}px`,
  border: '2px solid #1976d2',
  pointerEvents: 'none',
  zIndex: 1,
}))

const svgContainerStyle = computed(() => ({
  position: 'absolute',
  top: '0',
  left: '0',
  width: `${canvasWidth.value * props.zoom}px`,
  height: `${canvasHeight.value * props.zoom}px`,
  pointerEvents: 'auto',
  zIndex: 2,
}))

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
    left: `${x * props.zoom}px`,
    top: `${y * props.zoom}px`,
    width: `${width * props.zoom}px`,
    height: `${height * props.zoom}px`,
    pointerEvents: 'auto',
    zIndex: 3,
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
    left: `${x * props.zoom}px`,
    top: `${y * props.zoom}px`,
    width: `${width * props.zoom}px`,
    height: `${height * props.zoom}px`,
    pointerEvents: 'none',
    zIndex: 3,
  }
})

// Zoom functions are now handled by parent component

function updateCanvasSize() {
  // Update SVG viewBox to match canvas dimensions
  store.updateSvgViewBox()
}

// Coordinate conversion
function toLocalCoords(evt) {
  const svgEl = svgContainer.value
  if (!svgEl) return { x: 0, y: 0 }

  const rect = svgEl.getBoundingClientRect()
  const x = (evt.clientX - rect.left) / props.zoom
  const y = (evt.clientY - rect.top) / props.zoom
  return { x, y }
}

// Event handlers
function onScroll() {
  if (!scrollContainer.value) return
  scrollX.value = scrollContainer.value.scrollLeft
  scrollY.value = scrollContainer.value.scrollTop
}

function onWheel(evt) {
  if (evt.ctrlKey || evt.metaKey) {
    evt.preventDefault()
    // Emit zoom events to parent component
    if (evt.deltaY < 0) {
      emit('zoom-in')
    } else {
      emit('zoom-out')
    }
  }
}

function onMouseDown(evt) {
  if (
    store.activeTool === 'rect' ||
    store.activeTool === 'ellipse' ||
    store.activeTool === 'line'
  ) {
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
  if (
    drawing.value &&
    (store.activeTool === 'rect' || store.activeTool === 'ellipse' || store.activeTool === 'line')
  ) {
    const end = toLocalCoords(evt)
    const w = end.x - start.value.x
    const h = end.y - start.value.y
    if (store.activeTool === 'rect') {
      if (Math.abs(w) > 2 && Math.abs(h) > 2) store.addRect(start.value.x, start.value.y, w, h)
    } else if (store.activeTool === 'ellipse') {
      if (Math.abs(w) > 2 && Math.abs(h) > 2) store.addEllipse(start.value.x, start.value.y, w, h)
    } else if (store.activeTool === 'line') {
      if (Math.abs(w) > 2 || Math.abs(h) > 2)
        store.addLine(start.value.x, start.value.y, end.x, end.y)
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

// Watch for canvas dimension changes and center
watch([canvasWidth, canvasHeight], () => {
  nextTick(() => {
    centerCanvas()
  })
})

// Resize observer for centering
let resizeObserver = null

// Initialize canvas dimensions from store
onMounted(() => {
  updateCanvasSize()
  // Center the canvas initially
  nextTick(() => {
    centerCanvas()

    // Set up resize observer
    if (scrollContainer.value) {
      resizeObserver = new ResizeObserver(() => {
        centerCanvas()
      })
      resizeObserver.observe(scrollContainer.value)
    }
  })
})

onUnmounted(() => {
  if (resizeObserver) {
    resizeObserver.disconnect()
  }
})

// Center the canvas in the viewport (now handled by CSS flexbox)
function centerCanvas() {
  // With CSS flexbox centering, this function is mainly for scroll position updates
  if (!scrollContainer.value) return

  const container = scrollContainer.value
  const containerWidth = container.clientWidth
  const containerHeight = container.clientHeight

  // Only center if canvas is larger than viewport
  const canvasWidthPx = canvasWidth.value * props.zoom
  const canvasHeightPx = canvasHeight.value * props.zoom

  if (canvasWidthPx > containerWidth || canvasHeightPx > containerHeight) {
    const centerX = Math.max(0, (canvasWidthPx - containerWidth) / 2)
    const centerY = Math.max(0, (canvasHeightPx - containerHeight) / 2)

    container.scrollLeft = centerX
    container.scrollTop = centerY
    scrollX.value = centerX
    scrollY.value = centerY
  }
}
</script>

<style scoped>
.canvas-container {
  height: 100%;
  width: 100%;
  background: #f5f5f5;
  position: relative;
}

.canvas-scroll-area {
  height: 100%;
  width: 100%;
  overflow: auto;
  background: #f0f0f0;
  position: relative;
  background-image: radial-gradient(circle, #ccc 1px, transparent 1px);
  background-size: 20px 20px;
  background-position:
    0 0,
    10px 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.canvas-wrapper {
  position: relative;
  margin: 20px;
  display: block;
  flex-shrink: 0;
}

.canvas-background {
  position: relative;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  overflow: hidden;
}

.canvas-border {
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: none;
  border-radius: 4px;
}

.svg-container {
  position: absolute;
  top: 0;
  left: 0;
}

.svg-container :deep(svg) {
  width: 100%;
  height: 100%;
  display: block;
}

.selection-outline {
  border: 2px dashed #1976d2;
  box-shadow: 0 0 0 1px rgba(25, 118, 210, 0.3) inset;
  border-radius: 2px;
  pointer-events: auto;
}

.rubber-outline {
  border: 1px dashed rgba(25, 118, 210, 0.8);
  background: rgba(25, 118, 210, 0.1);
  border-radius: 2px;
  pointer-events: none;
}

/* Scrollbar styling */
.canvas-scroll-area::-webkit-scrollbar {
  width: 12px;
  height: 12px;
}

.canvas-scroll-area::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 6px;
}

.canvas-scroll-area::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 6px;
}

.canvas-scroll-area::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .canvas-controls {
    flex-direction: column;
    gap: 8px;
    padding: 8px;
  }

  .canvas-info {
    justify-content: center;
  }

  .zoom-controls {
    justify-content: center;
  }
}
</style>
