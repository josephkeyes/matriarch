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

            // Close palette after execution, UNLESS the command is to open it
            if (id !== 'app.command-palette') {
                close()
            }

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


    // Helper to check if key event matches accelerator
    const matchesHotkey = useCallback((e: KeyboardEvent, accelerator: string): boolean => {
        const parts = accelerator.toLowerCase().split('+')
        const key = parts[parts.length - 1]

        // Modifiers
        const hasCmd = parts.includes('commandorcontrol') || parts.includes('cmd') || parts.includes('ctrl') || parts.includes('meta')
        const hasShift = parts.includes('shift')
        const hasAlt = parts.includes('alt') || parts.includes('option')

        // Check modifiers
        // Note: On Mac, metaKey is Command. On Windows/Linux, ctrlKey is Control.
        // We check for either to be robust across platforms for "CommandOrControl" logic in web
        const eventCmd = e.metaKey || e.ctrlKey
        if (hasCmd !== eventCmd) return false
        if (hasShift !== e.shiftKey) return false
        if (hasAlt !== e.altKey) return false

        // Check Key
        // Special case character mappings if needed
        if (key === '\\' && e.key === '\\') return true
        if (key === ',' && e.key === ',') return true
        if (key === '/' && e.key === '/') return true

        return e.key.toLowerCase() === key
    }, [])

    // Handle keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // 1. Hardcoded fallback for Command Palette (using code for better layout support)
            if ((e.metaKey || e.ctrlKey) && e.shiftKey && (e.code === 'KeyP' || e.key.toLowerCase() === 'p')) {
                e.preventDefault()
                toggle()
                return
            }

            // 2. check other commands
            if (!commands.length) return

            for (const cmd of commands) {
                if (!cmd.enabled) continue

                // Helper to execute and stop propagation
                const trigger = () => {
                    e.preventDefault()
                    e.stopPropagation()
                    executeCommand(cmd.id)
                }

                // Check defined hotkeys
                if (cmd.hotkeys && cmd.hotkeys.length > 0) {
                    for (const hotkey of cmd.hotkeys) {
                        // Allow Command Palette to be triggered locally even if marked global (it's the app activator)
                        if (hotkey.isGlobal && cmd.id !== 'app.command-palette') continue

                        if (matchesHotkey(e, hotkey.accelerator)) {
                            trigger()
                            return
                        }
                    }
                }
                // Fallback for built-in commands that might have defaultHotkey property 
                // (though CommandRegistry maps it to hotkeys array, so this might be redundant but safe)
                else if ((cmd as any).defaultHotkey && !(cmd as any).defaultIsGlobal) {
                    if (matchesHotkey(e, (cmd as any).defaultHotkey)) {
                        trigger()
                        return
                    }
                }
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [commands, executeCommand, matchesHotkey, toggle])


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
