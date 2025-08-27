// Basic SVG import/export helpers for M2

export function importSvg(xml) {
  const doc = new DOMParser().parseFromString(xml, 'image/svg+xml')
  const svg = doc.documentElement
  const title = (doc.querySelector('svg > title')?.textContent || '').trim()
  const viewBox = svg.getAttribute('viewBox') || '0 0 800 600'
  const w = Number(svg.getAttribute('width')) || 800
  const h = Number(svg.getAttribute('height')) || 600
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
