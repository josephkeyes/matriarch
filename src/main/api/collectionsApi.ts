/**
 * Collections API Handlers
 * Implements collection-related IPC endpoints.
 */

import { ipcMain } from 'electron'
import { CHANNELS } from '../../shared/api/channels'
import { DatabaseClient } from '../database/DatabaseClient'

/**
 * List all collections.
 */
export async function listCollections() {
    const db = DatabaseClient.getInstance().getClient()
    return db.collection.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
            folders: true
        }
    })
}

/**
 * Create a new collection.
 */
export async function createCollection(name: string) {
    const db = DatabaseClient.getInstance().getClient()
    return db.collection.create({
        data: { name }
    })
}

/**
 * Update a collection.
 */
export async function updateCollection(id: string, data: { name?: string }) {
    const db = DatabaseClient.getInstance().getClient()
    return db.collection.update({
        where: { id },
        data
    })
}

/**
 * Delete a collection.
 */
export async function deleteCollection(id: string) {
    const db = DatabaseClient.getInstance().getClient()
    return db.collection.delete({
        where: { id }
    })
}

/**
 * Register collections API handlers.
 */
export function registerCollectionsApi(): void {
    ipcMain.handle(CHANNELS.COLLECTIONS.LIST, async () => listCollections())
    ipcMain.handle(CHANNELS.COLLECTIONS.CREATE, async (_, name: string) => createCollection(name))
    ipcMain.handle(CHANNELS.COLLECTIONS.UPDATE, async (_, id: string, data: { name?: string }) => updateCollection(id, data))
    ipcMain.handle(CHANNELS.COLLECTIONS.DELETE, async (_, id: string) => deleteCollection(id))
}
