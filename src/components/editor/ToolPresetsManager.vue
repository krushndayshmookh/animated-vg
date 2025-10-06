<template>
  <q-dialog v-model="visible" persistent>
    <q-card style="min-width: 720px; max-width: 920px; max-height: 85vh; overflow: auto">
      <q-card-section>
        <div class="text-h6">Tool Presets</div>
        <div class="text-subtitle2">Create, apply and manage tool presets</div>
      </q-card-section>

      <q-separator />

      <q-card-section>
        <div class="row q-col-gutter-md">
          <!-- Left Column -->
          <div class="col-5">
            <!-- Presets Section -->
            <div class="presets-box">
              <div class="presets-box-header">Presets</div>
              <div class="presets-list">
                <template v-if="presets.length === 0">
                  <div class="empty-state">No presets saved</div>
                </template>
                <q-list v-else bordered separator>
                  <q-item
                    v-for="p in presets"
                    :key="p.id"
                    clickable
                    :active="form.id === p.id"
                    @click="selectPreset(p)"
                  >
                    <q-item-section>
                      <q-item-label>{{ p.name }}</q-item-label>
                      <q-item-label caption>({{ p.tool }})</q-item-label>
                    </q-item-section>
                    <q-item-section side>
                      <div class="row q-gutter-xs">
                        <q-btn
                          dense
                          flat
                          size="sm"
                          icon="eva-checkmark-outline"
                          @click.stop="applyPreset(p.id)"
                        >
                          <q-tooltip>Apply preset</q-tooltip>
                        </q-btn>
                        <q-btn
                          dense
                          flat
                          size="sm"
                          color="negative"
                          icon="eva-trash-2-outline"
                          @click.stop="deletePreset(p.id)"
                        >
                          <q-tooltip>Delete preset</q-tooltip>
                        </q-btn>
                      </div>
                    </q-item-section>
                  </q-item>
                </q-list>
              </div>
            </div>

            <!-- Import/Export Buttons -->
            <div class="row q-mt-md q-gutter-sm">
              <q-btn outline icon="eva-download-outline" label="IMPORT" @click="onImport" />
              <q-btn outline icon="eva-upload-outline" label="EXPORT" @click="onExport" />
            </div>

            <!-- Custom Tools Section -->
            <div class="q-mt-lg">
              <div class="section-header">Custom Tools</div>
              <div class="custom-tools-list q-mt-sm">
                <template v-if="customTools.length === 0">
                  <div class="empty-state-small">No custom tools</div>
                </template>
                <q-list v-else bordered separator dense>
                  <q-item
                    v-for="t in customTools"
                    :key="t.id"
                    clickable
                    :active="toolForm.id === t.id"
                    @click="selectCustomTool(t)"
                  >
                    <q-item-section avatar>
                      <q-icon :name="t.icon || 'eva-cube-outline'" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>{{ t.name }}</q-item-label>
                    </q-item-section>
                    <q-item-section side>
                      <q-btn
                        dense
                        flat
                        size="sm"
                        color="negative"
                        icon="eva-trash-2-outline"
                        @click.stop="deleteCustomTool(t.id)"
                      >
                        <q-tooltip>Delete tool</q-tooltip>
                      </q-btn>
                    </q-item-section>
                  </q-item>
                </q-list>
              </div>
              <q-btn
                outline
                icon="eva-plus-outline"
                label="NEW TOOL"
                class="q-mt-sm full-width"
                @click="createNewTool"
              />
            </div>
          </div>

          <!-- Right Column -->
          <div class="col-7">
            <!-- Preset Editor -->
            <div class="editor-section">
              <div class="row q-mb-sm">
                <q-input v-model="form.name" label="Preset name" outlined dense class="col" />
              </div>
              <div class="row q-mb-sm">
                <q-select
                  v-model="form.tool"
                  :options="toolOptions"
                  label="Tool"
                  outlined
                  dense
                  class="col"
                />
              </div>
              <div class="row q-mb-sm">
                <q-input
                  v-model="form.configJson"
                  label="Config (JSON)"
                  type="textarea"
                  outlined
                  dense
                  rows="5"
                  class="col"
                />
              </div>

              <div class="row q-mt-md justify-end q-gutter-sm">
                <q-btn label="CANCEL" flat @click="resetForm" />
                <q-btn label="SAVE" color="primary" unelevated @click="save" />
              </div>
            </div>

            <q-separator class="q-my-md" />

            <!-- Custom Tool Editor -->
            <div class="editor-section">
              <div class="text-subtitle2 q-mb-md">Edit Custom Tool</div>
              <div class="row q-mb-sm">
                <q-input v-model="toolForm.name" label="Tool name" outlined dense class="col" />
              </div>
              <div class="row q-mb-sm">
                <q-input
                  v-model="toolForm.icon"
                  label="Icon (optional)"
                  outlined
                  dense
                  class="col"
                  hint="e.g., eva-cube-outline"
                />
              </div>
              <div class="row q-mb-sm">
                <q-input
                  v-model="toolForm.metaJson"
                  label="Meta (JSON)"
                  type="textarea"
                  outlined
                  dense
                  rows="4"
                  class="col"
                />
              </div>

              <div class="row q-mt-md justify-end q-gutter-sm">
                <q-btn label="CANCEL" flat @click="resetToolForm" />
                <q-btn label="SAVE TOOL" color="primary" unelevated @click="saveTool" />
              </div>
            </div>
          </div>
        </div>
      </q-card-section>

      <q-separator />

      <q-card-actions align="right">
        <q-btn v-close-popup flat label="Close" @click="close" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useQuasar } from 'quasar'
import { useEditorStore } from 'src/stores/editor-store.js'
import { saveDialog, openDialog } from 'src/services/fs-client'

const props = defineProps({ modelValue: Boolean })
const emit = defineEmits(['update:modelValue'])

const $q = useQuasar()
const store = useEditorStore()

const visible = ref(!!props.modelValue)
watch(
  () => props.modelValue,
  (v) => (visible.value = !!v),
)
watch(visible, (v) => emit('update:modelValue', v))

const presets = computed(() => store.presets || [])
const customTools = computed(() => store.customTools || [])

const toolOptions = computed(() => {
  // combine built-in tools and customTools
  const built = ['select', 'pan', 'add-shape-square', 'add-shape-circle', 'add-shape-line']
  const customs = (store.customTools || []).map((t) => t.name || t.id)
  return built.concat(customs).map((x) => ({ label: x, value: x }))
})

const form = ref({ id: null, name: '', tool: 'select', configJson: '{}' })

const toolForm = ref({ id: null, name: '', icon: '', metaJson: '{}' })

function resetToolForm() {
  toolForm.value = { id: null, name: '', icon: '', metaJson: '{}' }
}

function createNewTool() {
  resetToolForm()
  $q.notify({
    type: 'info',
    message: 'Ready to create new tool',
    position: 'top',
    timeout: 1000,
  })
}

function selectCustomTool(t) {
  toolForm.value = {
    id: t.id,
    name: t.name,
    icon: t.icon || '',
    metaJson: JSON.stringify(t.meta || {}, null, 2),
  }
  $q.notify({
    type: 'info',
    message: `Editing "${t.name}"`,
    position: 'top',
    timeout: 1000,
  })
}

function saveTool() {
  if (!toolForm.value.name) {
    $q.notify({
      type: 'negative',
      message: 'Tool name is required',
      position: 'top',
    })
    return
  }

  let meta = {}
  try {
    meta = JSON.parse(toolForm.value.metaJson || '{}')
  } catch {
    $q.notify({
      type: 'negative',
      message: 'Invalid JSON in Meta field',
      position: 'top',
    })
    return
  }

  try {
    store.saveCustomTool({
      id: toolForm.value.id,
      name: toolForm.value.name,
      icon: toolForm.value.icon,
      meta,
    })
    $q.notify({
      type: 'positive',
      message: 'Custom tool saved successfully',
      position: 'top',
    })
    resetToolForm()
  } catch (err) {
    console.error('Failed to save custom tool', err)
    $q.notify({
      type: 'negative',
      message: 'Failed to save custom tool',
      position: 'top',
    })
  }
}

function deleteCustomTool(id) {
  $q.dialog({
    title: 'Confirm',
    message: 'Are you sure you want to delete this custom tool?',
    cancel: true,
    persistent: true,
  }).onOk(() => {
    store.deleteCustomTool(id)
    if (toolForm.value.id === id) {
      resetToolForm()
    }
    $q.notify({
      type: 'positive',
      message: 'Custom tool deleted',
      position: 'top',
    })
  })
}

function resetForm() {
  form.value = { id: null, name: '', tool: 'select', configJson: '{}' }
}

function selectPreset(p) {
  form.value = {
    id: p.id,
    name: p.name,
    tool: p.tool,
    configJson: JSON.stringify(p.config || {}, null, 2),
  }
}

function save() {
  if (!form.value.name) {
    $q.notify({
      type: 'negative',
      message: 'Preset name is required',
      position: 'top',
    })
    return
  }

  let config = {}
  try {
    config = JSON.parse(form.value.configJson || '{}')
  } catch {
    $q.notify({
      type: 'negative',
      message: 'Invalid JSON in Config field',
      position: 'top',
    })
    return
  }

  try {
    store.savePreset({
      id: form.value.id,
      name: form.value.name,
      tool: form.value.tool,
      config,
    })
    $q.notify({
      type: 'positive',
      message: 'Preset saved successfully',
      position: 'top',
    })
    resetForm()
  } catch (err) {
    console.error('Failed to save preset', err)
    $q.notify({
      type: 'negative',
      message: 'Failed to save preset',
      position: 'top',
    })
  }
}

function applyPreset(id) {
  const success = store.applyPreset(id)
  if (success) {
    $q.notify({
      type: 'positive',
      message: 'Preset applied successfully',
      position: 'top',
    })
  } else {
    $q.notify({
      type: 'negative',
      message: 'Failed to apply preset',
      position: 'top',
    })
  }
}

function deletePreset(id) {
  $q.dialog({
    title: 'Confirm',
    message: 'Are you sure you want to delete this preset?',
    cancel: true,
    persistent: true,
  }).onOk(() => {
    store.deletePreset(id)
    if (form.value.id === id) {
      resetForm()
    }
    $q.notify({
      type: 'positive',
      message: 'Preset deleted',
      position: 'top',
    })
  })
}

async function onExport() {
  const json = store.exportPresets()
  try {
    await saveDialog(json, { defaultName: 'presets.json', mime: 'application/json' })
    $q.notify({
      type: 'positive',
      message: 'Presets exported successfully',
      position: 'top',
    })
  } catch (err) {
    console.error('Export failed', err)
    $q.notify({
      type: 'negative',
      message: 'Export failed: ' + (err?.message || String(err)),
      position: 'top',
    })
  }
}

async function onImport() {
  try {
    const result = await openDialog()
    if (result?.contents) {
      const success = store.importPresets(result.contents)
      if (success) {
        $q.notify({
          type: 'positive',
          message: 'Presets imported successfully',
          position: 'top',
        })
      }
      return
    }
  } catch (err) {
    console.error('Import dialog failed', err)
  }

  // Fallback: prompt the user to paste JSON
  const pasted = prompt('Paste presets JSON')
  if (pasted) {
    try {
      const success = store.importPresets(pasted)
      if (success) {
        $q.notify({
          type: 'positive',
          message: 'Presets imported successfully',
          position: 'top',
        })
      }
    } catch (e) {
      console.error('Import failed', e)
      $q.notify({
        type: 'negative',
        message: 'Failed to import presets',
        position: 'top',
      })
    }
  }
}

function close() {
  visible.value = false
}
</script>

<style scoped>
.presets-box {
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  min-height: 200px;
  max-height: 300px;
  display: flex;
  flex-direction: column;
}

.presets-box-header {
  padding: 12px;
  font-weight: 600;
  border-bottom: 1px solid #e0e0e0;
  background-color: #f5f5f5;
}

.presets-list {
  flex: 1;
  overflow-y: auto;
}

.empty-state {
  padding: 40px 20px;
  text-align: center;
  color: #999;
  font-style: italic;
}

.empty-state-small {
  padding: 20px;
  text-align: center;
  color: #999;
  font-size: 0.9em;
  font-style: italic;
}

.section-header {
  font-weight: 600;
  font-size: 1.1em;
  color: #333;
}

.custom-tools-list {
  max-height: 200px;
  overflow-y: auto;
}

.editor-section {
  padding: 8px;
}

.q-list {
  max-height: 100%;
}
</style>
