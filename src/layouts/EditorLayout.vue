<template>
  <q-layout view="hHh lpr lFr">
    <q-header elevated>
      <q-toolbar>
        <!-- <q-btn
          flat
          round
          dense
          icon="eva-menu-outline"
          data-test="toolbar-toggle-left"
          @click="editorStore.toggleSidebarLeft"
        /> -->

        <q-toolbar-title> AnimatedVG </q-toolbar-title>

        <q-btn
          flat
          round
          dense
          icon="eva-arrowhead-left-outline"
          data-test="toolbar-toggle-left"
          @click="editorStore.toggleSidebarLeft"
        />

        <q-btn
          flat
          round
          dense
          icon="eva-arrowhead-right-outline"
          data-test="toolbar-toggle-right"
          @click="editorStore.toggleSidebarRight"
        />

        <q-btn
          flat
          round
          dense
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
      <p>Left Sidebar Content</p>
    </q-drawer>

    <q-drawer
      :model-value="editorStore.sidebarRightOpen"
      side="right"
      bordered
      data-test="right-panel"
    >
      <p>Right Sidebar Content</p>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>

    <q-footer v-model="editorStore.sidebarBottomOpen">
      <p>Footer Content</p>
    </q-footer>
  </q-layout>
</template>

<script setup>
import { useEditorStore } from 'src/stores/editor-store.js'

const editorStore = useEditorStore()
</script>
