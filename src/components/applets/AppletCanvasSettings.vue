<template>
  <DrawerApplet name="Canvas Settings">
    <div class="row q-col-gutter-xs">
      <div class="col-6">
        <q-input
          v-model.number="width"
          filled
          dense
          type="number"
          label="Width"
          min="100"
          max="10000"
          data-test="canvas-width"
          @update:model-value="updateSize"
        />
      </div>
      <div class="col-6">
        <q-input
          v-model.number="height"
          filled
          dense
          type="number"
          label="Height"
          min="100"
          max="10000"
          data-test="canvas-height"
          @update:model-value="updateSize"
        />
      </div>
    </div>

    <div class="q-mt-sm">
      <q-btn
        dense
        color="primary"
        label="Apply"
        data-test="canvas-apply"
        @click="
          () => {
            console.log('Apply canvas size:', width, height)
          }
        "
      />
      <q-btn
        dense
        flat
        label="Reset"
        data-test="canvas-reset"
        @click="
          () => {
            console.log('Reset canvas size')
          }
        "
      />
    </div>

    <div class="q-mt-sm">
      <q-checkbox
        v-model="showGrid"
        label="Show Grid"
        data-test="canvas-grid"
        @update:model-value="toggleGrid"
      />
    </div>
  </DrawerApplet>
</template>

<script setup>
import DrawerApplet from 'components/layout/LayoutDrawerApplet.vue'

import { ref, watch } from 'vue'
import { useEditorStore } from 'src/stores/editor-store.js'

const store = useEditorStore()

const width = ref(store.canvasWidth)
const height = ref(store.canvasHeight)
const showGrid = ref(store.showGrid)

// Watch for store changes
watch(
  () => store.canvasWidth,
  (newWidth) => {
    width.value = newWidth
  },
)

watch(
  () => store.canvasHeight,
  (newHeight) => {
    height.value = newHeight
  },
)

watch(
  () => store.showGrid,
  (newShowGrid) => {
    showGrid.value = newShowGrid
  },
)

function toggleGrid() {
  store.setShowGrid(showGrid.value)
}

function updateSize() {
  console.log('TODO: updateSize')
}
</script>

<style scoped>
.canvas-settings {
  padding: 16px;
  background: white;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style>
