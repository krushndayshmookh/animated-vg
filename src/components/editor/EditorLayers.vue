<template>
  <div class="q-pa-sm" data-test="editor-layers">
    <div class="text-subtitle2 q-mb-sm">Layers</div>
    <q-list bordered separator>
      <q-item v-for="n in 3" :key="n">
        <q-item-section>Layer {{ n }}</q-item-section>
      </q-item>
    </q-list>
  </div>
</template>

<script setup>
// placeholder
</script>
