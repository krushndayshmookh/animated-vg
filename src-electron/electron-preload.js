import { contextBridge } from 'electron'
import fs from 'node:fs/promises'
import { dialog } from '@electron/remote'

// Minimal, safe bridge API for file open/save. Ensure nodeIntegration is off and contextIsolation is true.
contextBridge.exposeInMainWorld('electronAPI', {
	async open() {
		const { canceled, filePaths } = await dialog.showOpenDialog({
			properties: ['openFile'],
			filters: [{ name: 'SVG', extensions: ['svg'] }],
		})
		if (canceled || !filePaths?.length) return null
		const p = filePaths[0]
		const contents = await fs.readFile(p, 'utf8')
		return { path: p, contents }
	},
	async save(xml) {
		const { canceled, filePath } = await dialog.showSaveDialog({
			filters: [{ name: 'SVG', extensions: ['svg'] }],
		})
		if (canceled || !filePath) return null
		await fs.writeFile(filePath, xml, 'utf8')
		return { path: filePath }
	},
})
