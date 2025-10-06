// Cross-platform FS client: prefers Electron, then Tauri, else web fallback

function hasElectron() {
  return typeof window !== 'undefined' && !!window.electronAPI
}

async function getTauriApis() {
  try {
    // Prefer global first to avoid dynamic import in non-tauri contexts (tests/web)
    if (typeof window !== 'undefined' && window.__TAURI__) return window.__TAURI__
    // Compute spec to avoid Vite static resolution during tests
    const spec = ['@tauri-apps', 'api'].join('/')
    const mod = await import(/* @vite-ignore */ spec)
    return mod
  } catch {
    // Fallback to global if injected
    if (typeof window !== 'undefined' && window.__TAURI__) return window.__TAURI__
    return null
  }
}

export async function openDialog() {
  if (hasElectron()) return window.electronAPI.open()
  const tauri = await getTauriApis()
  if (tauri) {
    const selected = await tauri.dialog.open({
      multiple: false,
      filters: [{ name: 'SVG', extensions: ['svg'] }],
    })
    if (!selected) return null
    const contents = await tauri.fs.readTextFile(selected)
    return { path: selected, contents }
  }
  // web fallback
  return new Promise((resolve) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.svg,image/svg+xml'
    input.onchange = async () => {
      const file = input.files?.[0]
      if (!file) return resolve(null)
      const text = await file.text()
      resolve({ path: file.name, contents: text })
    }
    input.click()
  })
}

export async function saveDialog(
  contents,
  { defaultName = 'document.svg', mime = 'image/svg+xml' } = {},
) {
  // contents: string
  if (hasElectron()) {
    // Electron bridge may handle save dialog; pass contents as-is. If the bridge supports a filename
    // it should be updated to accept it. Keep backwards-compatible single-arg call.
    try {
      const res = await window.electronAPI.save(contents)
      return res
    } catch (err) {
      // Fall through to other methods if electronAPI.save fails
      console.warn('electronAPI.save failed, falling back to other save methods', err)
    }
  }

  const tauri = await getTauriApis()
  if (tauri) {
    const savePath = await tauri.dialog.save({
      filters: [{ name: 'All Files', extensions: ['*'] }],
      defaultPath: defaultName,
    })
    if (!savePath) return null
    await tauri.fs.writeTextFile(savePath, contents)
    return { path: savePath }
  }

  // web fallback: trigger download with the provided filename and mime
  const blob = new Blob([contents], { type: mime || 'application/octet-stream' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = defaultName || 'download.bin'
  a.click()
  // revoke after a tick to avoid issues on some browsers
  setTimeout(() => URL.revokeObjectURL(a.href), 5000)
  return { path: defaultName || 'download.bin' }
}
