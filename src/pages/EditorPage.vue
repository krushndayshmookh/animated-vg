<template>
  <q-page class="column" data-test="editor-page">

    <!-- floating left toolbar -->

    <div class="absolute-left">
      <q-card class="column q-gutter-xs q-ma-sm">
        <q-btn round flat class="" icon="home" />
        <q-btn round flat class="" icon="home" />
        <q-btn round flat class="" icon="home" />
      </q-card>
    </div>

    <!-- floating right toolbar -->

    <div class="absolute-right">
      <q-card class="column q-gutter-xs q-ma-sm">
        <q-btn round flat class="" icon="person" />
        <q-btn round flat class="" icon="person" />
        <q-btn round flat class="" icon="person" />
      </q-card>
    </div>

    <!-- floating bottom toolbar -->

    <div class="absolute-bottom">
      <q-card class="row q-gutter-xs q-ma-sm">
        <q-btn round flat class="" icon="timeline" />
        <q-btn round flat class="" icon="timeline" />
        <q-btn round flat class="" icon="timeline" />
      </q-card>
    </div>



    <!-- <EditorToolbar
      @toggle-left="editorStore.toggleSidebarLeft"
      @toggle-right="editorStore.toggleSidebarRight"
      @toggle-bottom="editorStore.toggleSidebarBottom"
      @open="onOpen"
      @save="onSave"
      @set-tool="onSetTool"
    />

    <q-drawer
      :model-value="editorStore.sidebarLeftOpen"
      side="left"
      bordered
      data-test="left-panel"
    >
      <EditorLayers />
    </q-drawer>

    <div class="fit">
      <EditorCanvas />
    </div>

    <q-slide-transition>
      <div v-show="editorStore.sidebarBottomOpen" class="bg-grey-1" style="height: 200px">
        <EditorTimeline />
      </div>
    </q-slide-transition>

    <q-drawer
      :model-value="editorStore.sidebarRightOpen"
      side="right"
      bordered
      data-test="right-panel"
    >
      <EditorInspector />
    </q-drawer> -->
  </q-page>
</template>

<script setup>
// import { ref } from 'vue'
// import { useEditorStore } from 'src/stores/editor-store.js'
// import { openDialog, saveDialog } from 'src/services/fs-client'
// import EditorToolbar from 'components/editor/EditorToolbar.vue'
// import EditorCanvas from 'components/editor/EditorCanvas.vue'
// import EditorInspector from 'components/editor/EditorInspector.vue'
// import EditorLayers from 'components/editor/EditorLayers.vue'
// import EditorTimeline from 'components/editor/EditorTimeline.vue'

// const editorStore = useEditorStore()

// const hSplit = ref(250) // left panel width in px
// const vSplit = ref(70) // % height above timeline

// async function onOpen() {
//   const result = await openDialog()
//   if (result?.contents) {
//     editorStore.loadFromXml(result.contents)
//   }
// }

// async function onSave() {
//   const xml = editorStore.exportXml()
//   await saveDialog(xml)
// }

// function onSetTool(tool) {
//   editorStore.setActiveTool(tool)
// }
</script>
