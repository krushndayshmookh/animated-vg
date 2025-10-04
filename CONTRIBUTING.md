# Contributing to AnimatedVG

Thank you for your interest in contributing! This guide will help you get started.

## Getting Started

### Prerequisites

- Node.js 18+
- npm (recommended)
- For desktop development: Rust toolchain (Tauri only)

### Setup

```bash
git clone https://github.com/krushndayshmookh/animated-vg.git
cd animated-vg
npm install
```

### Development Commands

```bash
npm run dev            # Start development server
npm test               # Run tests
npm run lint           # Check code style
npm run format         # Format code
npm run build          # Production build
```

## Guidelines

### Code Standards

- Use Vue 3 Composition API and follow existing patterns
- Run `npm run lint` and `npm run format` before committing
- Write tests for new features and bug fixes
- Keep commits focused and write clear commit messages
- Prefer [eva icons](https://akveo.github.io/eva-icons/) for UI icons and fallback to [mdi](https://materialdesignicons.com/) if needed

### Pull Request Process

1. Fork the repository and create a feature branch (`git checkout -b feat/my-feature`)
2. Make your changes with appropriate tests
3. Ensure all tests and linting pass
4. Submit a pull request with a clear description

### Reporting Issues

When reporting bugs, please include:

- Steps to reproduce the issue
- Expected vs actual behavior
- Your environment details
- Sample SVG files if relevant

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
