<template>
  <div class="q-pa-sm" data-test="editor-inspector">
    <div class="text-subtitle2 q-mb-sm">Inspector</div>
    <div v-if="selected">
      <div class="text-caption q-mb-sm">Selected: {{ selected.tag }}</div>
      <q-input
        v-model="fill"
        filled
        dense
        label="Fill"
        data-test="inspector-fill"
        @update:model-value="apply('fill', $event)"
      />
      <q-input
        v-model="stroke"
        filled
        dense
        label="Stroke"
        data-test="inspector-stroke"
        @update:model-value="apply('stroke', $event)"
      />
      <q-input
        v-model.number="opacity"
        filled
        dense
        type="number"
        step="0.1"
        min="0"
        max="1"
        label="Opacity"
        data-test="inspector-opacity"
        @update:model-value="apply('opacity', $event)"
      />
      <div v-if="selected.tag === 'rect'" class="row q-col-gutter-xs q-mt-sm">
        <div class="col-6">
          <q-input
            v-model.number="x"
            dense
            filled
            type="number"
            label="x"
            data-test="inspector-x"
            @update:model-value="apply('x', $event)"
          />
        </div>
        <div class="col-6">
          <q-input
            v-model.number="y"
            dense
            filled
            type="number"
            label="y"
            data-test="inspector-y"
            @update:model-value="apply('y', $event)"
          />
        </div>
        <div class="col-6">
          <q-input
            v-model.number="width"
            dense
            filled
            type="number"
            label="width"
            data-test="inspector-width"
            @update:model-value="apply('width', $event)"
          />
        </div>
        <div class="col-6">
          <q-input
            v-model.number="height"
            dense
            filled
            type="number"
            label="height"
            data-test="inspector-height"
            @update:model-value="apply('height', $event)"
          />
        </div>
      </div>
      <div v-else-if="selected.tag === 'ellipse'" class="row q-col-gutter-xs q-mt-sm">
        <div class="col-6">
          <q-input
            v-model.number="cx"
            dense
            filled
            type="number"
            label="cx"
            data-test="inspector-cx"
            @update:model-value="apply('cx', $event)"
          />
        </div>
        <div class="col-6">
          <q-input
            v-model.number="cy"
            dense
            filled
            type="number"
            label="cy"
            data-test="inspector-cy"
            @update:model-value="apply('cy', $event)"
          />
        </div>
        <div class="col-6">
          <q-input
            v-model.number="rx"
            dense
            filled
            type="number"
            label="rx"
            data-test="inspector-rx"
            @update:model-value="apply('rx', $event)"
          />
        </div>
        <div class="col-6">
          <q-input
            v-model.number="ry"
            dense
            filled
            type="number"
            label="ry"
            data-test="inspector-ry"
            @update:model-value="apply('ry', $event)"
          />
        </div>
      </div>
      <div v-else-if="selected.tag === 'line'" class="row q-col-gutter-xs q-mt-sm">
        <div class="col-6">
          <q-input
            v-model.number="x1"
            dense
            filled
            type="number"
            label="x1"
            data-test="inspector-x1"
            @update:model-value="apply('x1', $event)"
          />
        </div>
        <div class="col-6">
          <q-input
            v-model.number="y1"
            dense
            filled
            type="number"
            label="y1"
            data-test="inspector-y1"
            @update:model-value="apply('y1', $event)"
          />
        </div>
        <div class="col-6">
          <q-input
            v-model.number="x2"
            dense
            filled
            type="number"
            label="x2"
            data-test="inspector-x2"
            @update:model-value="apply('x2', $event)"
          />
        </div>
        <div class="col-6">
          <q-input
            v-model.number="y2"
            dense
            filled
            type="number"
            label="y2"
            data-test="inspector-y2"
            @update:model-value="apply('y2', $event)"
          />
        </div>
      </div>
    </div>
    <div v-else class="text-grey">No selection</div>
  </div>
</template>

<script setup>
import { ref, watchEffect } from 'vue'
import { useEditorStore } from 'src/stores/editor-store.js'

const store = useEditorStore()

const selected = ref(null)
const fill = ref('')
const stroke = ref('')
const opacity = ref(1)
const x = ref(0)
const y = ref(0)
const width = ref(0)
const height = ref(0)
const cx = ref(0)
const cy = ref(0)
const rx = ref(0)
const ry = ref(0)
const x1 = ref(0)
const y1 = ref(0)
const x2 = ref(0)
const y2 = ref(0)

watchEffect(() => {
  const attrs = store.getSelectedAttrs()
  selected.value = attrs
  if (!attrs) return
  fill.value = attrs.fill ?? ''
  stroke.value = attrs.stroke ?? ''
  opacity.value = attrs.opacity ?? 1
  if (attrs.tag === 'rect') {
    x.value = attrs.x
    y.value = attrs.y
    width.value = attrs.width
    height.value = attrs.height
  } else if (attrs.tag === 'ellipse') {
    cx.value = attrs.cx
    cy.value = attrs.cy
    rx.value = attrs.rx
    ry.value = attrs.ry
  } else if (attrs.tag === 'line') {
    x1.value = attrs.x1
    y1.value = attrs.y1
    x2.value = attrs.x2
    y2.value = attrs.y2
  }
})

function apply(key, value) {
  store.setSelectedAttrs({ [key]: value })
}
</script>
