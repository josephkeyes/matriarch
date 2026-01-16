/**
 * Settings API Handlers
 * 
 * Implements settings-related IPC endpoints.
 * Uses the SettingsService for all operations.
 */

import { ipcMain } from 'electron'
import { CHANNELS } from '../../shared/api/channels'
import {
    getGeneralSettings,
    updateGeneralSettings,
    getAISettings,
    updateAISettings,
    resetToDefaults,
    SettingsCategory,
} from '../settings'
import type { GeneralSettings, AISettings } from '../settings'

/**
 * Register settings API handlers.
 */
export function registerSettingsApi(): void {
    // General Settings
    ipcMain.handle(
        CHANNELS.SETTINGS.GET_GENERAL,
        async (): Promise<GeneralSettings> => {
            return getGeneralSettings()
        }
    )

    ipcMain.handle(
        CHANNELS.SETTINGS.UPDATE_GENERAL,
        async (_, settings: Partial<GeneralSettings>): Promise<void> => {
            await updateGeneralSettings(settings)
        }
    )

    // AI Settings
    ipcMain.handle(
        CHANNELS.SETTINGS.GET_AI,
        async (): Promise<AISettings> => {
            return getAISettings()
        }
    )

    ipcMain.handle(
        CHANNELS.SETTINGS.UPDATE_AI,
        async (_, settings: Partial<AISettings>): Promise<void> => {
            await updateAISettings(settings)
        }
    )

    // Reset to Defaults
    ipcMain.handle(
        CHANNELS.SETTINGS.RESET_DEFAULTS,
        async (_, category?: 'general' | 'ai'): Promise<void> => {
            const cat = category === 'general' ? SettingsCategory.GENERAL
                : category === 'ai' ? SettingsCategory.AI
                    : undefined
            await resetToDefaults(cat)
        }
    )
}
