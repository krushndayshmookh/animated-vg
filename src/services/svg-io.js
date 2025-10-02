// Basic SVG import/export helpers for M2

export function importSvg(xml) {
  const doc = new DOMParser().parseFromString(xml, 'image/svg+xml')
  const svg = doc.documentElement
  const title = (doc.querySelector('svg > title')?.textContent || '').trim()
  const viewBox = svg.getAttribute('viewBox') || '0 0 800 600'

  // Try to get width and height from attributes first
  let w = parseFloat(svg.getAttribute('width')) || 0
  let h = parseFloat(svg.getAttribute('height')) || 0

  // If no explicit width/height, try to extract from viewBox
  if (!w || !h) {
    const viewBoxParts = viewBox.split(/\s+/)
    if (viewBoxParts.length >= 4) {
      w = w || parseFloat(viewBoxParts[2]) || 800
      h = h || parseFloat(viewBoxParts[3]) || 600
    } else {
      w = w || 800
      h = h || 600
    }
  }

  console.log('SVG dimensions extracted:', { w, h, viewBox, title })
  return {
    svg,
    metadata: { title, viewBox, size: { w, h } },
  }
}

export function exportSvg(xml, { pretty = false } = {}) {
  if (!pretty) return xml
  // simple pretty: add newline after tags (non-destructive best effort)
  return xml.replace(/></g, '>$\n<').replace(/\$\\n/g, '\n')
}

export function sanitizeOnExport(svgEl) {
  // Preserve SMIL; no script or event handlers
  const disallowedAttrs = [/^on.*/i]
  const walker = svgEl.ownerDocument.createTreeWalker(svgEl, NodeFilter.SHOW_ELEMENT)
  while (walker.nextNode()) {
    const el = walker.currentNode
    for (const attr of Array.from(el.attributes)) {
      if (disallowedAttrs.some((re) => re.test(attr.name))) {
        el.removeAttribute(attr.name)
      }
    }
  }
  return svgEl
}
