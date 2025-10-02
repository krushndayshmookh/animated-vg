<template>
  <q-btn
    :flat="!active"
    :unelevated="active"
    round
    dense
    :color="active ? 'white' : ''"
    :text-color="active ? 'primary' : ''"
    :icon="icon"
    :data-test="dataTest"
    class="q-mx-xs"
    @click="$emit('click')"
  />
</template>

<script setup>
defineProps({
  icon: {
    type: String,
    required: true,
  },
  active: {
    type: Boolean,
    default: false,
  },
  dataTest: {
    type: String,
    default: '',
  },
})

defineEmits(['click'])
</script>

<style scoped>

</style>
