import { describe, it, expect } from 'vitest'
import { importSvg, exportSvg, sanitizeOnExport } from '../src/services/svg-io.js'

const sample = `<?xml version="1.0"?><svg width="100" height="50" viewBox="0 0 100 50" xmlns="http://www.w3.org/2000/svg"><title>Demo</title><rect width="100" height="50" fill="red"><animate attributeName="x" from="0" to="10" dur="1s" repeatCount="indefinite"/></rect><script>console.log('x')</script></svg>`

describe('svg-io', () => {
  it('imports svg and extracts metadata', () => {
    const { metadata } = importSvg(sample)
    expect(metadata.title).toBe('Demo')
    expect(metadata.viewBox).toBe('0 0 100 50')
    expect(metadata.size.w).toBe(100)
    expect(metadata.size.h).toBe(50)
  })

  it('exportSvg pretty returns formatted string when enabled', () => {
    const out = exportSvg('<svg><g></g></svg>', { pretty: true })
    expect(out.includes('\n')).toBe(true)
  })

  it('sanitizeOnExport removes event handlers but keeps SMIL', () => {
    const doc = new DOMParser().parseFromString('<svg xmlns="http://www.w3.org/2000/svg"><g onclick="alert(1)"><animate attributeName="x" dur="1s"/></g></svg>', 'image/svg+xml')
    const svg = doc.documentElement
    const sanitized = sanitizeOnExport(svg)
    expect(sanitized.querySelector('[onclick]')).toBeNull()
    // SMIL animate should remain
    expect(sanitized.querySelector('animate')).not.toBeNull()
  })
})
