<template>
  <LayoutDrawerApplet name="Layers">
    <!-- <pre>{{ json }}</pre> -->
    <q-tree
      v-model:selected="selectedElement"
      :nodes="[json]"
      node-key="id"
      label-key="tagName"
      :expanded="[json.id]"
    >
      <template #default-header="prop">
        <q-icon :name="ICONS[prop.node.tagName]" class="q-mr-sm" />

        <span>{{ prop.node.id }}</span>
      </template>
    </q-tree>
  </LayoutDrawerApplet>
</template>

<script setup>
import { computed, ref } from 'vue'
import LayoutDrawerApplet from 'components/layout/LayoutDrawerApplet.vue'
import { useEditorStore } from 'src/stores/editor-store.js'

const editorStore = useEditorStore()

const json = computed(() => editorStore.json)

const selectedElement = ref(null)
// json to be displayed in a tree view

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
