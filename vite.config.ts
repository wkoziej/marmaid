/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { execSync } from 'child_process';

// Get git commit info at build time
const getGitInfo = () => {
  try {
    const commit = execSync('git rev-parse --short HEAD').toString().trim();
    const branch = execSync('git rev-parse --abbrev-ref HEAD')
      .toString()
      .trim();
    const date = execSync('git log -1 --format=%cd --date=short')
      .toString()
      .trim();
    return { commit, branch, date };
  } catch {
    return { commit: 'unknown', branch: 'unknown', date: 'unknown' };
  }
};

export default defineConfig({
  plugins: [react()],
  base: '/',
  server: {
    historyApiFallback: true,
  },
  build: {
    outDir: 'dist',
  },
  preview: {
    historyApiFallback: true,
  },
  define: {
    __GIT_INFO__: JSON.stringify(getGitInfo()),
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
    include: [
      'src/**/*.{test,spec}.{js,ts,tsx}',
      'tests/**/*.{test,spec}.{js,ts,tsx}',
    ],
    exclude: ['**/node_modules/**', 'tests/e2e/**'],
    silent: false,
  },
});
