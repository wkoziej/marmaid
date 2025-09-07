/// <reference types="vitest" />
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load environment variables
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [react()],
    base: '/',
    build: {
      outDir: 'dist',
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['./src/test-setup.ts'],
      include: ['src/**/*.{test,spec}.{js,ts,tsx}'],
      exclude: ['**/e2e/**', '**/*.e2e.test.*', '**/node_modules/**'],
      silent: false,
      onConsoleLog: (_log, type) => {
        // Allow normal console logs but suppress stderr in CI
        if (process.env.CI && type === 'stderr') return false
        return true
      },
      // Pass environment variables to tests
      env: {
        ...env,
        VITE_SUPABASE_URL: env.VITE_SUPABASE_URL,
        VITE_SUPABASE_ANON_KEY: env.VITE_SUPABASE_ANON_KEY,
      },
      coverage: {
        provider: 'v8',
        reporter: ['text', 'html', 'text-summary'],
        exclude: ['node_modules/', 'src/test-setup*.ts', '**/e2e/**'],
      },
    },
  }
})
