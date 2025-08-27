import { contextBridge, ipcRenderer } from 'electron'

// Minimal, safe bridge API for file open/save over IPC.
contextBridge.exposeInMainWorld('electronAPI', {
  open: () => ipcRenderer.invoke('dialog:open'),
  save: (xml) => ipcRenderer.invoke('dialog:save', xml),
})
