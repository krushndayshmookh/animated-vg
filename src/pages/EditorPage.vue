<template>
  <q-page class="editor-page" data-test="editor-page">
    <div class="editor-layout">
      <div class="canvas-area">
        <EditorCanvas
          ref="canvasRef"
          :zoom="zoom"
          @zoom-in="zoomIn"
          @zoom-out="zoomOut"
          @zoom-to-selection="handleZoomToSelection"
        />
      </div>
    </div>

    <!-- Floating Toolbars (Overlay) -->
    <div class="toolbar-overlay">
      <EditorToolbar side="left" :items="leftToolbarButtons" @toolbar-click="handleToolbarClick" />

      <EditorToolbar
        side="right"
        :items="rightToolbarButtons"
        @toolbar-click="handleToolbarClick"
      />

      <ToolPresetsManager v-model="showPresets" />

      <!-- <EditorToolbar
        side="bottom"
        direction="row"
        :items="bottomToolbar"
        @toolbar-click="handleToolbarClick"
      /> -->
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useEditorStore } from 'src/stores/editor-store.js'
import { saveDialog, openDialog } from 'src/services/fs-client'
import EditorToolbar from 'src/components/editor/EditorToolbar.vue'
import EditorCanvas from 'components/editor/EditorCanvas.vue'
import ToolPresetsManager from 'src/components/editor/ToolPresetsManager.vue'

const editorStore = useEditorStore()

// Canvas reference
const canvasRef = ref(null)

// Zoom state
const zoom = ref(1)

// Zoom functions
function zoomIn() {
  zoom.value = Math.min(zoom.value * 1.2, 100) // Increased max zoom to 100x

  // If element is selected, re-center it after zoom
  if (editorStore.selectedId && canvasRef.value) {
    requestAnimationFrame(() => {
      canvasRef.value?.recenterSelection()
    })
  }
}

function zoomOut() {
  zoom.value = Math.max(zoom.value / 1.2, 0.01) // Decreased min zoom to 0.01x

  // If element is selected, re-center it after zoom
  if (editorStore.selectedId && canvasRef.value) {
    requestAnimationFrame(() => {
      canvasRef.value?.recenterSelection()
    })
  }
}

function resetZoom() {
  zoom.value = 1
}

function handleZoomToSelection(targetZoom) {
  console.info('Setting zoom to:', targetZoom, 'current zoom:', zoom.value)
  zoom.value = targetZoom
  console.info('Zoom updated to:', zoom.value)
}

function zoomToSelection() {
  console.info('zoomToSelection called, selectedId:', editorStore.selectedId)
  if (!editorStore.selectedId) {
    console.warn('No element selected to zoom to')
    return
  }
  if (canvasRef.value) {
    console.info('Calling canvas zoomToSelection method')
    canvasRef.value.zoomToSelection()
  } else {
    console.warn('Canvas ref not available')
  }
}

// Zoom in on selected element (increase zoom and recenter)
function zoomInSelection() {
  if (!editorStore.selectedId) return
  zoom.value = Math.min(zoom.value * 1.5, 100) // Zoom in faster for selection
  if (canvasRef.value) {
    requestAnimationFrame(() => {
      canvasRef.value?.recenterSelection()
    })
  }
}

// Zoom out on selected element (decrease zoom and recenter)
function zoomOutSelection() {
  if (!editorStore.selectedId) return
  zoom.value = Math.max(zoom.value / 1.5, 0.01) // Zoom out faster for selection
  if (canvasRef.value) {
    requestAnimationFrame(() => {
      canvasRef.value?.recenterSelection()
    })
  }
}

// function fitToView() {
//   zoom.value = 1 // For now, just reset to 100%
// }

function handleToolbarClick(item) {
  console.info('Toolbar item clicked:', item.name, 'disabled:', item.disabled)

  if (editorStore.activeTool === item.name) {
    editorStore.setActiveTool('')
    console.info('Deactivated tool:', item.name)
    return
  }

  switch (item.name) {
    case 'import':
      onOpen()
      break
    case 'undo':
      console.warn('TODO: Implement undo')
      break
    case 'redo':
      console.warn('TODO: Implement redo')
      break
    case 'save':
      onSave()
      break
    case 'presets':
      showPresets.value = true
      break
    case 'select':
      editorStore.setActiveTool('select')
      break
    case 'pan':
      editorStore.setActiveTool('pan')
      break
    case 'add-shape-square':
      editorStore.setActiveTool('add-shape-square')
      console.warn('TODO: Implement shape addition')
      break
    case 'add-shape-circle':
      editorStore.setActiveTool('add-shape-circle')
      console.warn('TODO: Implement shape addition')
      break
    case 'add-shape-line':
      editorStore.setActiveTool('add-shape-line')
      console.warn('TODO: Implement shape addition')
      break
    case 'reset-canvas':
      editorStore.resetCanvas()
      break
    case 'zoom-in':
      zoomIn()
      break
    case 'zoom-out':
      zoomOut()
      break
    case 'zoom-100':
      resetZoom()
      break
    case 'fit-to-view':
      console.warn('TODO: Implement fit to view')
      // fitToView()
      break
    case 'zoom-to-selection':
      zoomToSelection()
      break
    case 'zoom-in-selection':
      zoomInSelection()
      break
    case 'zoom-out-selection':
      zoomOutSelection()
      break
    default:
      console.warn('Unhandled toolbar action:', item.name)
      break
  }
}

async function onOpen() {
  const result = await openDialog()
  if (result?.contents) {
    editorStore.loadFromXml(result.contents)
  }
}

async function onSave() {
  const xml = editorStore.exportXml()
  await saveDialog(xml, {
    defaultName: (editorStore.metadata.title || 'document') + '.svg',
    mime: 'image/svg+xml',
  })
}

const leftToolbarButtons = computed(() => [
  {
    name: 'select',
    icon: 'eva-navigation-2-outline',
    iconFlip: true,
    tooltip: 'Select Item',
    isActive: editorStore.activeTool === 'select',
  },
  // {
  //   name: 'add-shape-square',
  //   icon: 'mdi-square',
  //   tooltip: 'Add Rectangle',
  //   isActive: editorStore.activeTool === 'rect',
  // },
  // {
  //   name: 'add-shape-circle',
  //   icon: 'mdi-circle',
  //   tooltip: 'Add Ellipse',
  //   isActive: editorStore.activeTool === 'ellipse',
  // },
  // {
  //   name: 'add-shape-line',
  //   icon: 'eva-minus-outline',
  //   tooltip: 'Add Line',
  //   isActive: editorStore.activeTool === 'line',
  // },
])

const rightToolbarButtons = computed(() => [
  // {
  //   name: 'undo',
  //   icon: 'eva-undo-outline',
  //   tooltip: 'Undo',
  //   isActive: false,
  // },
  // {
  //   name: 'redo',
  //   icon: 'eva-undo-outline',
  //   tooltip: 'Redo',
  //   iconFlip: true,
  //   isActive: false,
  // },
  {
    name: 'import',
    icon: 'eva-file-add-outline',
    tooltip: 'Import SVG',
    isActive: false,
  },
  {
    name: 'presets',
    icon: 'eva-bookmark-outline',
    tooltip: 'Tool Presets',
    isActive: false,
  },
  {
    name: 'save',
    icon: 'eva-save-outline',
    tooltip: 'Save',
    isActive: false,
  },
  {
    name: 'reset-canvas',
    icon: 'eva-trash-outline',
    tooltip: 'Reset Canvas (400x400)',
    isActive: false,
  },

  {
    name: 'separator',
  },
  {
    name: 'zoom-to-selection',
    icon: 'eva-maximize-outline',
    tooltip: 'Zoom to Selection',
    isActive: false,
    disabled: !editorStore.selectedId,
  },
  {
    name: 'zoom-in-selection',
    icon: 'eva-arrow-up-outline',
    tooltip: 'Zoom In on Selection',
    isActive: false,
    disabled: !editorStore.selectedId,
  },
  {
    name: 'zoom-out-selection',
    icon: 'eva-arrow-down-outline',
    tooltip: 'Zoom Out on Selection',
    isActive: false,
    disabled: !editorStore.selectedId,
  },
  {
    name: 'separator',
  },
  {
    name: 'zoom-in',
    icon: 'eva-plus-outline',
    tooltip: 'Zoom In (Canvas)',
    isActive: false,
  },
  {
    name: 'zoom-100',
    icon: 'eva-search-outline',
    tooltip: 'Reset Zoom to 100%',
    isActive: zoom.value === 1,
  },
  {
    name: 'zoom-out',
    icon: 'eva-minus-outline',
    tooltip: 'Zoom Out',
    isActive: false,
  },
  {
    name: 'pan',
    icon: 'eva-move-outline',
    tooltip: 'Pan Tool (Hand)',
    isActive: editorStore.activeTool === 'pan',
  },
])

const showPresets = ref(false)

// const bottomToolbar = computed(() => [
//   { name: 'play', icon: 'eva-play-circle-outline', tooltip: 'Play', isActive: true },
//   { name: 'pause', icon: 'eva-pause-circle-outline', tooltip: 'Pause', isActive: true },
//   { name: 'stop', icon: 'eva-stop-circle-outline', tooltip: 'Stop' },
//   { name: 'add-frame', icon: 'eva-plus-circle-outline', tooltip: 'Add Frame' },
// ])
</script>

<style scoped>
.editor-page {
  position: relative;
  height: calc(100vh - 50px);
  overflow: hidden;
  padding: 0;
  margin: 0;
}

.editor-layout {
  display: flex;
  height: calc(100vh - 50px);
  position: relative;
}

.canvas-area {
  flex: 1;
  position: relative;
  overflow: hidden;
}

.sidebar-content {
  height: 100%;
  overflow-y: auto;
}

.toolbar-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 1000;
}

.toolbar-overlay > * {
  pointer-events: auto;
}

.canvas-controls-overlay {
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 8px;
  padding: 8px 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  display: flex;
  gap: 16px;
  align-items: center;
  z-index: 1001;
  pointer-events: auto;
}

.canvas-info {
  display: flex;
  gap: 16px;
  font-size: 14px;
  color: #666;
  font-weight: 500;
}

.zoom-controls {
  display: flex;
  gap: 4px;
  align-items: center;
}
</style>
