/**
 * Navigation Context
 * 
 * Manages global navigation state for the application.
 * Replaces useAppNavigation hook to ensure state is shared.
 */
import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { events } from '../services/EventBus'
import { useEventSubscription } from '../hooks/useEventSubscription'

export type ViewType = 'dashboard' | 'note' | 'settings'

interface NavigationContextValue {
    activeView: ViewType
    activeNoteId: string | null
    navigateToDashboard: () => void
    navigateToSettings: () => void
    navigateToNote: (noteId: string) => void
    handleHeaderNav: (id: string, noteId?: string | null) => void
}

const NavigationContext = createContext<NavigationContextValue | null>(null)

export function NavigationProvider({ children }: { children: ReactNode }) {
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
        if (id === 'dashboard') navigateToDashboard()
        else if (id === 'settings') navigateToSettings()
        else if (id === 'note' && noteId) navigateToNote(noteId)
    }, [navigateToDashboard, navigateToSettings, navigateToNote])

    // Listen for EventBus requests via Hook
    useEventSubscription('navigation:request', (payload) => {
        if (payload.view === 'dashboard') navigateToDashboard()
        else if (payload.view === 'settings') navigateToSettings()
        else if (payload.view === 'note' && payload.noteId) navigateToNote(payload.noteId)
    })

    return (
        <NavigationContext.Provider value={{
            activeView,
            activeNoteId,
            navigateToDashboard,
            navigateToSettings,
            navigateToNote,
            handleHeaderNav
        }}>
            {children}
        </NavigationContext.Provider>
    )
}

export function useNavigation() {
    const context = useContext(NavigationContext)
    if (!context) throw new Error('useNavigation must be used within NavigationProvider')
    return context
}
