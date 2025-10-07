<template>
  <q-card flat bordered class="bg-settings-card">
    <q-card-section>
      <div class="text-h6">Canvas Background</div>
    </q-card-section>

    <q-card-section>
      <q-tabs
        v-model="backgroundType"
        dense
        class="text-grey"
        active-color="primary"
        indicator-color="primary"
        align="justify"
        narrow-indicator
      >
        <q-tab name="color" label="Color" />
        <q-tab name="pattern" label="Pattern" />
        <q-tab name="image" label="Image" />
      </q-tabs>

      <q-separator />

      <q-tab-panels v-model="backgroundType" animated>
        <!-- Color Background Panel -->
        <q-tab-panel name="color">
          <q-color
            v-model="backgroundColor"
            class="full-width"
            no-header
          />
        </q-tab-panel>

        <!-- Pattern Background Panel -->
        <q-tab-panel name="pattern">
          <div class="row q-col-gutter-sm">
            <div 
              v-for="pattern in availablePatterns" 
              :key="pattern.id" 
              class="col-4 pattern-swatch cursor-pointer"
              :class="{ 'selected': selectedPattern === pattern.id }"
              @click="selectPattern(pattern.id)"
            >
              <div class="pattern-preview" :style="`background: ${pattern.preview}`">
                <span class="pattern-name">{{ pattern.name }}</span>
              </div>
            </div>
          </div>
        </q-tab-panel>

        <!-- Image Background Panel -->
        <q-tab-panel name="image">
          <q-file
            v-model="backgroundImage"
            label="Select image"
            filled
            bottom-slots
            accept="image/*"
          >
            <template v-slot:prepend>
              <q-icon name="image" />
            </template>
            <template v-slot:append v-if="backgroundImage">
              <q-btn round dense flat icon="close" @click.stop="clearImage" />
            </template>
          </q-file>
          
          <div v-if="imagePreview" class="q-mt-md image-preview">
            <img :src="imagePreview" />
          </div>
        </q-tab-panel>
      </q-tab-panels>
      
      <q-separator class="q-my-md" />
      
      <div>
        <div class="text-subtitle2">Opacity</div>
        <q-slider
          v-model="backgroundOpacity"
          :min="0"
          :max="100"
          label
          label-always
        />
        <div class="text-caption text-right">{{ backgroundOpacity }}%</div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script>
import { ref, watch } from 'vue'
import { useEditorStore } from '../../stores/editor-store'

export default {
  name: 'AppletBackgroundSettings',
  
  setup() {
    const editorStore = useEditorStore()
    
    // Local reactive state
    const backgroundType = ref(editorStore.canvasBackground.type)
    const backgroundColor = ref(editorStore.canvasBackground.color)
    const selectedPattern = ref(editorStore.canvasBackground.pattern)
    const backgroundImage = ref(null)
    const backgroundOpacity = ref(editorStore.canvasBackground.opacity)
    const imagePreview = ref(editorStore.canvasBackground.image)
    
    // Sample patterns
    const availablePatterns = ref([
      { id: 'grid', name: 'Grid', preview: 'repeating-linear-gradient(0deg, #e0e0e0 0px, #e0e0e0 1px, transparent 1px, transparent 20px), repeating-linear-gradient(90deg, #e0e0e0 0px, #e0e0e0 1px, transparent 1px, transparent 20px)' },
      { id: 'dots', name: 'Dots', preview: 'radial-gradient(circle, #e0e0e0 1px, transparent 1px)' },
      { id: 'lines', name: 'Lines', preview: 'repeating-linear-gradient(45deg, transparent, transparent 10px, #e0e0e0 10px, #e0e0e0 11px)' },
      { id: 'checks', name: 'Checks', preview: 'linear-gradient(45deg, #f5f5f5 25%, transparent 25%, transparent 75%, #f5f5f5 75%), linear-gradient(45deg, #f5f5f5 25%, transparent 25%, transparent 75%, #f5f5f5 75%)' }
    ])
    
    // Update the store when local values change
    watch(backgroundType, (newValue) => {
      editorStore.updateCanvasBackground({ type: newValue })
    })
    
    watch(backgroundColor, (newValue) => {
      editorStore.updateCanvasBackground({ color: newValue })
    })
    
    watch(backgroundOpacity, (newValue) => {
      editorStore.updateCanvasBackground({ opacity: newValue })
    })
    
    watch(backgroundImage, async (newFile) => {
      if (newFile) {
        const reader = new FileReader()
        reader.onload = (e) => {
          const dataUrl = e.target.result
          imagePreview.value = dataUrl
          editorStore.updateCanvasBackground({ 
            image: dataUrl 
          })
        }
        reader.readAsDataURL(newFile)
      }
    })
    
    // Methods
    const selectPattern = (patternId) => {
      selectedPattern.value = patternId
      editorStore.updateCanvasBackground({ pattern: patternId })
    }

    const clearImage = () => {
      backgroundImage.value = null
      imagePreview.value = null
      editorStore.updateCanvasBackground({ image: null })
    }
    
    return {
      backgroundType,
      backgroundColor,
      selectedPattern,
      backgroundImage,
      backgroundOpacity,
      imagePreview,
      availablePatterns,
      selectPattern,
      clearImage
    }
  }
}
</script>

<style scoped>
.bg-settings-card {
  width: 100%;
}

.pattern-swatch {
  height: 60px;
  border: 2px solid #ddd;
  border-radius: 4px;
  overflow: hidden;
  transition: all 0.2s;
  position: relative;
}

.pattern-swatch:hover {
  border-color: #aaa;
}

.pattern-swatch.selected {
  border: 2px solid #1976D2;
  box-shadow: 0 0 8px rgba(25, 118, 210, 0.5);
}

.pattern-preview {
  width: 100%;
  height: 100%;
  background-size: 20px 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pattern-name {
  font-size: 10px;
  color: #666;
  background: rgba(255, 255, 255, 0.8);
  padding: 2px 6px;
  border-radius: 3px;
}

.image-preview {
  max-height: 150px;
  overflow: hidden;
  border-radius: 4px;
  text-align: center;
  border: 1px solid #ddd;
}

.image-preview img {
  max-width: 100%;
  max-height: 150px;
  object-fit: contain;
}
</style>