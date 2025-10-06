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

const emit = defineEmits(['zoom-in', 'zoom-out', 'zoom-to-selection'])

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

  // Get the actual SVG element (not the container div)
  const actualSvg = svgEl.querySelector('svg')
  if (!actualSvg) {
    // Fallback to old method if no SVG found
    const rect = svgEl.getBoundingClientRect()
    const x = (evt.clientX - rect.left) / props.zoom
    const y = (evt.clientY - rect.top) / props.zoom
    return { x, y }
  }

  // Use SVG's built-in coordinate transformation
  const pt = actualSvg.createSVGPoint()
  pt.x = evt.clientX
  pt.y = evt.clientY

  try {
    const svgP = pt.matrixTransform(actualSvg.getScreenCTM().inverse())
    return { x: svgP.x, y: svgP.y }
  } catch {
    // Fallback if transformation fails
    const rect = svgEl.getBoundingClientRect()
    const x = (evt.clientX - rect.left) / props.zoom
    const y = (evt.clientY - rect.top) / props.zoom
    return { x, y }
  }
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

// Keyboard event handlers for spacebar panning and arrow key movement
function onKeyDown(evt) {
  if (evt.code === 'Space' && !spacePressed.value) {
    evt.preventDefault()
    spacePressed.value = true
    return
  }

  // Arrow key movement for selected elements
  if (store.selectedId && ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(evt.code)) {
    evt.preventDefault()

    // Get current element attributes
    const attrs = store.getSelectedAttrs()
    if (!attrs) return

    // Movement step: 1px normal, 10px with Shift
    const step = evt.shiftKey ? 10 : 1

    // Calculate new position based on element type
    if (attrs.tag === 'rect') {
      const newAttrs = { ...attrs }
      if (evt.code === 'ArrowLeft') newAttrs.x -= step
      if (evt.code === 'ArrowRight') newAttrs.x += step
      if (evt.code === 'ArrowUp') newAttrs.y -= step
      if (evt.code === 'ArrowDown') newAttrs.y += step
      store.setSelectedAttrs(newAttrs)
    } else if (attrs.tag === 'ellipse') {
      const newAttrs = { ...attrs }
      if (evt.code === 'ArrowLeft') newAttrs.cx -= step
      if (evt.code === 'ArrowRight') newAttrs.cx += step
      if (evt.code === 'ArrowUp') newAttrs.cy -= step
      if (evt.code === 'ArrowDown') newAttrs.cy += step
      store.setSelectedAttrs(newAttrs)
    } else if (attrs.tag === 'line') {
      const newAttrs = { ...attrs }
      if (evt.code === 'ArrowLeft') {
        newAttrs.x1 -= step
        newAttrs.x2 -= step
      }
      if (evt.code === 'ArrowRight') {
        newAttrs.x1 += step
        newAttrs.x2 += step
      }
      if (evt.code === 'ArrowUp') {
        newAttrs.y1 -= step
        newAttrs.y2 -= step
      }
      if (evt.code === 'ArrowDown') {
        newAttrs.y1 += step
        newAttrs.y2 += step
      }
      store.setSelectedAttrs(newAttrs)
    } else if (attrs.tag === 'path' || attrs.tag === 'polygon' || attrs.tag === 'polyline') {
      // For path elements, use transform to move them
      const el = document.getElementById(store.selectedId)
      if (el) {
        let dx = 0
        let dy = 0
        if (evt.code === 'ArrowLeft') dx = -step
        if (evt.code === 'ArrowRight') dx = step
        if (evt.code === 'ArrowUp') dy = -step
        if (evt.code === 'ArrowDown') dy = step

        // Get current transform or create new one
        const currentTransform = el.getAttribute('transform') || ''
        const translateMatch = currentTransform.match(/translate\(([^,]+),\s*([^)]+)\)/)

        let currentX = 0
        let currentY = 0
        if (translateMatch) {
          currentX = parseFloat(translateMatch[1]) || 0
          currentY = parseFloat(translateMatch[2]) || 0
        }

        const newX = currentX + dx
        const newY = currentY + dy

        // Update transform
        const newTransform =
          currentTransform.replace(/translate\([^)]+\)/, '').trim() + ` translate(${newX}, ${newY})`
        el.setAttribute('transform', newTransform.trim())

        // Update the store's XML
        const doc = new DOMParser().parseFromString(store.xml, 'image/svg+xml')
        const xmlEl = doc.getElementById(store.selectedId)
        if (xmlEl) {
          xmlEl.setAttribute('transform', newTransform.trim())
          store.xml = new XMLSerializer().serializeToString(doc.documentElement)
        }
      }
    }

    console.info(
      `Moved element ${evt.shiftKey ? '10px' : '1px'} ${evt.code.replace('Arrow', '').toLowerCase()}`,
    )
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
    console.info('✅ Selection result:', selectedId)
  } else {
    console.info('❌ No element found at click position')
  }

  if (store.activeTool !== 'select') return
}

function onSelectionMouseDown(evt) {
  // Prevent the click from propagating to the canvas behind the selection
  evt.stopPropagation()
}

// Zoom to selection function
function zoomToSelection() {
  if (!store.selectedId) {
    console.warn('No element selected to zoom to')
    return false
  }

  const bbox = store.getBBoxById(store.selectedId)
  console.info('Zoom to selection - BBox:', bbox)

  if (!bbox || bbox.width === 0 || bbox.height === 0) {
    console.warn('Cannot zoom to selection: invalid bounding box', bbox)
    return false
  }

  const container = scrollContainer.value
  if (!container) {
    console.warn('No scroll container found')
    return false
  }

  const containerRect = container.getBoundingClientRect()
  const containerWidth = containerRect.width
  const containerHeight = containerRect.height

  console.info('Container dimensions:', { containerWidth, containerHeight })

  // Add padding around the selection (20% of container size)
  const padding = 0.2
  const paddingX = containerWidth * padding
  const paddingY = containerHeight * padding

  // Calculate zoom level to fit the selection with padding
  const zoomX = (containerWidth - paddingX * 2) / bbox.width
  const zoomY = (containerHeight - paddingY * 2) / bbox.height
  const targetZoom = Math.min(zoomX, zoomY, 100) // Cap at max zoom of 100x
  const finalZoom = Math.max(targetZoom, 0.01) // Ensure minimum zoom of 0.01x

  console.info('Calculated zoom:', { zoomX, zoomY, targetZoom, finalZoom })

  // Calculate the center of the selection in canvas coordinates
  const selectionCenterX = bbox.x + bbox.width / 2
  const selectionCenterY = bbox.y + bbox.height / 2

  console.info('Selection center:', { selectionCenterX, selectionCenterY })

  // Emit event to parent to update zoom
  emit('zoom-to-selection', finalZoom)

  // Wait for zoom to be applied, then adjust pan to center the selection
  nextTick(() => {
    // The canvas is already centered at 50%, so we need to calculate offset from center
    // Canvas center in SVG coordinates
    const canvasCenterX = canvasWidth.value / 2
    const canvasCenterY = canvasHeight.value / 2

    // Offset from canvas center to selection center
    const offsetX = selectionCenterX - canvasCenterX
    const offsetY = selectionCenterY - canvasCenterY

    // Pan is the negative of this offset (scaled by zoom)
    panX.value = -offsetX * finalZoom
    panY.value = -offsetY * finalZoom

    console.info('Pan adjusted:', { panX: panX.value, panY: panY.value, offsetX, offsetY })
  })

  return true
}

// Recenter selection after zoom change
function recenterSelection() {
  if (!store.selectedId) return

  const bbox = store.getBBoxById(store.selectedId)
  if (!bbox) return

  // Calculate the center of the selection in SVG coordinates
  const selectionCenterX = bbox.x + bbox.width / 2
  const selectionCenterY = bbox.y + bbox.height / 2

  // The canvas is already centered at 50%, so we calculate offset from center
  const canvasCenterX = canvasWidth.value / 2
  const canvasCenterY = canvasHeight.value / 2

  // Offset from canvas center to selection center
  const offsetX = selectionCenterX - canvasCenterX
  const offsetY = selectionCenterY - canvasCenterY

  // Pan is the negative of this offset (scaled by current zoom)
  panX.value = -offsetX * props.zoom
  panY.value = -offsetY * props.zoom

  console.info('Recentered selection after zoom change:', {
    zoom: props.zoom,
    panX: panX.value,
    panY: panY.value,
  })
}

// Expose methods to parent component
defineExpose({
  zoomToSelection,
  recenterSelection,
})

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
