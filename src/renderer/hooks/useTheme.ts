import { useState, useEffect, useCallback } from 'react'

export type Theme = 'light' | 'dark' | 'system'
export type ResolvedTheme = 'light' | 'dark'

interface UseThemeReturn {
    /** Current theme setting (light, dark, or system) */
    theme: Theme
    /** The actual resolved theme being displayed */
    resolvedTheme: ResolvedTheme
    /** Update the theme setting */
    setTheme: (theme: Theme) => void
    /** Toggle between light and dark (ignores system) */
    toggleTheme: () => void
}

const STORAGE_KEY = 'matriarch-theme'

/**
 * Hook for managing application theme with system preference detection.
 * 
 * Features:
 * - Persists user preference to localStorage
 * - Detects system preference when set to 'system'
 * - Applies 'dark' class to document root for Tailwind
 * - Provides toggle function for quick switching
 */
export function useTheme(): UseThemeReturn {
    const [theme, setThemeState] = useState<Theme>(() => {
        // Only run on client
        if (typeof window === 'undefined') return 'system'

        const stored = localStorage.getItem(STORAGE_KEY) as Theme | null
        return stored || 'system'
    })

    const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>('light')

    // Resolve the actual theme based on setting and system preference
    useEffect(() => {
        const root = window.document.documentElement
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

        const updateTheme = () => {
            let isDark: boolean

            if (theme === 'system') {
                isDark = mediaQuery.matches
            } else {
                isDark = theme === 'dark'
            }

            // Update DOM
            root.classList.toggle('dark', isDark)
            root.classList.toggle('light', !isDark)

            // Update resolved theme state
            setResolvedTheme(isDark ? 'dark' : 'light')
        }

        // Apply immediately
        updateTheme()

        // Listen for system preference changes
        mediaQuery.addEventListener('change', updateTheme)
        return () => mediaQuery.removeEventListener('change', updateTheme)
    }, [theme])

    // Persist theme changes
    const setTheme = useCallback((newTheme: Theme) => {
        setThemeState(newTheme)
        localStorage.setItem(STORAGE_KEY, newTheme)
    }, [])

    // Quick toggle between light and dark
    const toggleTheme = useCallback(() => {
        setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
    }, [resolvedTheme, setTheme])

    return {
        theme,
        resolvedTheme,
        setTheme,
        toggleTheme,
    }
}
