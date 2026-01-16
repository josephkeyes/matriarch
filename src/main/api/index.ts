/**
 * Main Process API Registration
 * 
 * Central hub for registering all IPC handlers.
 * Called once during app initialization before creating windows.
 * 
 * @see Phase-0 §8.1 - Internal API Layer
 */

import { registerSystemApi } from './systemApi'
import { registerSettingsApi } from './settingsApi'
import { registerAgentsApi } from './agentsApi'
import { registerCollectionsApi } from './collectionsApi'
import { registerNotesApi } from './notesApi'
import { registerAIProvidersHandlers } from './aiProvidersApi'
import { registerCommandsHandlers } from './commandsApi'

/**
 * Register all API handlers.
 * Must be called before any renderer process attempts IPC communication.
 */
export function registerAllHandlers(): void {
    console.log('Registering API handlers...')

    registerSystemApi()
    registerSettingsApi()
    registerAgentsApi()
    registerCollectionsApi()
    registerNotesApi()
    registerAIProvidersHandlers()
    registerCommandsHandlers()

    console.log('API handlers registered successfully')
}

