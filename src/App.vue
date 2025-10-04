<template>
  <router-view />
</template>

<script setup>
import { useEditorStore } from 'stores/editor-store.js'
import { effect } from 'vue'
import { useQuasar } from 'quasar'

const editorStore = useEditorStore()
const $q = useQuasar()

effect(() => {
  $q.dark.set(editorStore.darkMode)
})
</script>
