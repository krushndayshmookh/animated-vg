import { defineStore } from 'pinia'
import { importSvg, exportSvg } from 'src/services/svg-io'

export const useEditorStore = defineStore('editor', {
  state: () => ({
    xml: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600"></svg>',
    metadata: { title: '', viewBox: '0 0 800 600', size: { w: 800, h: 600 } },
  }),
  actions: {
    loadFromXml(xml) {
      const { metadata } = importSvg(xml)
      this.xml = xml
      this.metadata = metadata
    },
    setTitle(title) {
      this.metadata.title = title
      const doc = new DOMParser().parseFromString(this.xml, 'image/svg+xml')
      let titleEl = doc.querySelector('svg > title')
      if (!titleEl) {
        titleEl = doc.createElement('title')
        doc.documentElement.insertBefore(titleEl, doc.documentElement.firstChild)
      }
      titleEl.textContent = title
      this.xml = new XMLSerializer().serializeToString(doc.documentElement)
    },
    exportXml(pretty = false) {
      return exportSvg(this.xml, { pretty })
    },
  },
})
