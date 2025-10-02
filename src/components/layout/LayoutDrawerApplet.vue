<template>
  <q-card flat bordered class="drawer-applet q-ma-xs">
    <q-item class="row items-center q-pa-sm" dense>
      <q-item-section>
        <div class="text-caption">{{ name }}</div>
      </q-item-section>
      <q-item-section side>
        <q-btn
          dense
          flat
          round
          :icon="isVisible ? 'keyboard_arrow_up' : 'keyboard_arrow_down'"
          @click="toggle"
        />
      </q-item-section>
    </q-item>
    <Transition
      name="slider"
      enter-active-class="animated fadeIn"
      leave-active-class="animated fadeOut"
    >
      <div v-show="isVisible">
        <q-separator />
        <q-card-section class="fit scroll q-pa-xs">
          <slot />
        </q-card-section>
      </div>
    </Transition>
  </q-card>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  name: {
    type: String,
    required: true,
    default: '',
  },
})

const isVisible = ref(true)

const toggle = () => {
  isVisible.value = !isVisible.value
}
</script>
