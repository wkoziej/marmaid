/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test-setup.ts',
    include: ['src/**/*.{test,spec}.{js,ts,tsx}'],
    exclude: ['**/e2e/**', '**/*.e2e.test.*', '**/node_modules/**'],
    silent: false,
    onConsoleLog: (log, type) => {
      // Allow normal console logs but suppress stderr in CI
      if (process.env.CI && type === 'stderr') return false
      return true
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      exclude: ['node_modules/', 'src/test-setup.ts', '**/e2e/**'],
    },
  },
})
