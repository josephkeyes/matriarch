/**
 * AI Providers API
 * 
 * IPC handlers for managing AI provider configuration.
 */

import { ipcMain } from 'electron'
import { CHANNELS } from '../../shared/api/channels'
import {
    getProviders,
    setProviderEnabled,
    getProviderConfig,
    updateProviderConfig,
    checkProviderAvailability,
    getOllamaModels,
} from '../settings/AIProviderService'
import { AIProviderType, OllamaConfig } from '../settings/providerTypes'

/**
 * Register all AI provider IPC handlers.
 */
export function registerAIProvidersHandlers(): void {
    // List all providers
    ipcMain.handle(CHANNELS.AI_PROVIDERS.LIST, async () => {
        return getProviders()
    })

    // Get config for a provider
    ipcMain.handle(CHANNELS.AI_PROVIDERS.GET_CONFIG, async (_event, providerId: string) => {
        return getProviderConfig(providerId)
    })

    // Enable/disable a provider
    ipcMain.handle(
        CHANNELS.AI_PROVIDERS.SET_ENABLED,
        async (_event, providerId: string, enabled: boolean) => {
            await setProviderEnabled(providerId, enabled)
        }
    )

    // Update provider config
    ipcMain.handle(
        CHANNELS.AI_PROVIDERS.UPDATE_CONFIG,
        async (_event, providerId: string, config: Record<string, unknown>) => {
            await updateProviderConfig(providerId, config as unknown as OllamaConfig)
        }
    )

    // Check availability
    ipcMain.handle(
        CHANNELS.AI_PROVIDERS.CHECK_AVAILABILITY,
        async (_event, providerId: string) => {
            const config = await getProviderConfig(providerId)
            return checkProviderAvailability(providerId, config)
        }
    )

    // Get models (for Ollama)
    ipcMain.handle(CHANNELS.AI_PROVIDERS.GET_MODELS, async (_event, providerId: string) => {
        if (providerId === AIProviderType.OLLAMA) {
            const config = await getProviderConfig(providerId) as OllamaConfig | null
            return getOllamaModels(config)
        }
        return []
    })
}
