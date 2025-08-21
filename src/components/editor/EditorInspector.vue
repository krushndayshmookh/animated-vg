<template>
  <div class="q-pa-sm" data-test="editor-inspector">
    <div class="text-subtitle2 q-mb-sm">Inspector</div>
  <q-input v-model="fill" filled dense label="Fill" data-test="inspector-fill" />
  <q-input v-model="stroke" filled dense label="Stroke" data-test="inspector-stroke" />
  <q-input v-model.number="opacity" filled dense type="number" label="Opacity" data-test="inspector-opacity" />
  </div>
</template>

<script setup>
import { ref } from 'vue'

const fill = ref('#1976d2')
const stroke = ref('#000000')
const opacity = ref(1)
</script>
