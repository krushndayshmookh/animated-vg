<template>
  <DrawerApplet name="Layers">
    <q-list bordered separator>
      <q-item v-for="n in 3" :key="n">
        <q-item-section>Layer {{ n }}</q-item-section>
      </q-item>
    </q-list>
  </DrawerApplet>
</template>

<script setup>
import DrawerApplet from 'components/layout/LayoutDrawerApplet.vue'
</script>
