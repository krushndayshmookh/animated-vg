

## CI/CD (GitHub Pages)

This repo includes a GitHub Actions workflow that builds the app and deploys to GitHub Pages on pushes to `main` or `master`.

- Workflow: `.github/workflows/deploy-pages.yml`
- Output: `dist/spa` (Quasar default) is published to Pages
- Quasar `publicPath` is set automatically for Pages with `GITHUB_PAGES=true`

To enable Pages:

1) In the repo settings, enable GitHub Pages and choose “GitHub Actions” as the source.
2) Push to `main` (or `master`) to trigger a deploy.

Desktop notes

- Electron smoke (quick sanity run):

```bash
npm run electron:smoke
```

- Tauri dev: Tauri CLI is present; you can try:

```bash
npx tauri dev
```

Depending on your environment, you may need Rust toolchain + platform SDKs. See the Tauri docs for setup.

## Usage overview

- Toolbar: select, rect, ellipse, line; open/save (desktop), panel toggles
- Canvas: click-drag to draw; click to select; drag selection to move
- Inspector: edit attributes of the current selection
- Timeline: add an opacity animation; playback controls use native SVG animation timeline APIs
- Snapping: toggleable in store (UI coming later); affects drawing and moving

## Project structure

Key directories

- `src/components/editor/` – Canvas, Toolbar, Inspector, Layers, Timeline
- `src/stores/` – `editor-store.js` (document, shapes, selection, SMIL APIs)
- `src/services/` – `svg-io.js` (import/export/sanitize), `fs-client.js` (Tauri/Electron/web)
- `src-electron/` – Electron main and preload (IPC bridge for dialogs/FS)
- `src-tauri/` – Tauri project and configuration
- `tests/` – Vitest unit/component tests
- `e2e/` – Playwright E2E tests

## Security

Incoming SVG is sanitized with DOMPurify. SMIL elements/attributes are allowed by configuration, while scripts and event handlers are blocked. Always review untrusted SVGs.

## Contributing

Contributions are welcome! Please read CONTRIBUTING.md for setup, coding standards, and PR guidelines.

## License

MIT. See LICENSE (to be added) or choose your preferred OSI-approved license for your fork.

## Acknowledgements

- Quasar Framework and Vue teams for a great DX
- Tauri and Electron communities

---

See [Configuring quasar.config.js](https://v2.quasar.dev/quasar-cli-vite/quasar-config-js) for advanced build configuration.
