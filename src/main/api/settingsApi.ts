/**
 * Settings API Handlers
 * Implements settings-related IPC endpoints.
 */

import { ipcMain } from 'electron'
import { CHANNELS } from '../../shared/api/channels'
import { getAISettings, updateAISettings, type AISettings } from '../ai'

/**
 * Register settings API handlers.
 */
export function registerSettingsApi(): void {
    ipcMain.handle(CHANNELS.SETTINGS.GET_AI, async (): Promise<AISettings> => {
        return getAISettings()
    })

    ipcMain.handle(
        CHANNELS.SETTINGS.UPDATE_AI,
        async (_, settings: Partial<AISettings>): Promise<void> => {
            await updateAISettings(settings)
        }
    )
}
