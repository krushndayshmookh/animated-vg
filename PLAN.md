# AnimatedVG – Autonomous Development Plan

Single source of truth for building a cross‑platform Animated SVG editor with SMIL animations. The app runs as a Quasar (Vue 3) SPA and as desktop apps via Tauri 2 and Electron (Chromium engine). Development follows test-first principles (unit, component, integration/E2E) and incremental milestones.

Last updated: 2025-08-21

## 1) Scope and goals

- Create, import, edit, animate, and export SVG files
- Animations are SMIL-based only (using `animate`, `animateTransform`, `animateMotion`, etc.)
- Output is always a single SVG file (no external JSON sidecars)
- Desktop apps via Tauri and Electron; web dev mode for faster iteration; identical editor logic across targets

Non-goals (for initial releases)

- Raster editing (PNG/JPEG) beyond exporting previews
- Non-SMIL animation export formats (CSS/JS, Lottie)
- Cloud sync or multi-user collaboration

Success criteria

- User can draw shapes, edit attributes, group/ungroup, and manage z-order
- User can select and manipulate multiple elements at once
- User can import existing SVG (with or without SMIL), edit it, and re-export as SVG preserving or modifying SMIL
- User can create SMIL animations (timings/keyframes) and preview them in-app
- User can edit SVG visually or through code
- Files open/save through native dialogs in Tauri; drag-and-drop in web
- All core flows covered by automated tests

## 2) Architecture overview

- Frontend: Vue 3 + Quasar 2 (Vite), Composition API, Pinia for state
- Rendering strategy: Inline `svg` in DOM; editor manipulates SVG DOM + synchronized model
- Persistence: Always export SVG text; import by parsing SVG text
- Desktop wrappers:
  - Tauri 2: file dialogs (open/save), reading/writing files, optional recent files/settings
  - Electron (Chromium): alternative desktop target to leverage Chromium’s SVG/SMIL rendering behavior
- Plugins/libraries:
  - Parsing/serialization: DOMParser + XMLSerializer (built-in); optional SVGO with strict config (no SMIL removal)
  - Sanitization: DOMPurify (configured to keep SMIL elements/attrs) for imported SVGs
  - Testing: Vitest + Vue Test Utils for unit/component; Playwright for E2E; Rust unit tests for Tauri commands

Key risks

- SMIL support varies by engine. Tauri uses platform WebViews (macOS WKWebView, Windows WebView2, Linux WebKitGTK); Electron uses Chromium.
- Mitigation: runtime capability check and a small banner if limitations are detected; always export valid SMIL; provide static preview hints; track engine-specific quirks.

## 3) Project structure conventions

- src/
  - components/editor/… UI components (Canvas, Toolbar, Inspector, Timeline, Layers, Modals)
  - pages/
    - EditorPage.vue (primary working surface)
  - stores/
    - editorStore.ts (document state, selection, undo/redo)
    - timelineStore.ts (animations, keyframes)
    - settingsStore.ts (UI settings, preferences)
  - services/
    - svg-io.ts (import/export, sanitize, svgo)
    - svg-dom.ts (DOM helpers for mutations, selection boxes, transforms)
    - smil.ts (SMIL creation, parsing, validation)
  - fs-client.ts (platform FS abstraction: web shims, Tauri invocations, Electron IPC)
  - utils/
    - geometry.ts, ids.ts, clipboard.ts, throttle.ts, serialize.ts
  - types/
    - svg.ts, animation.ts, io.ts
  - tests/ (vitest) + e2e/ (playwright)
- src-tauri/
  - src/
    - lib.rs (commands registration)
    - fs.rs (file open/save commands)
    - settings.rs (optional)
  - tests/ (Rust)

## 4) Data model (TypeScript)

- SvgDocument
  - id: string
  - xml: string (source of truth for save/export)
  - dom: SVGSVGElement (live; regenerated from xml on load or after export)
  - metadata: { title?: string; viewBox?: string; size?: { w: number; h: number } }
- SvgElementRef
  - id: string
  - type: 'rect'|'circle'|'ellipse'|'line'|'polyline'|'polygon'|'path'|'g'|…
  - ref: Element (live DOM reference)
- Selection
  - ids: string[]
  - bbox: { x: number; y: number; w: number; h: number } | null
- Animation
  - id: string
  - targetId: string
  - attributeName: string
  - type: 'animate'|'animateTransform'|'animateMotion'
  - timing: { begin: number; dur: number; repeatCount?: number|'indefinite' }
  - keyTimes?: number[]
  - values?: string[]
  - calcMode?: 'discrete'|'linear'|'paced'|'spline'
  - additive?: 'replace'|'sum'
  - accumulate?: 'none'|'sum'
- DocumentState
  - undoStack: string[] (serialized SVG snapshots)
  - redoStack: string[]
  - dirty: boolean

Notes

- The DOM is primary for live editing performance; snapshots (XML) are used for undo/redo and persistence.
- When editing, update DOM then sync XML using XMLSerializer; push diff snapshots for undo/redo (bounded size).

## 5) SMIL animation support

- Supported elements: `animate`, `animateTransform`, `animateMotion` (initially)
- Attributes supported first: transform (translate/scale/rotate), opacity, fill, stroke, path data (`d`), `cx`/`cy`/`r`, `x`/`y`/`width`/`height`
- Timeline editor maps to SMIL `values`/`keyTimes`; export generates or updates corresponding `animate*` elements on targets
- Import parses existing SMIL nodes and reconstructs timeline items
- Preview: use native SMIL playback (`pauseAnimations`/`unpauseAnimations`/`setCurrentTime`) when available; else show annotations and static preview

## 6) Milestones (test-first)

Each milestone includes: Tasks, Tests, Acceptance.

M0 – Test harness and scaffolding

- Tasks
  - Add Vitest + Vue Test Utils; configure Quasar testing
  - Add Playwright (web) for E2E basics
  - Add basic Rust test framework for Tauri commands
  - Add Electron smoke test harness (simple launch/close script) and preload safety checks
  - CI task in package.json for lint/test
- Tests
  - Sanity unit test (store) and component mount smoke test
  - E2E: app loads, shows EditorPage
  - Rust: trivial command test placeholder
  - Electron: renderer loads EditorPage via Chromium
- Acceptance
  - `pnpm test` runs unit + component tests; `pnpm e2e` runs Playwright headless; CI green

M1 – Editor shell UI

- Tasks
  - Create EditorPage with layout: Top Toolbar, Left Tools, Center Canvas, Right Inspector, Bottom Timeline, Left Layers
  - Implement resizable panels (Quasar splitters)
- Tests
  - Component mount tests: panels render; toolbar buttons exist
  - E2E: layout loads, panels toggle
- Acceptance
  - Editor shell stable at different window sizes

M2 – SVG import/export (no animations)

- Tasks
  - svg-io: import (parse + sanitize) and export (serialize + pretty)
  - DOM mount in Canvas; maintain document metadata
  - Desktop FS integration:
    - Tauri: open/save dialogs + file read/write commands
    - Electron: open/save dialogs + file read/write via IPC to main
- Tests
  - Unit: import/export round-trip retains shapes/attrs
  - E2E: Load sample SVG, edit title, save
  - Rust: file IO commands unit tests with temp dirs
  - Electron: IPC handler unit/integration tests (mocked) and smoke (open/save)
- Acceptance
  - Users can open and save SVG files via desktop dialogs on Tauri and Electron; drag/drop in web

M3 – Basic drawing and selection

- Tasks
  - Tools: Select, Rectangle, Ellipse, Line
  - Canvas interactions: click/drag to draw; selection box; transform handles (move/scale/rotate initial)
- Tests
  - Unit: geometry helpers; id generation
  - Component: draw rectangle -> DOM has rect; selection updates
  - E2E: draw two shapes, select, move
- Acceptance
  - Shapes render and can be selected/moved; undo/redo basic

M4 – Inspector and attributes editing

- Tasks
  - Inspector for common attributes: fill/stroke/opacity/transform/coords
  - Bind to selection; apply changes to DOM and XML
- Tests
  - Unit: attribute application mapping
  - Component: change fill -> DOM updated; snapshot XML contains change
  - E2E: modify selected shape; undo/redo
- Acceptance
  - Attribute edits reflect immediately and persist on save

M5 – SMIL timeline (create/edit)

- Tasks
  - TimelineStore model; Timeline UI with tracks per element
  - Add keyframes; generate `animate*` with `values`/`keyTimes`
  - Playback controls using SVGSVGElement animation timeline API
- Tests
  - Unit: SMIL generation from keyframes; parsing existing SMIL
  - Component: timeline adds animation; SVG contains correct `animate`
  - E2E: add opacity animation, play/pause, export and verify
- Acceptance
  - Users can add simple opacity/transform animations and preview in app
  - Preview works in Chromium (Electron) and best-effort in platform WebViews (Tauri)

M6 – Import existing SMIL and edit

- Tasks
  - Parse SMIL from imported SVG, populate timeline
  - Support editing timings/values and re-export
- Tests
  - Unit: SMIL parse fidelity on curated fixtures
  - E2E: load animated SVG; timeline reflects; modify and save
- Acceptance
  - SMIL round-trip editing works

M7 – Advanced tools and polish

- Tasks
  - Group/ungroup; z-order; path edit (MVP: convert selection to path with basic node moves)
  - Snapping, rulers/grid; multi-select transform
  - SVGO optional optimize step with SMIL-preserving config
- Tests
  - Unit/Component as appropriate
  - E2E: common flows remain green
- Acceptance
  - Comfortable editing experience for medium-complexity SVGs

## 7) Testing strategy

- Unit tests (Vitest)
  - Stores, services, utils
  - Fast, headless (jsdom)
- Component tests (Vitest + Vue Test Utils)
  - Mount core components; simulate events; assert DOM/model
- E2E tests (Playwright)
  - Web-run to verify user flows (draw, edit, animate, save)
  - Later: optional Tauri-driven runs for desktop smoke
  - Electron smoke: launch window, verify renderer shows EditorPage, basic FS mock flow
- Rust tests
  - Unit tests for file commands; error handling; path edge cases
- Fixtures
  - test/fixtures/svgs: simple, medium, with/without SMIL

Commands (to be added)

- npm run test – unit + component
- npm run e2e – Playwright tests
- npm run test:rust – cargo test in src-tauri
- npm run ci – lint + typecheck + all tests
  
Dev/build targets (reference)

- Web SPA dev: `quasar dev`
- Electron dev: `quasar dev -m electron`
- Tauri dev: `npm run tauri dev` (spawns `npm run dev` and wraps it)
- Web SPA build: `quasar build`
- Electron build: `quasar build -m electron` (packager)
- Tauri build: `npm run tauri build`

## 8) Tauri integration plan

- Commands in Rust (src-tauri/src/fs.rs)
  - `open_file_dialog() -> Option<PathBuf>`
  - `save_file_dialog(default_name: Option<&str>) -> Option<PathBuf>`
  - `read_file(path: &str) -> String`
  - `write_file(path: &str, contents: &str) -> ()`
- Register commands in lib.rs; expose via invoke
- Use tauri-plugin-dialog and tauri-plugin-fs if stable on Tauri 2; otherwise implement with core APIs
- Security: restrict dialog start dirs; no arbitrary command execution

## 8b) Electron integration plan

- Main process: register IPC handlers for `open-file`, `save-file`, `read-file`, `write-file`
- Preload: expose a minimal bridge API on `window.electronAPI` for FS operations
- Renderer: `fs-client.ts` detects Electron via `window.electronAPI` and calls into IPC; falls back to Tauri/web as appropriate
- Security: `contextIsolation: true`, only expose least-privileged APIs via preload; no `nodeIntegration` in renderer; validate file paths

## 9) Security and sanitization

- Incoming SVG: sanitize with DOMPurify
  - Allow SMIL elements/attrs (animate*, keyTimes, values, dur, begin, etc.)
  - Disallow script/event handler attributes and external references
- Editor prevents injection of unsafe content when editing attributes
- Maintain a whitelist of allowed attributes per element type

## 10) Performance considerations

- Avoid full XML re-serialize on every keystroke; debounce and snapshot strategically
- Limit undo/redo memory by keeping bounded, compressed snapshots
- For large documents, virtualize layer list and avoid expensive bbox recomputations

## 11) Accessibility and UX

- Keyboard shortcuts for tools and commands (Cmd/Ctrl+O/S/Z/Y, V/R/E/L, etc.)
- Focus management across panels; ARIA labels for controls
- Theme: Quasar dark/light toggle

## 12) CI and quality gates

- Lint, typecheck, test (unit/component/e2e), Rust tests
- Minimal pipeline steps:
  - Build (web) – quasar build
  - Build (tauri) – pnpm tauri build (optional in CI)
  - Build (electron) – quasar build -m electron (optional in CI)
- Gates: must be green before merging major features

## 13) Implementation sequencing (high-level)

1) M0: testing/tooling
2) M1: shell UI
3) M2: import/export + tauri FS commands
4) M3: drawing + selection + undo/redo
5) M4: inspector edits
6) M5: SMIL timeline create/play
7) M6: SMIL import/edit
8) M7: polish (groups/z-order/path/edit, snapping, SVGO)

## 14) Definitions of Done (per feature)

- Code: typed, documented key functions, no TODOs left untracked
- Tests: unit/component + E2E updated and green
- QA: manual smoke on macOS desktop build (Tauri) for FS flows
- Docs: README updated with new user actions if applicable

## 15) Open questions / decisions to validate

- SMIL runtime support on target platforms (WKWebView/Edge WebView2). Mitigation: runtime capability check + warning banner when unsupported; still export SMIL.
- SVGO usage: ensure config preserves SMIL; default disabled until thoroughly verified
- Path editing depth (basic vs. advanced) for initial releases

## 16) Initial tasks to open (M0)

- Add Vitest, Vue Test Utils, Playwright, and configs for Quasar
- Add sample tests: store smoke, component mount, E2E landing
- Add Rust test harness and sample
- Wire package.json scripts
- Document how to run tests in README

---

This plan governs all implementation. Any change to behavior or scope must first update this PLAN.md, then code and tests follow it.
