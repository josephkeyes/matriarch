import { useCallback } from 'react'
import { useThemeContext } from '../contexts/ThemeContext'
import { useLayoutContext } from '../contexts/LayoutContext'

/**
 * useCommandExecution
 * 
 * Orchestrates command execution by bridging the CommandPalette
 * with application contexts (Theme, Layout, Navigation, etc).
 */
export function useCommandExecution(
    navigateTo: (id: string, noteId?: string | null) => void,
    createCollection: () => void,
    createNote: () => void
) {
    const { toggleTheme } = useThemeContext()
    const { toggleLeftSidebar, toggleRightSidebar } = useLayoutContext()

    const handleCommandExecuted = useCallback((commandId: string, output: unknown) => {
        const action = output as { action?: string; route?: string; params?: { action?: string } }

        if (action?.action === 'navigate' && action?.route) {
            navigateTo(action.route)
        } else if (action?.action === 'toggle' || action?.action === 'execute') {
            const param = action?.params?.action
            if (param === 'toggle-theme') {
                toggleTheme()
            } else if (param === 'toggle-left-sidebar') {
                toggleLeftSidebar()
            } else if (param === 'toggle-right-sidebar') {
                toggleRightSidebar()
            } else if (param === 'create-collection') {
                createCollection()
            } else if (param === 'create-note') {
                createNote()
            }
        }
    }, [navigateTo, createCollection, createNote, toggleTheme, toggleLeftSidebar, toggleRightSidebar])

    return handleCommandExecuted
}
