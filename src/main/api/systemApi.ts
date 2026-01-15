/**
 * System API Handler
 * Implements the system-level IPC endpoints.
 */

import { ipcMain } from 'electron'
import { app } from 'electron'
import { CHANNELS } from '../../shared/api/channels'
import type { HealthResponse } from '../../shared/api/contracts'

/**
 * Register system API handlers.
 * Called once during app initialization.
 */
export function registerSystemApi(): void {
    ipcMain.handle(CHANNELS.SYSTEM.HEALTH, async (): Promise<HealthResponse> => {
        return {
            status: 'ok',
            timestamp: Date.now(),
            version: app.getVersion(),
        }
    })
}
