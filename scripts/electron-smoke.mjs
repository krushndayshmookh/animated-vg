import { spawn } from 'node:child_process'

// Launch Electron via Quasar to verify the renderer boots.
// Requires: quasar CLI dependencies are installed.

const child = spawn('npx', ['quasar', 'dev', '-m', 'electron'], {
  stdio: 'inherit',
  env: { ...process.env, CI: '1' },
})

// Auto-kill after a short window, assuming startup success if process is alive.
const timeout = setTimeout(() => {
  child.kill('SIGTERM')
  console.log('electron-smoke: success (timed)')
}, 15000)

child.on('exit', (code) => {
  clearTimeout(timeout)
  if (code && code !== 0) {
    console.error('electron-smoke: exited with code', code)
    process.exit(code)
  }
})
