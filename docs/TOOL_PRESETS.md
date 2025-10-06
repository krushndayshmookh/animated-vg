# Tool Presets Feature

## Overview

The Tool Presets feature allows users to create, save, and manage custom tool configurations and presets in AnimatedVG. This feature enables users to:

- **Create custom tools** with specific configurations
- **Save tool presets** for quick access to frequently used settings
- **Import/Export presets** to share configurations across devices or with other users
- **Apply presets** instantly to switch between different tool configurations

## Features

### 1. Tool Presets Management

#### Creating a Preset

1. Open the Tool Presets Manager (click the bookmark icon in the toolbar)
2. Fill in the preset details:
   - **Preset name**: A descriptive name for your preset
   - **Tool**: Select the tool this preset applies to (select, pan, add-shape-square, etc.)
   - **Config (JSON)**: Define the configuration in JSON format
3. Click **SAVE** to save the preset

#### Editing a Preset

1. Click on a preset in the list to load it into the editor
2. Modify the fields as needed
3. Click **SAVE** to update the preset

#### Applying a Preset

- Click the checkmark icon next to a preset to apply it immediately
- This will activate the selected tool and apply the configuration

#### Deleting a Preset

- Click the trash icon next to a preset to delete it
- Confirm the deletion in the dialog

### 2. Custom Tools

#### Creating a Custom Tool

1. Open the Tool Presets Manager
2. In the "Custom Tools" section, click **NEW TOOL**
3. Fill in the tool details:
   - **Tool name**: A unique name for your custom tool
   - **Icon (optional)**: Eva icon name (e.g., `eva-cube-outline`)
   - **Meta (JSON)**: Additional metadata in JSON format
4. Click **SAVE TOOL** to create the custom tool

#### Editing a Custom Tool

1. Click on a custom tool in the list to load it into the editor
2. Modify the fields as needed
3. Click **SAVE TOOL** to update

#### Deleting a Custom Tool

- Click the trash icon next to a custom tool to delete it
- Confirm the deletion in the dialog

### 3. Import/Export

#### Exporting Presets

1. Click the **EXPORT** button
2. Choose a location to save the `presets.json` file
3. The file contains both presets and custom tools

#### Importing Presets

1. Click the **IMPORT** button
2. Select a `presets.json` file to import
3. Presets and custom tools will be merged with existing ones

## Configuration Format

### Preset Configuration Example

```json
{
  "snapEnabled": true,
  "snapSize": 10,
  "showGrid": true,
  "title": "My Document"
}
```

### Custom Tool Meta Example

```json
{
  "description": "Custom drawing tool",
  "category": "shapes",
  "shortcuts": ["ctrl+d"],
  "defaultAttrs": {
    "fill": "#ff0000",
    "stroke": "#000000"
  }
}
```

## Export File Format

The exported JSON file has the following structure:

```json
{
  "presets": [
    {
      "id": "preset-abc123",
      "name": "Quick Sketch",
      "tool": "select",
      "config": {
        "snapEnabled": false,
        "showGrid": false
      }
    }
  ],
  "customTools": [
    {
      "id": "tool-xyz789",
      "name": "Custom Pen",
      "icon": "eva-edit-outline",
      "meta": {
        "description": "Custom pen tool"
      }
    }
  ]
}
```

## Built-in Tools

The following built-in tools are available for presets:

- **select**: Selection tool for picking and moving elements
- **pan**: Pan tool for moving the canvas view
- **add-shape-square**: Rectangle drawing tool
- **add-shape-circle**: Ellipse/circle drawing tool
- **add-shape-line**: Line drawing tool

Custom tools you create will also appear in the tool dropdown.

## Store Integration

### Editor Store Methods

The following methods are available in the `editorStore`:

#### Preset Management

- `savePreset({ id?, name, tool, config })` - Save or update a preset
- `applyPreset(id)` - Apply a preset by ID
- `deletePreset(id)` - Delete a preset by ID
- `exportPresets()` - Export presets and custom tools as JSON string
- `importPresets(jsonString)` - Import presets and custom tools from JSON

#### Custom Tool Management

- `saveCustomTool({ id?, name, icon?, meta })` - Save or update a custom tool
- `deleteCustomTool(id)` - Delete a custom tool by ID

### State Properties

- `presets: []` - Array of saved presets
- `customTools: []` - Array of custom tools

## UI Components

### ToolPresetsManager.vue

The main component for managing presets and custom tools. Features:

- **Two-column layout**: List view on the left, editor on the right
- **Preset list**: Shows all saved presets with apply/delete actions
- **Custom tools list**: Shows all custom tools with delete actions
- **Import/Export buttons**: For sharing presets
- **Form validation**: Ensures required fields are filled and JSON is valid
- **Notifications**: User feedback for all actions

## Usage Example

```vue
<script setup>
import { ref } from 'vue'
import ToolPresetsManager from 'src/components/editor/ToolPresetsManager.vue'

const showPresets = ref(false)

function openPresets() {
  showPresets.value = true
}
</script>

<template>
  <q-btn @click="openPresets">Open Presets</q-btn>
  <ToolPresetsManager v-model="showPresets" />
</template>
```

## Best Practices

1. **Descriptive Names**: Use clear, descriptive names for presets and custom tools
2. **JSON Validation**: Always validate JSON before saving to avoid errors
3. **Regular Exports**: Export your presets regularly to back them up
4. **Organize by Purpose**: Create presets for specific workflows (e.g., "Sketch Mode", "Precision Mode")
5. **Icon Consistency**: Use Eva icons for custom tools to maintain UI consistency

## Keyboard Shortcuts

- **Close Dialog**: `Esc` key
- Access via toolbar: Click the bookmark icon (eva-bookmark-outline)

## Troubleshooting

### Preset Not Applying

- Ensure the tool specified in the preset exists
- Check that the config JSON is valid
- Verify the preset was saved successfully

### Import Fails

- Verify the JSON file format matches the expected structure
- Check for syntax errors in the JSON file
- Ensure the file contains both `presets` and `customTools` arrays

### Custom Tool Not Appearing

- Ensure the tool was saved successfully
- Check that the tool name is unique
- Verify the icon name is valid (Eva icons format)

## Future Enhancements

Potential improvements for future versions:

- Preset categories/tags for better organization
- Preset search and filtering
- Preset templates/examples
- Keyboard shortcuts for applying presets
- Preset preview/thumbnail
- Cloud sync for presets
- Community preset sharing

## Related Files

- `src/components/editor/ToolPresetsManager.vue` - Main UI component
- `src/stores/editor-store.js` - State management and business logic
- `src/services/fs-client.js` - File system operations for import/export
- `src/pages/EditorPage.vue` - Integration point in the editor

## API Reference

See the inline documentation in `editor-store.js` for detailed API information on all preset and custom tool methods.
