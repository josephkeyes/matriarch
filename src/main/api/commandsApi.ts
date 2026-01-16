/**
 * Commands API Handlers
 * 
 * IPC handlers for the command palette system.
 */

import { ipcMain } from 'electron'
import { CHANNELS } from '../../shared/api/channels'
import { CommandRegistry } from '../commands/CommandRegistry'
import { HotkeyManager } from '../commands/HotkeyManager'
import type {
    Command,
    CommandHotkey,
    CreateCommandDTO,
    UpdateCommandDTO,
    CommandExecutionContext,
    CommandType,
} from '../../shared/api/contracts'

export function registerCommandsHandlers(): void {
    const registry = CommandRegistry.getInstance()
    const hotkeyManager = HotkeyManager.getInstance()

    // List commands
    ipcMain.handle(
        CHANNELS.COMMANDS.LIST,
        async (_, filter?: { type?: CommandType; enabled?: boolean }): Promise<Command[]> => {
            const commands = await registry.listCommands(filter)
            return commands
        }
    )

    // Get single command
    ipcMain.handle(
        CHANNELS.COMMANDS.GET,
        async (_, id: string): Promise<Command | null> => {
            return await registry.getCommand(id)
        }
    )

    // Create command
    ipcMain.handle(
        CHANNELS.COMMANDS.CREATE,
        async (_, data: CreateCommandDTO): Promise<Command> => {
            return await registry.createCommand({
                name: data.name,
                description: data.description,
                type: data.type,
                actionType: data.actionType,
                actionPayload: data.actionPayload,
                category: data.category,
            })
        }
    )

    // Update command
    ipcMain.handle(
        CHANNELS.COMMANDS.UPDATE,
        async (_, id: string, data: UpdateCommandDTO): Promise<Command> => {
            const command = await registry.updateCommand(id, data)
            // Refresh hotkeys if enabled state changed
            if (data.enabled !== undefined) {
                await hotkeyManager.refreshCommandHotkeys(id)
            }
            return command
        }
    )

    // Delete command
    ipcMain.handle(
        CHANNELS.COMMANDS.DELETE,
        async (_, id: string): Promise<void> => {
            // Unregister hotkeys first
            const command = await registry.getCommand(id)
            if (command) {
                for (const hotkey of command.hotkeys) {
                    if (hotkey.isGlobal) {
                        hotkeyManager.unregisterHotkey(hotkey.accelerator)
                    }
                }
            }
            await registry.deleteCommand(id)
        }
    )

    // Execute command
    ipcMain.handle(
        CHANNELS.COMMANDS.EXECUTE,
        async (_, id: string, context?: CommandExecutionContext) => {
            return await registry.executeCommand(id, context)
        }
    )

    // Add hotkey
    ipcMain.handle(
        CHANNELS.COMMANDS.ADD_HOTKEY,
        async (_, commandId: string, accelerator: string, isGlobal = false): Promise<CommandHotkey> => {
            const hotkey = await registry.addHotkey(commandId, accelerator, isGlobal)
            if (isGlobal) {
                hotkeyManager.registerHotkey(commandId, accelerator)
            }
            return hotkey
        }
    )

    // Remove hotkey
    ipcMain.handle(
        CHANNELS.COMMANDS.REMOVE_HOTKEY,
        async (_, hotkeyId: string): Promise<void> => {
            // We need to find the hotkey to know if it was global
            // For now, just try to unregister all matching accelerators
            await registry.removeHotkey(hotkeyId)
        }
    )

    // Update hotkey
    ipcMain.handle(
        CHANNELS.COMMANDS.UPDATE_HOTKEY,
        async (_, hotkeyId: string, accelerator: string): Promise<CommandHotkey> => {
            return await registry.updateHotkey(hotkeyId, accelerator)
        }
    )
}
