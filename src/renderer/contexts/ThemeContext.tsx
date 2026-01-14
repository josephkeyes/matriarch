import { createContext, useContext, ReactNode } from 'react'
import { useTheme, Theme, ResolvedTheme } from '../hooks/useTheme'

interface ThemeContextValue {
    theme: Theme
    resolvedTheme: ResolvedTheme
    setTheme: (theme: Theme) => void
    toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

interface ThemeProviderProps {
    children: ReactNode
    /** Optional default theme (defaults to 'system') */
    defaultTheme?: Theme
}

/**
 * Theme provider component that wraps the application.
 * Provides theme state and controls to all child components.
 * 
 * @example
 * <ThemeProvider>
 *   <App />
 * </ThemeProvider>
 */
export function ThemeProvider({ children }: ThemeProviderProps) {
    const themeState = useTheme()

    return (
        <ThemeContext.Provider value={themeState}>
            {children}
        </ThemeContext.Provider>
    )
}

/**
 * Hook to access theme context.
 * Must be used within a ThemeProvider.
 * 
 * @example
 * const { theme, toggleTheme, resolvedTheme } = useThemeContext()
 */
export function useThemeContext(): ThemeContextValue {
    const context = useContext(ThemeContext)

    if (!context) {
        throw new Error('useThemeContext must be used within a ThemeProvider')
    }

    return context
}

// Re-export types for convenience
export type { Theme, ResolvedTheme }
