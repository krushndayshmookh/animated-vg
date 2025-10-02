// Basic SVG helpers

export function importSvg(xml) {
  const doc = new DOMParser().parseFromString(xml, 'image/svg+xml')
  ensureIds(doc)

  const newXml = new XMLSerializer().serializeToString(doc) // re-serialize to clean up with ensured IDs
  const svg = doc.documentElement
  const json = domToJson(svg)

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

  return {
    xml: newXml,
    svg,
    json,
    metadata: { title, viewBox, size: { w, h } },
  }
}

export function exportSvg(xml, { pretty = true } = {}) {
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

export function domToJson(node) {
  let id = node.id || (node.attributes && node.attributes.getNamedItem('id')?.value) || null

  if (!id) {
    id = 'id-' + new Date().getTime().toString(36) + Math.random().toString(36).slice(2)
  }

  if (node.nodeType === Node.ELEMENT_NODE) {
    const obj = {
      id,
      tagName: node.tagName.toLowerCase(),
      // attributes: {},
      children: [],
    }

    // // Extract attributes
    // for (const attr of node.attributes) {
    //   obj.attributes[attr.name] = attr.value
    // }

    // Process child nodes
    for (const childNode of node.childNodes) {
      const childJson = domToJson(childNode)
      if (childJson) {
        obj.children.push(childJson)
      }
    }
    return obj
  } else if (node.nodeType === Node.TEXT_NODE) {
    const trimmedText = node.textContent.trim()
    return trimmedText ? { textContent: trimmedText } : null
  }
  // Ignore other node types like comments, processing instructions, etc.
  return null
}

export function ensureIds(doc) {
  /** Ensure all elements have unique IDs */
  const existingIds = new Set()
  const walker = doc.createTreeWalker(doc, NodeFilter.SHOW_ELEMENT)
  while (walker.nextNode()) {
    const el = walker.currentNode
    const id = el.id || (el.attributes && el.attributes.getNamedItem('id')?.value)
    if (id) {
      existingIds.add(id)
    }
  }
  walker.currentNode = doc // Reset to start
  while (walker.nextNode()) {
    const el = walker.currentNode
    let id = el.id || (el.attributes && el.attributes.getNamedItem('id')?.value)
    if (!id) {
      // Generate a new unique ID
      do {
        id = 'id-' + Math.random().toString(36).slice(2, 10)
      } while (existingIds.has(id))
      el.id = id
      existingIds.add(id)
    }
  }
  return doc
}
