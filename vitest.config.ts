import { defineConfig } from 'vitest/config'
import path from 'node:path'

export default defineConfig({
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: './src/test/setup.ts',
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
        exclude: ['**/node_modules/**', '**/dist/**', '**/e2e/**'],
        coverage: {
            provider: 'istanbul',
            reporter: ['text', 'html', 'lcov'],
            reportsDirectory: './coverage',
            include: ['src/**/*.{ts,tsx}'],
            exclude: [
                'src/**/*.test.{ts,tsx}',
                'src/**/*.d.ts',
                'src/test/**',
            ],
        },
    },
})
