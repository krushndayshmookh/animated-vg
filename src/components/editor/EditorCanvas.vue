<template>
  <div class="editor-canvas fit bg-white" data-test="editor-canvas">
  <!-- eslint-disable-next-line vue/no-v-html -->
  <div class="fit" v-html="store.xml" />
  </div>
</template>

<script setup>
import { useEditorStore } from 'src/stores/editor-store.js'

const store = useEditorStore()
</script>

<style scoped>
.editor-canvas {
  background: #f8f9fa;
}
.fit {
  width: 100%;
  height: 100%;
  display: block;
}
</style>
