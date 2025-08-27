# Contributing to AnimatedVG

Thanks for your interest in contributing! This guide covers local setup, coding standards, and how to propose changes.

## Code of Conduct

By participating in this project, you agree to uphold a respectful, inclusive environment. If a separate CODE_OF_CONDUCT is added later, it will be referenced here.

## Getting started

Prerequisites

- Node.js 18+
- npm (preferred) or yarn
- For desktop dev: Rust toolchain (for Tauri) and platform SDKs if you plan to run native builds

Clone and install

```bash
git clone https://github.com/krushndayshmookh/animated-vg.git
cd animated-vg
npm install
```

Useful scripts

```bash
npm run dev            # web dev server
npm test               # unit/component tests
npm run test:watch     # watch mode
npm run e2e:install    # playwright browsers
npm run e2e            # e2e tests
npm run lint           # eslint
npm run format         # prettier write
npm run build          # production build
npm run electron:smoke # Electron smoke run
```

## Development workflow

- Tests first when possible; keep the suite green (Vitest + Playwright).
- Keep SVG as the single source of truth; avoid hidden state.
- Prefer minimal, focused PRs with clear descriptions and screenshots or GIFs when UI changes.
- Add or update tests for any user-facing change or bug fix.
- Update docs (README/PLAN) when public behavior or scope changes.

## Coding standards

- JavaScript/Vue 3 with Composition API; follow existing patterns.
- ESLint + Prettier are configured. Run `npm run lint` and `npm run format` before pushing.
- Avoid introducing new dependencies unless necessary; prefer small, well-maintained libraries.

## Commit style

- Use clear, imperative commit messages (e.g., "Add snapping to moveSelectedTo").
- Reference issues where relevant (e.g., "Fixes #123").

## Pull requests

1. Fork the repo and create a feature branch: `git checkout -b feat/short-description`
2. Make your changes with tests and docs.
3. Ensure linters and tests pass locally.
4. Push your branch and open a PR against `main` with a clear description.
5. Be responsive to review comments; keep changes scoped.

## Issue reports

- Use the provided issue templates if available.
- Include steps to reproduce, expected vs actual behavior, and environment details.
- For bugs, attach minimal SVG samples when possible.

## Security

If you discover a security issue, please do not open a public issue. Instead, email the maintainer listed in `package.json`.

## License

By contributing, you agree that your contributions will be licensed under the project’s LICENSE (MIT unless otherwise stated).
