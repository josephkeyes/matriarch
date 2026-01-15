/**
 * Vitest Test Setup
 * 
 * Common configuration and mocks for all test files.
 * Automatically run before each test file.
 */

import '@testing-library/jest-dom'
import { vi } from 'vitest'

// ============================================================================
// Browser API Mocks
// ============================================================================

/**
 * Mock ResizeObserver for components that use it
 * (Required for some UI components that observe element dimensions)
 */
global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
}))

/**
 * Mock matchMedia for responsive components
 */
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
    })),
})

// ============================================================================
// Console Noise Reduction
// ============================================================================

/**
 * Optionally suppress console noise during tests
 * Uncomment if needed to reduce test output clutter
 */
// vi.spyOn(console, 'log').mockImplementation(() => {})
// vi.spyOn(console, 'warn').mockImplementation(() => {})
