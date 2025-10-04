<template>
  <q-layout view="hHh lpr lFr">
    <q-header elevated>
      <q-toolbar>
        <q-toolbar-title> AnimatedVG </q-toolbar-title>

        <LayoutButton
          :active="editorStore.sidebarLeftOpen"
          icon="eva-moon-outline"
          data-test="toolbar-toggle-darkMode"
          @click="editorStore.toggleDarkMode"
        />

        <LayoutButton
          :active="editorStore.sidebarLeftOpen"
          icon="eva-arrowhead-left-outline"
          data-test="toolbar-toggle-left"
          @click="editorStore.toggleSidebarLeft"
        />

        <LayoutButton
          :active="editorStore.sidebarRightOpen"
          icon="eva-arrowhead-right-outline"
          data-test="toolbar-toggle-right"
          @click="editorStore.toggleSidebarRight"
        />

        <LayoutButton
          :active="editorStore.sidebarBottomOpen"
          icon="eva-arrowhead-down-outline"
          data-test="toolbar-toggle-bottom"
          @click="editorStore.toggleSidebarBottom"
        />
      </q-toolbar>
    </q-header>

    <q-drawer
      :model-value="editorStore.sidebarLeftOpen"
      side="left"
      bordered
      data-test="left-panel"
    >
      <LayoutDrawerLeft />
    </q-drawer>

    <q-drawer
      :model-value="editorStore.sidebarRightOpen"
      side="right"
      bordered
      data-test="right-panel"
    >
      <LayoutDrawerRight />
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>

    <q-footer v-model="editorStore.sidebarBottomOpen" class="bg-white bordered">
      <LayoutDrawerBottom />
    </q-footer>
  </q-layout>
</template>

<script setup>
import { useEditorStore } from 'src/stores/editor-store.js'
import LayoutButton from 'src/components/layout/LayoutButton.vue'
import LayoutDrawerLeft from 'src/components/layout/LayoutDrawerLeft.vue'
import LayoutDrawerRight from 'src/components/layout/LayoutDrawerRight.vue'
import LayoutDrawerBottom from 'src/components/layout/LayoutDrawerBottom.vue'

const editorStore = useEditorStore()
</script>
