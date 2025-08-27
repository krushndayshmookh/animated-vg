<template>
  <div :class="`absolute-${props.side}`">
    <q-card class="q-gutter-xs q-ma-sm" :class="props.direction">
      <q-btn
        v-for="item in props.items"
        :key="item.name"
        round
        flat
        class=""
        :icon="item.icon"
        @click="handleItemClick(item)"
      >
        <q-tooltip v-if="item.tooltip" :anchor="TOOLTIP_ANCHORS[props.side]">
          {{ item.tooltip }}
        </q-tooltip>
      </q-btn>
    </q-card>
  </div>
</template>

<script setup>
const props = defineProps({
  side: {
    type: String,
    required: true,
    default: 'left',
  },

  items: {
    type: Array,
    required: false,
    default: () => [],
  },

  direction: {
    type: String,
    required: false,
    default: 'column',
  },
})

const emit = defineEmits(['toolbar-click'])

function handleItemClick(item) {
  if (typeof item.onClick === 'function') {
    item.onClick()
  } else {
    emit('toolbar-click', item)
  }
}

const TOOLTIP_ANCHORS = {
  left: 'center right',
  right: 'center left',
  top: 'bottom middle',
  bottom: 'top middle',
}

/*

interface Item {
  name: string
  icon: string
  tooltip?: string
  onClick?: () => void
}

*/
</script>
