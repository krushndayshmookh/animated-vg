<template>
  <LayoutDrawerApplet name="Layers">
    <q-tree
      v-model:selected="selectedElement"
      :nodes="[json]"
      node-key="id"
      label-key="tagName"
      :expanded="[json.id]"
      @update:selected="onTreeSelectionChange"
    >
      <template #default-header="prop">
        <q-icon :name="ICONS[prop.node.tagName]" class="q-mr-sm" />

        <span>{{ prop.node.id }}</span>
        <q-btn
          v-if="prop.node.id !== 'svg-root' && prop.node.tagName !== 'svg'"
          dense
          flat
          round
          icon="eva-more-vertical"
          :aria-label="'Open actions for ' + (prop.node.id || prop.node.tagName)"
          class="q-ml-auto"
          :disable="prop.node.id === 'svg-root'"
        >
          <q-popup-proxy
            anchor="bottom right"
            self="top left"
            :offset="[0, 4]"
          >
            <q-list style="min-width: 100px">
              <q-item v-if="prop.node.id !== 'svg-root'" clickable @click="() => deleteNode(prop.node.id)">
                <q-item-section avatar>
                  <q-icon name="eva-trash-2-outline" />
                </q-item-section>
                <q-item-section>Delete</q-item-section>
              </q-item>
            </q-list>
          </q-popup-proxy>
        </q-btn>
      </template>
    </q-tree>
  </LayoutDrawerApplet>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import LayoutDrawerApplet from 'components/layout/LayoutDrawerApplet.vue'
import { useEditorStore } from 'src/stores/editor-store.js'
import { QBtn, QPopupProxy, QItem, QItemSection, QList, QIcon } from 'quasar'

const editorStore = useEditorStore()

const json = computed(() => editorStore.json)

const selectedElement = ref(null)

// Watch for changes in editor store selection and sync to tree
watch(
  () => editorStore.selectedId,
  (newSelectedId) => {
    selectedElement.value = newSelectedId
  },
  { immediate: true },
)

// Handle tree selection changes and update editor store
function onTreeSelectionChange(nodeId) {
  if (nodeId !== editorStore.selectedId) {
    editorStore.setSelectionById(nodeId)
  }
}

const deleteNode = (id) => {
  editorStore.setSelectionById(id)
  editorStore.deleteSelected()
}

const ICONS = {
  svg: 'mdi-vector-square',
  g: 'mdi-folder',
  path: 'mdi-vector-line',
  rect: 'mdi-square-outline',
  circle: 'mdi-circle-outline',
  ellipse: 'mdi-ellipse-outline',
  line: 'mdi-minus',
  polyline: 'mdi-polyline',
  polygon: 'mdi-shape-outline',
  text: 'mdi-text',
  image: 'mdi-image-outline',
  use: 'mdi-cursor-default-click',
  symbol: 'mdi-shape',
  defs: 'mdi-cog-outline',
  linearGradient: 'mdi-gradient',
  radialGradient: 'mdi-gradient',
  stop: 'mdi-stop',
  title: 'mdi-format-title',
  desc: 'mdi-text-short',
  metadata: 'mdi-database',
  // Add more mappings as needed
  default: 'mdi-file',
}
</script>

<style lang="scss">
.q-tree__node--selected {
  background-color: $primary;
  .q-tree__node-header-content {
    color: white !important;
  }
}
</style>
