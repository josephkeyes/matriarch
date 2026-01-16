/**
 * Hotkey Manager
 * 
 * Manages Electron global shortcuts for commands.
 * Registers/unregisters shortcuts and triggers command execution.
 */

import { globalShortcut, BrowserWindow } from 'electron'
import { CommandRegistry } from './CommandRegistry'

export class HotkeyManager {
    private static instance: HotkeyManager
    private registeredAccelerators: Map<string, string> = new Map() // accelerator -> commandId
    private initialized = false

    private constructor() {
        // Singleton
    }

    public static getInstance(): HotkeyManager {
        if (!HotkeyManager.instance) {
            HotkeyManager.instance = new HotkeyManager()
        }
        return HotkeyManager.instance
    }

    /**
     * Initialize the hotkey manager.
     * Loads all global hotkeys from commands and registers them.
     */
    public async initialize(): Promise<void> {
        if (this.initialized) {
            console.log('[HotkeyManager] Already initialized')
            return
        }

        console.log('[HotkeyManager] Initializing...')
        await this.registerAllGlobalHotkeys()
        this.initialized = true
        console.log('[HotkeyManager] Initialization complete')
    }

    /**
     * Register all global hotkeys from enabled commands.
     */
    public async registerAllGlobalHotkeys(): Promise<void> {
        const registry = CommandRegistry.getInstance()
        const commands = await registry.listCommands({ enabled: true })

        for (const command of commands) {
            for (const hotkey of command.hotkeys) {
                if (hotkey.isGlobal) {
                    this.registerHotkey(command.id, hotkey.accelerator)
                }
            }
        }

        console.log(`[HotkeyManager] Registered ${this.registeredAccelerators.size} global hotkeys`)
    }

    /**
     * Register a global hotkey for a command.
     */
    public registerHotkey(commandId: string, accelerator: string): boolean {
        // Unregister if already registered
        if (this.registeredAccelerators.has(accelerator)) {
            this.unregisterHotkey(accelerator)
        }

        try {
            const success = globalShortcut.register(accelerator, () => {
                this.handleHotkeyTriggered(commandId, accelerator)
            })

            if (success) {
                this.registeredAccelerators.set(accelerator, commandId)
                console.log(`[HotkeyManager] Registered hotkey: ${accelerator} -> ${commandId}`)
                return true
            } else {
                console.warn(`[HotkeyManager] Failed to register hotkey: ${accelerator}`)
                return false
            }
        } catch (error) {
            console.error(`[HotkeyManager] Error registering hotkey ${accelerator}:`, error)
            return false
        }
    }

    /**
     * Unregister a global hotkey.
     */
    public unregisterHotkey(accelerator: string): void {
        if (this.registeredAccelerators.has(accelerator)) {
            try {
                globalShortcut.unregister(accelerator)
                this.registeredAccelerators.delete(accelerator)
                console.log(`[HotkeyManager] Unregistered hotkey: ${accelerator}`)
            } catch (error) {
                console.error(`[HotkeyManager] Error unregistering hotkey ${accelerator}:`, error)
            }
        }
    }

    /**
     * Unregister all global hotkeys.
     */
    public unregisterAll(): void {
        console.log('[HotkeyManager] Unregistering all hotkeys')
        globalShortcut.unregisterAll()
        this.registeredAccelerators.clear()
    }

    /**
     * Check if an accelerator is valid Electron format.
     */
    public isAcceleratorValid(accelerator: string): boolean {
        // Basic validation of Electron accelerator format
        // Valid modifiers: Command, Cmd, Control, Ctrl, CommandOrControl, CmdOrCtrl, Alt, Option, AltGr, Shift, Super, Meta
        // Valid keys: 0-9, A-Z, F1-F24, Space, Tab, Backspace, Delete, Insert, Return, Enter, Up, Down, Left, Right, Home, End, PageUp, PageDown, Escape, Esc, etc.

        const modifiers = [
            'Command', 'Cmd', 'Control', 'Ctrl', 'CommandOrControl', 'CmdOrCtrl',
            'Alt', 'Option', 'AltGr', 'Shift', 'Super', 'Meta'
        ]

        const parts = accelerator.split('+')
        if (parts.length === 0) return false

        // Last part should be a key
        const key = parts[parts.length - 1]
        if (!key || key.length === 0) return false

        // All other parts should be valid modifiers
        for (let i = 0; i < parts.length - 1; i++) {
            if (!modifiers.includes(parts[i])) {
                return false
            }
        }

        return true
    }

    /**
     * Check if an accelerator is available (not already registered).
     */
    public isAcceleratorAvailable(accelerator: string): boolean {
        return !this.registeredAccelerators.has(accelerator)
    }

    /**
     * Get the command ID for a registered accelerator.
     */
    public getCommandForAccelerator(accelerator: string): string | undefined {
        return this.registeredAccelerators.get(accelerator)
    }

    /**
     * Handle when a hotkey is triggered.
     */
    private async handleHotkeyTriggered(commandId: string, accelerator: string): Promise<void> {
        console.log(`[HotkeyManager] Hotkey triggered: ${accelerator} -> ${commandId}`)

        const registry = CommandRegistry.getInstance()
        const result = await registry.executeCommand(commandId)

        if (result.success) {
            // Send result to renderer to handle UI updates
            this.sendToRenderer('command:executed', {
                commandId,
                output: result.output,
            })
        } else {
            console.error(`[HotkeyManager] Command execution failed: ${result.error}`)
            this.sendToRenderer('command:error', {
                commandId,
                error: result.error,
            })
        }
    }

    /**
     * Send a message to the focused renderer window.
     */
    private sendToRenderer(channel: string, data: unknown): void {
        const focusedWindow = BrowserWindow.getFocusedWindow()

        if (focusedWindow) {
            focusedWindow.webContents.send(channel, data)
        } else {
            // Send to all windows if none focused
            const allWindows = BrowserWindow.getAllWindows()
            for (const win of allWindows) {
                win.webContents.send(channel, data)
            }
        }
    }

    /**
     * Refresh hotkeys for a specific command.
     * Call this after updating a command's hotkeys.
     */
    public async refreshCommandHotkeys(commandId: string): Promise<void> {
        // Unregister all hotkeys for this command
        for (const [accelerator, cmdId] of this.registeredAccelerators.entries()) {
            if (cmdId === commandId) {
                this.unregisterHotkey(accelerator)
            }
        }

        // Re-register from database
        const registry = CommandRegistry.getInstance()
        const command = await registry.getCommand(commandId)

        if (command && command.enabled) {
            for (const hotkey of command.hotkeys) {
                if (hotkey.isGlobal) {
                    this.registerHotkey(commandId, hotkey.accelerator)
                }
            }
        }
    }
}
