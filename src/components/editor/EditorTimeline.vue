<template>
  <div class="q-pa-sm" data-test="editor-timeline">
    <div class="text-subtitle2 q-mb-sm">Timeline</div>
    <div class="row items-center q-gutter-sm">
      <q-btn
        dense
        icon="add"
        label="Add Opacity Anim"
        data-test="timeline-add-opacity"
        @click="onAddOpacity"
      />
      <q-btn dense icon="play_arrow" label="Play" data-test="timeline-play" @click="onPlay" />
      <q-btn dense icon="pause" label="Pause" data-test="timeline-pause" @click="onPause" />
      <q-btn dense icon="stop" label="Stop" data-test="timeline-stop" @click="onStop" />
    </div>
    <div class="q-mt-md" data-test="timeline-anim-list">
      <div v-if="animations.length === 0" class="text-grey">No animations</div>
      <div
        v-for="row in animations"
        :key="row.targetId + ':' + row.animIndex"
        class="row items-center q-gutter-sm q-mb-xs"
        data-test="timeline-anim-row"
      >
        <div class="text-caption">
          #{{ row.targetId }} • {{ row.kind }} • {{ row.attributeName }}
        </div>
        <input
          v-model="edits[idKey(row)].from"
          class="q-input q-field__native"
          :data-test="'timeline-anim-from-' + row.animIndex"
          type="text"
          placeholder="from"
        />
        <input
          v-model="edits[idKey(row)].to"
          class="q-input q-field__native"
          :data-test="'timeline-anim-to-' + row.animIndex"
          type="text"
          placeholder="to"
        />
        <input
          v-model="edits[idKey(row)].dur"
          class="q-input q-field__native"
          :data-test="'timeline-anim-dur-' + row.animIndex"
          type="text"
          placeholder="dur"
        />
        <q-btn
          dense
          label="Save"
          :data-test="'timeline-anim-save-' + row.animIndex"
          @click="onSave(row)"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, computed, watch } from 'vue'
import { useEditorStore } from 'src/stores/editor-store.js'

const store = useEditorStore()
const svgEl = ref(null)
const edits = ref({})

onMounted(() => {
  resolveSvg()
})

function resolveSvg() {
  if (svgEl.value && svgEl.value.isConnected) return svgEl.value
  const host = document.querySelector('[data-test="editor-canvas"]')
  if (host) svgEl.value = host.querySelector('svg')
  return svgEl.value
}

const animations = computed(() => {
  void store.xml // make reactive
  return store.listAnimations(store.selectedId)
})

function idKey(row) {
  return `${row.targetId}:${row.animIndex}`
}

watch(
  animations,
  (rows) => {
    rows.forEach((r) => {
      const key = idKey(r)
      if (!edits.value[key]) {
        edits.value[key] = { from: r.from, to: r.to, dur: r.dur }
      }
    })
  },
  { immediate: true },
)

function onAddOpacity() {
  if (!store.selectedId) return
  store.addOpacityAnimation(store.selectedId, {
    from: 1,
    to: 0.2,
    dur: '1s',
    begin: '0s',
    fill: 'freeze',
  })
}
function onPlay() {
  const el = resolveSvg()
  if (el && el.unpauseAnimations) el.unpauseAnimations()
}
function onPause() {
  const el = resolveSvg()
  if (el && el.pauseAnimations) el.pauseAnimations()
}
function onStop() {
  const el = resolveSvg()
  if (el && el.setCurrentTime) {
    el.pauseAnimations && el.pauseAnimations()
    el.setCurrentTime(0)
  }
}

function onSave(row) {
  const key = idKey(row)
  const patch = edits.value[key] || {}
  store.updateAnimation({ targetId: row.targetId, animIndex: row.animIndex, kind: row.kind }, patch)
}
</script>
