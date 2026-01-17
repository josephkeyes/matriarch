/**
 * AI Actions API
 * 
 * IPC handlers for managing AI actions.
 */

import { ipcMain } from 'electron'
import { CHANNELS } from '../../shared/api/channels'
import {
    listActions,
    createAction,
    updateAction,
    deleteAction,
    executeAction,
    getActionLogs,
    CreateAIActionDTO,
    UpdateAIActionDTO
} from '../settings/AIActionService'

/**
 * Register all AI Actions IPC handlers.
 */
export function registerAIActionsHandlers(): void {
    // List Actions
    ipcMain.handle(CHANNELS.AI_ACTIONS.LIST, async () => {
        return listActions()
    })

    // Create Action
    ipcMain.handle(CHANNELS.AI_ACTIONS.CREATE, async (_event, data: CreateAIActionDTO) => {
        return createAction(data)
    })

    // Update Action
    ipcMain.handle(CHANNELS.AI_ACTIONS.UPDATE, async (_event, id: string, data: UpdateAIActionDTO) => {
        return updateAction(id, data)
    })

    // Delete Action
    ipcMain.handle(CHANNELS.AI_ACTIONS.DELETE, async (_event, id: string) => {
        return deleteAction(id)
    })

    // Execute Action
    ipcMain.handle(CHANNELS.AI_ACTIONS.EXECUTE, async (_event, actionId: string, selection: string) => {
        return executeAction(actionId, selection)
    })

    // Get Logs
    ipcMain.handle(CHANNELS.AI_ACTIONS.GET_LOGS, async (_event, actionId: string, limit?: number) => {
        return getActionLogs(actionId, limit)
    })
}
