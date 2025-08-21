<template>
  <q-toolbar class="bg-grey-2 text-dark" data-test="editor-toolbar">
    <q-btn flat round dense icon="menu" data-test="toolbar-toggle-left" @click="$emit('toggle-left')" />
    <q-toolbar-title>Editor</q-toolbar-title>
  <q-btn flat dense icon="folder_open" data-test="toolbar-open" @click="$emit('open')" />
  <q-btn flat dense icon="save" data-test="toolbar-save" @click="$emit('save')" />
  <q-btn flat dense icon="mouse" data-test="tool-select" @click="$emit('set-tool', 'select')" />
  <q-btn flat dense icon="crop_square" data-test="tool-rect" @click="$emit('set-tool', 'rect')" />
  <q-btn flat dense icon="radio_button_unchecked" data-test="tool-ellipse" @click="$emit('set-tool', 'ellipse')" />
  <q-btn flat dense icon="show_chart" data-test="tool-line" @click="$emit('set-tool', 'line')" />
    <q-btn flat dense icon="view_sidebar" data-test="toolbar-toggle-right" @click="$emit('toggle-right')" />
    <q-btn flat dense icon="unfold_more" data-test="toolbar-toggle-bottom" @click="$emit('toggle-bottom')" />
  </q-toolbar>
</template>

<script setup>
defineEmits(['toggle-left', 'toggle-right', 'toggle-bottom', 'open', 'save', 'set-tool'])
</script>
