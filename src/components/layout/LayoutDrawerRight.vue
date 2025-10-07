<template>
  <q-drawer
    v-model="rightDrawerOpen"
    side="right"
    bordered
    :width="300"
    :breakpoint="500"
  >
    <q-scroll-area class="fit">
      <!-- Background Settings -->
      <AppletBackgroundSettings class="q-pa-md" />
      
      <q-separator />
      
      <!-- Future components can go here -->
    </q-scroll-area>
  </q-drawer>
</template>

<script setup>
import { ref } from 'vue'
import AppletBackgroundSettings from '../applets/AppletBackgroundSettings.vue'

const rightDrawerOpen = ref(true)
</script>

<style scoped>
/* Any custom styles can go here */
</style>