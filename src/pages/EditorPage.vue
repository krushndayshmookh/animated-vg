<template>
  <q-page class="editor-page" data-test="editor-page">
    <!-- Main Editor Layout -->
    <div class="editor-layout">
      <!-- Left Sidebar -->




      <!-- Main Canvas Area -->
      <div class="canvas-area">
        <EditorCanvas :zoom="zoom" @zoom-in="zoomIn" @zoom-out="zoomOut" />
      </div>



    </div>

    <!-- Floating Toolbars (Overlay) -->
    <div class="toolbar-overlay">
      <EditorToolbar side="left" :items="editToolbarButtons" @toolbar-click="handleToolbarClick" />

      <EditorToolbar
        side="right"
        :items="[
          { name: 'undo', icon: 'eva-undo-outline', tooltip: 'Undo' },
          { name: 'redo', icon: 'eva-undo-outline', tooltip: 'Redo', iconFlip: true },
          { name: 'save', icon: 'eva-save-outline', tooltip: 'Save' },
          { name: 'toggle-left', icon: 'eva-menu-outline', tooltip: 'Toggle Layers' },
          { name: 'toggle-right', icon: 'eva-settings-outline', tooltip: 'Toggle Inspector' },
        ]"
        @toolbar-click="handleToolbarClick"
      />

      <EditorToolbar
        side="bottom"
        direction="row"
        :items="[
          { name: 'play', icon: 'eva-play-circle-outline', tooltip: 'Play', isActive: true },
          { name: 'pause', icon: 'eva-pause-circle-outline', tooltip: 'Pause', isActive: true },
          { name: 'stop', icon: 'eva-stop-circle-outline', tooltip: 'Stop' },
          { name: 'add-frame', icon: 'eva-plus-circle-outline', tooltip: 'Add Frame' },
        ]"
        @toolbar-click="handleToolbarClick"
      />
    </div>

    <!-- Canvas Controls Overlay -->
    <div class="canvas-controls-overlay">
      <div class="canvas-info">
        <span>Canvas: {{ editorStore.canvasWidth }} × {{ editorStore.canvasHeight }}</span>
        <span>Zoom: {{ Math.round(zoom * 100) }}%</span>
      </div>
      <div class="zoom-controls">
        <q-btn dense icon="remove" @click="zoomOut" />
        <q-btn dense :label="`${Math.round(zoom * 100)}%`" @click="resetZoom" />
        <q-btn dense icon="add" @click="zoomIn" />
        <q-btn dense icon="fit_screen" @click="fitToView" />
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useEditorStore } from 'src/stores/editor-store.js'
import { saveDialog } from 'src/services/fs-client'
import EditorToolbar from 'src/components/editor/EditorToolbar.vue'
import EditorCanvas from 'components/editor/EditorCanvas.vue'


const editorStore = useEditorStore()

// Zoom state
const zoom = ref(1)

// Zoom functions
function zoomIn() {
  zoom.value = Math.min(zoom.value * 1.2, 10)
}

function zoomOut() {
  zoom.value = Math.max(zoom.value / 1.2, 0.1)
}

function resetZoom() {
  zoom.value = 1
}

function fitToView() {
  zoom.value = 1 // For now, just reset to 100%
}

function handleToolbarClick(item) {
  console.log('Toolbar item clicked:', item)

  switch (item.name) {
    case 'toggle-left':
      editorStore.toggleSidebarLeft()
      break
    case 'toggle-right':
      editorStore.toggleSidebarRight()
      break
    case 'undo':
      // TODO: Implement undo
      break
    case 'redo':
      // TODO: Implement redo
      break
    case 'save':
      onSave()
      break
    case 'select-item':
      editorStore.setActiveTool('select')
      break
    case 'add-shape-square':
      editorStore.setActiveTool('rect')
      break
    case 'add-shape-circle':
      editorStore.setActiveTool('ellipse')
      break
    case 'add-shape-line':
      editorStore.setActiveTool('line')
      break
  }
}

// async function onOpen() {
//   const result = await openDialog()
//   if (result?.contents) {
//     editorStore.loadFromXml(result.contents)
//   }
// }

async function onSave() {
  const xml = editorStore.exportXml()
  await saveDialog(xml)
}

const editToolbarButtons = [
  {
    name: 'select-item',
    icon: 'eva-navigation-2-outline',
    iconFlip: true,
    tooltip: 'Select Item',
    isActive: editorStore.activeTool === 'select',
  },
  {
    name: 'add-shape-square',
    icon: 'mdi-square',
    tooltip: 'Add Rectangle',
    isActive: editorStore.activeTool === 'rect',
  },
  {
    name: 'add-shape-circle',
    icon: 'mdi-circle',
    tooltip: 'Add Ellipse',
    isActive: editorStore.activeTool === 'ellipse',
  },
  {
    name: 'add-shape-line',
    icon: 'eva-minus-outline',
    tooltip: 'Add Line',
    isActive: editorStore.activeTool === 'line',
  },
]
</script>

<style scoped>
.editor-page {
  position: relative;
  height: calc(100vh - 100px);
  overflow: hidden;
  padding: 0;
  margin: 0;
}

.editor-layout {
  display: flex;
  height: calc(100vh - 100px);
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
