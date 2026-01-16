/**
 * Command Palette Context
 * 
 * Global state for the command palette system.
 * Provides access to commands, palette visibility, and command execution.
 */

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import type { Command, CommandExecutionContext, CommandExecutionResult } from '../../shared/api/contracts'

interface CommandPaletteContextValue {
    /** Whether the command palette is currently open */
    isOpen: boolean
    /** Open the command palette */
    open: () => void
    /** Close the command palette */
    close: () => void
    /** Toggle the command palette */
    toggle: () => void
    /** All enabled commands */
    commands: Command[]
    /** Loading state */
    isLoading: boolean
    /** Refresh commands from backend */
    refreshCommands: () => Promise<void>
    /** Execute a command */
    executeCommand: (id: string, context?: CommandExecutionContext) => Promise<CommandExecutionResult>
    /** Navigate to settings commands section */
    navigateToCommandSettings: () => void
}

const CommandPaletteContext = createContext<CommandPaletteContextValue | null>(null)

interface CommandPaletteProviderProps {
    children: ReactNode
    /** Callback when navigating to settings */
    onNavigateToSettings?: () => void
    /** Callback for handling command execution results (navigation, toggles, etc.) */
    onCommandExecuted?: (commandId: string, output: unknown) => void
}

export function CommandPaletteProvider({
    children,
    onNavigateToSettings,
    onCommandExecuted,
}: CommandPaletteProviderProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [commands, setCommands] = useState<Command[]>([])
    const [isLoading, setIsLoading] = useState(true)

    const open = useCallback(() => setIsOpen(true), [])
    const close = useCallback(() => setIsOpen(false), [])
    const toggle = useCallback(() => setIsOpen(prev => !prev), [])

    const refreshCommands = useCallback(async () => {
        setIsLoading(true)
        try {
            if (window.matriarch?.commands) {
                const list = await window.matriarch.commands.list({ enabled: true })
                setCommands(list)
            }
        } catch (error) {
            console.error('[CommandPalette] Failed to load commands:', error)
        } finally {
            setIsLoading(false)
        }
    }, [])

    const executeCommand = useCallback(async (
        id: string,
        context?: CommandExecutionContext
    ): Promise<CommandExecutionResult> => {
        try {
            if (!window.matriarch?.commands) {
                return { success: false, error: 'Commands API not available' }
            }

            const result = await window.matriarch.commands.execute(id, context)

            // Close palette after execution
            close()

            // Notify parent of execution result for handling navigation/toggles
            if (result.success && result.output && onCommandExecuted) {
                onCommandExecuted(id, result.output)
            }

            return result
        } catch (error) {
            console.error('[CommandPalette] Command execution failed:', error)
            return {
                success: false,
                error: error instanceof Error ? error.message : String(error)
            }
        }
    }, [close, onCommandExecuted])

    const navigateToCommandSettings = useCallback(() => {
        close()
        onNavigateToSettings?.()
    }, [close, onNavigateToSettings])

    // Load commands on mount
    useEffect(() => {
        refreshCommands()
    }, [refreshCommands])

    // Handle keyboard shortcut (Cmd+Shift+P) for in-app triggering
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'p') {
                e.preventDefault()
                toggle()
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [toggle])

    // Listen for command execution from main process (global hotkeys)
    useEffect(() => {
        const handleCommandExecuted = (_event: unknown, data: { commandId: string; output: unknown }) => {
            if (data.commandId === 'app.command-palette') {
                toggle()
            } else if (onCommandExecuted) {
                onCommandExecuted(data.commandId, data.output)
            }
        }

        // Set up IPC listener if available
        if (window.ipcRenderer) {
            window.ipcRenderer.on('command:executed', handleCommandExecuted)
            return () => {
                window.ipcRenderer.off('command:executed', handleCommandExecuted)
            }
        }
    }, [toggle, onCommandExecuted])

    const value: CommandPaletteContextValue = {
        isOpen,
        open,
        close,
        toggle,
        commands,
        isLoading,
        refreshCommands,
        executeCommand,
        navigateToCommandSettings,
    }

    return (
        <CommandPaletteContext.Provider value={value}>
            {children}
        </CommandPaletteContext.Provider>
    )
}

export function useCommandPalette(): CommandPaletteContextValue {
    const context = useContext(CommandPaletteContext)
    if (!context) {
        throw new Error('useCommandPalette must be used within a CommandPaletteProvider')
    }
    return context
}
