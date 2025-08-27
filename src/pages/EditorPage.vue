<template>
  <q-page class="column" data-test="editor-page">
    <!-- floating left toolbar -->

    <EditorToolbar
      side="left"
      :items="[
        { name: 'home', icon: 'eva-home-outline', tooltip: 'Home' },
        {
          name: 'settings',
          icon: 'eva-settings-outline',
          onClick: () => console.log('Settings clicked'),
        },
        {
          name: 'help',
          icon: 'eva-question-mark-circle-outline',
          onClick: () => console.log('Help clicked'),
        },
      ]"
      @toolbar-click="handleToolbarClick"
    />

    <EditorToolbar
      side="right"
      :items="[
        { name: 'undo', icon: 'eva-undo-outline', tooltip: 'Undo' },
        { name: 'redo', icon: 'eva-undo-outline', tooltip: 'Redo', iconFlip: true },
        { name: 'save', icon: 'eva-save-outline', tooltip: 'Save' },
      ]"
      @toolbar-click="handleToolbarClick"
    />

    <!-- floating right toolbar -->

    <!-- floating bottom toolbar -->

    <EditorToolbar
      side="bottom"
      direction="row"
      :items="[
        { name: 'play', icon: 'eva-play-circle-outline', tooltip: 'Play' },
        { name: 'pause', icon: 'eva-pause-circle-outline', tooltip: 'Pause' },
        { name: 'stop', icon: 'eva-stop-circle-outline', tooltip: 'Stop' },
        { name: 'add-frame', icon: 'eva-plus-circle-outline', tooltip: 'Add Frame' },
      ]"
      @toolbar-click="handleToolbarClick"
    />

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
import EditorToolbar from 'src/components/editor/EditorToolbar.vue'

function handleToolbarClick(item) {
  console.log('Toolbar item clicked:', item)
}

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
