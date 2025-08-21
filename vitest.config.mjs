import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import path from 'node:path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      components: path.resolve(process.cwd(), 'src/components'),
      pages: path.resolve(process.cwd(), 'src/pages'),
      layouts: path.resolve(process.cwd(), 'src/layouts'),
      assets: path.resolve(process.cwd(), 'src/assets'),
      src: path.resolve(process.cwd(), 'src'),
    },
  },
  test: {
    environment: 'jsdom',
    include: ['tests/**/*.test.{js,ts}'],
    globals: true,
    css: true,
  },
})
