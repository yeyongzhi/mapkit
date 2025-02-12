import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['packages/*/__tests__/*.spec.ts'],
    environment: 'jsdom',
    globals: true,
    pool: 'threads',
    sequence: {
      hooks: 'list',
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['packages/*/src/**'],
    },
    exclude: [],
  },
})
