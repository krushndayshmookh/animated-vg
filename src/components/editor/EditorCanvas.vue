<template>
  <div class="editor-canvas fit bg-white" data-test="editor-canvas">
  <!-- eslint-disable-next-line vue/no-v-html -->
  <div class="fit" v-html="safeSvgHtml" />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useEditorStore } from 'src/stores/editor-store.js'
import DOMPurify from 'dompurify'

const store = useEditorStore()

const smilAttrs = [
  'begin','dur','end','min','max','repeatCount','repeatDur','fill','restart','calcMode','keyPoints','keySplines','keyTimes','values','from','to','by','path','keyPoints'
]

function sanitizeSvg(html) {
  try {
    return DOMPurify.sanitize(html, {
      USE_PROFILES: { svg: true, svgFilters: true },
      ADD_ATTR: smilAttrs,
      // No scripts or event handlers
      FORBID_TAGS: ['script'],
      FORBID_ATTR: [/^on.*/i],
    })
  } catch {
    return html
  }
}

const safeSvgHtml = computed(() => sanitizeSvg(store.xml))
</script>

<style scoped>
.editor-canvas {
  background: #f8f9fa;
}
.fit {
  width: 100%;
  height: 100%;
  display: block;
}
</style>
