<template>
  <q-page class="column" data-test="editor-page">
    <EditorToolbar
      @toggle-left="leftOpen = !leftOpen"
      @toggle-right="rightOpen = !rightOpen"
      @toggle-bottom="bottomOpen = !bottomOpen"
      @open="onOpen"
      @save="onSave"
      @set-tool="onSetTool"
    />

    <q-splitter v-model="hSplit" unit="px" style="height: calc(100vh - 50px)">
      <template #before>
        <q-drawer :model-value="leftOpen" side="left" bordered data-test="left-panel">
          <EditorLayers />
        </q-drawer>
      </template>

      <template #after>
        <q-splitter v-model="vSplit" horizontal>
          <template #before>
            <div class="fit">
              <EditorCanvas />
            </div>
          </template>
          <template #after>
            <q-slide-transition>
              <div v-show="bottomOpen" class="bg-grey-1" style="height: 200px">
                <EditorTimeline />
              </div>
            </q-slide-transition>
          </template>
        </q-splitter>

        <q-drawer :model-value="rightOpen" side="right" bordered data-test="right-panel">
          <EditorInspector />
        </q-drawer>
      </template>
    </q-splitter>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useEditorStore } from 'src/stores/editor-store.js'
import { openDialog, saveDialog } from 'src/services/fs-client'
import EditorToolbar from 'components/editor/EditorToolbar.vue'
import EditorCanvas from 'components/editor/EditorCanvas.vue'
import EditorInspector from 'components/editor/EditorInspector.vue'
import EditorLayers from 'components/editor/EditorLayers.vue'
import EditorTimeline from 'components/editor/EditorTimeline.vue'

const store = useEditorStore()

const leftOpen = ref(true)
const rightOpen = ref(true)
const bottomOpen = ref(true)

const hSplit = ref(250) // left panel width in px
const vSplit = ref(70) // % height above timeline

async function onOpen() {
  const result = await openDialog()
  if (result?.contents) {
    store.loadFromXml(result.contents)
  }
}

async function onSave() {
  const xml = store.exportXml()
  await saveDialog(xml)
}

function onSetTool(tool) {
  store.setActiveTool(tool)
}
</script>
