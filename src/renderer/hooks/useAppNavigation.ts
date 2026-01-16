import { useState, useEffect, useCallback } from 'react'

export type ViewType = 'dashboard' | 'note' | 'settings'

export function useAppNavigation() {
    const [activeView, setActiveView] = useState<ViewType>('dashboard')
    const [activeNoteId, setActiveNoteId] = useState<string | null>(null)

    const navigateToDashboard = useCallback(() => {
        setActiveView('dashboard')
        setActiveNoteId(null)
    }, [])

    const navigateToSettings = useCallback(() => {
        setActiveView('settings')
        setActiveNoteId(null)
    }, [])

    const navigateToNote = useCallback((noteId: string) => {
        setActiveNoteId(noteId)
        setActiveView('note')
    }, [])

    const handleHeaderNav = useCallback((id: string, noteId?: string | null) => {
        if (id === 'dashboard') {
            navigateToDashboard()
        } else if (id === 'settings') {
            navigateToSettings()
        } else if (id === 'note' && noteId) {
            navigateToNote(noteId)
        }
    }, [navigateToDashboard, navigateToSettings, navigateToNote])

    // Listen for global navigation events (e.g. from Command Palette)
    useEffect(() => {
        const handleNavigate = (e: CustomEvent<{ view: string }>) => {
            if (e.detail.view === 'dashboard') {
                navigateToDashboard()
            } else if (e.detail.view === 'settings') {
                navigateToSettings()
            }
        }

        window.addEventListener('matriarch:navigate', handleNavigate as EventListener)
        return () => {
            window.removeEventListener('matriarch:navigate', handleNavigate as EventListener)
        }
    }, [navigateToDashboard, navigateToSettings])

    return {
        activeView,
        activeNoteId,
        navigateToDashboard,
        navigateToSettings,
        navigateToNote,
        handleHeaderNav
    }
}
