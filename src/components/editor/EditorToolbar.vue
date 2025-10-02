<template>
  <div :class="`absolute-${props.side}`" :style="postitionStyle">
    <q-card class="q-col-gutter-xs q-ma-sm" :class="props.direction">
      <div v-for="item in props.items" :key="item.name" class="col-auto q-pa-xs">
        <q-btn
          :flat="!item.isActive"
          dense
          :icon="item.icon"
          :style="{
            transform: item.iconFlip ? 'scaleX(-1)' : 'none',
          }"
          :color="item.isActive ? 'primary' : 'default'"
          @click="handleItemClick(item)"
        >
          <q-tooltip v-if="item.tooltip" :anchor="TOOLTIP_ANCHORS[props.side]">
            {{ item.tooltip }}
          </q-tooltip>
        </q-btn>
      </div>
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

const postitionStyle = props.side === 'bottom' ? 'bottom: 4px; position: absolute;' : ''
/*

interface Item {
  name: string
  icon: string
  tooltip?: string
  onClick?: () => void
  iconFlip?: boolean
  isActive?: boolean
}

*/
</script>
