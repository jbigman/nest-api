import swc from 'unplugin-swc'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // options: https://vitest.dev/config/
    // includeSource: ['src/**/*.{js,ts}'],
    setupFiles: ['./test/setup/initalize-server.ts'],
    testTimeout: 300000,
    hookTimeout: 300000,
    teardownTimeout: 300000,
    coverage: {
      exclude: ['test/**', '**/*.model.ts', '../..', '**/I*.ts'],
    },
  },
  plugins: [
    // This is required to build the test files with SWC
    swc.vite({
      // Explicitly set the module type to avoid inheriting this value from a `.swcrc` config file
      module: { type: 'nodenext' },
    }),
  ],
})
