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
              ref="selectionBoxElement"
              class="selection-outline"
              :style="selectionStyle"
              data-test="selection-outline"
              @mousedown.stop="onSelectionMouseDown"
            />

            <!-- TODO: Implement Rubber Band -->
            <!-- <div
              v-if="rubberBand"
              class="rubber-outline"
              :style="rubberStyle"
              data-test="rubber-band"
            /> -->
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

// Pan and zoom state
const panX = ref(0)
const panY = ref(0)
const isPanning = ref(false)
const lastPanPoint = ref({ x: 0, y: 0 })
const spacePressed = ref(false)
const scrollX = ref(0)
const scrollY = ref(0)

// Drawing state - commented out for simple canvas
// const drawing = ref(false)
// const start = ref({ x: 0, y: 0 })
// const current = ref({ x: 0, y: 0 })
// const draggingSelection = ref(false)
// const dragOffset = ref({ dx: 0, dy: 0 })

// Computed styles
const canvasWrapperStyle = computed(() => ({
  width: `${canvasWidth.value * props.zoom}px`,
  height: `${canvasHeight.value * props.zoom}px`,
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: `translate(calc(-50% + ${panX.value}px), calc(-50% + ${panY.value}px))`,
  transition: isPanning.value ? 'none' : 'transform 0.1s ease-out',
}))

const canvasBackgroundStyle = computed(() => ({
  width: `${canvasWidth.value * props.zoom}px`,
  height: `${canvasHeight.value * props.zoom}px`,
  position: 'relative',
  background: '#f8f9fa',
  cursor: isPanning.value
    ? 'grabbing'
    : spacePressed.value || store.activeTool === 'pan'
      ? 'grab'
      : 'default',
}))

const canvasBorderStyle = computed(() => ({
  position: 'absolute',
  top: '0',
  left: '0',
  width: `${canvasWidth.value * props.zoom}px`,
  height: `${canvasHeight.value * props.zoom}px`,
  border: '1px solid #1976d2',
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

// Selection box computation
const selectionBox = computed(() => (store.selectedId ? store.getBBoxById(store.selectedId) : null))
const selectionBoxElement = ref(null)

// Selection style computation
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

// Commented out for simple canvas
// const rubberBand = computed(() => {
//   if (!drawing.value) return null
//   const x = Math.min(start.value.x, current.value.x)
//   const y = Math.min(start.value.y, current.value.y)
//   const w = Math.abs(current.value.x - start.value.x)
//   const h = Math.abs(current.value.y - start.value.y)
//   if (w < 2 || h < 2) return null
//   return { x, y, width: w, height: h }
// })

// Commented out for simple canvas
// const rubberStyle = computed(() => {
//   if (!rubberBand.value) return {}
//   const { x, y, width, height } = rubberBand.value
//   return {
//     position: 'absolute',
//     left: `${x * props.zoom}px`,
//     top: `${y * props.zoom}px`,
//     width: `${width * props.zoom}px`,
//     height: `${height * props.zoom}px`,
//     pointerEvents: 'none',
//     zIndex: 3,
//   }
// })


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

    // Get mouse position relative to container
    const container = scrollContainer.value
    if (!container) return

    const rect = container.getBoundingClientRect()
    const mouseX = evt.clientX - rect.left
    const mouseY = evt.clientY - rect.top

    // Calculate zoom point in canvas coordinates
    const canvasMouseX = (mouseX - panX.value) / props.zoom
    const canvasMouseY = (mouseY - panY.value) / props.zoom

    // Emit zoom events to parent component
    if (evt.deltaY < 0) {
      emit('zoom-in')
    } else {
      emit('zoom-out')
    }

    // Adjust pan to keep mouse position stable after zoom
    // This needs to be done in nextTick to get the new zoom value
    nextTick(() => {
      const newZoom = props.zoom

      // Adjust pan position to keep mouse point stable
      panX.value = mouseX - canvasMouseX * newZoom
      panY.value = mouseY - canvasMouseY * newZoom
    })
  }
}

function onMouseDown(evt) {
  // Pan mode: Middle mouse button, spacebar + left click, or pan tool + left click
  if (
    evt.button === 1 ||
    (evt.button === 0 && spacePressed.value) ||
    (evt.button === 0 && store.activeTool === 'pan')
  ) {
    evt.preventDefault()
    isPanning.value = true
    lastPanPoint.value = { x: evt.clientX, y: evt.clientY }

    // Add global mouse event listeners
    document.addEventListener('mousemove', onDocumentMouseMove)
    document.addEventListener('mouseup', onDocumentMouseUp)
  }
}

function onMouseMove(evt) {
  // Handle panning when middle mouse is held or shift+drag
  if (isPanning.value) {
    evt.preventDefault()
    onDocumentMouseMove(evt)
  }
}

function onMouseUp(evt) {
  // Stop panning
  if (isPanning.value && (evt.button === 1 || evt.button === 0)) {
    evt.preventDefault()
    stopPanning()
  }
}

// Global mouse event handlers for smooth panning
function onDocumentMouseMove(evt) {
  if (!isPanning.value) return

  const deltaX = evt.clientX - lastPanPoint.value.x
  const deltaY = evt.clientY - lastPanPoint.value.y

  panX.value += deltaX
  panY.value += deltaY

  lastPanPoint.value = { x: evt.clientX, y: evt.clientY }
}

function onDocumentMouseUp() {
  if (isPanning.value) {
    stopPanning()
  }
}

function stopPanning() {
  isPanning.value = false
  document.removeEventListener('mousemove', onDocumentMouseMove)
  document.removeEventListener('mouseup', onDocumentMouseUp)
}

// Keyboard event handlers for spacebar panning
function onKeyDown(evt) {
  if (evt.code === 'Space' && !spacePressed.value) {
    evt.preventDefault()
    spacePressed.value = true
  } else if (evt.key === 'Delete' && store.selectedId) {
    evt.preventDefault()
    store.deleteSelected()
  }
}

function onKeyUp(evt) {
  if (evt.code === 'Space') {
    evt.preventDefault()
    spacePressed.value = false
    // Stop panning if space is released
    if (isPanning.value) {
      stopPanning()
    }
  }
}

function onClick(evt) {
  const p = toLocalCoords(evt)
  const selectedId = store.setSelectionByPoint(p.x, p.y)

  console.info('Canvas clicked, active tool:', store.activeTool, p)
  if (selectedId) {
    console.info('Selection result:', selectedId)
  }

  if (store.activeTool !== 'select') return
}

function onSelectionMouseDown(evt) {
  // Prevent the click from propagating to the canvas behind the selection
  evt.stopPropagation()
}

// Watch for canvas dimension changes and reset pan position
watch([canvasWidth, canvasHeight], () => {
  nextTick(() => {
    // Reset pan position when canvas size changes (e.g., import new file)
    panX.value = 0
    panY.value = 0
  })
})

// Resize observer for responsive behavior
let resizeObserver = null

// Initialize canvas
onMounted(() => {
  // Set up resize observer
  if (scrollContainer.value) {
    resizeObserver = new ResizeObserver(() => {
      // Container resized, could adjust pan if needed
    })
    resizeObserver.observe(scrollContainer.value)
  }

  // Add keyboard event listeners for spacebar panning
  document.addEventListener('keydown', onKeyDown)
  document.addEventListener('keyup', onKeyUp)
})

onUnmounted(() => {
  // Clean up event listeners and observers
  if (resizeObserver) {
    resizeObserver.disconnect()
  }

  // Clean up global event listeners
  document.removeEventListener('mousemove', onDocumentMouseMove)
  document.removeEventListener('mouseup', onDocumentMouseUp)
  document.removeEventListener('keydown', onKeyDown)
  document.removeEventListener('keyup', onKeyUp)
})
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
  overflow: hidden; /* Hide scrollbars for infinite canvas feel */
  background: #f0f0f0;
  position: relative;
  background-image: radial-gradient(circle, #ccc 1px, transparent 1px);
  background-size: 20px 20px;
  background-position:
    0 0,
    10px 10px;
}

.canvas-scroll-area:active {
  cursor: grabbing;
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
