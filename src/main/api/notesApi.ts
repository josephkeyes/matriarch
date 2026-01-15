/**
 * Notes API Handlers
 * Implements note-related IPC endpoints.
 */

import { ipcMain } from 'electron'
import { CHANNELS } from '../../shared/api/channels'
import { DatabaseClient } from '../database/DatabaseClient'

interface CreateNoteDTO {
    title: string
    content?: string
    metadata?: Record<string, any>
}

interface UpdateNoteDTO {
    title?: string
    content?: string
    metadata?: Record<string, any>
}

/**
 * Create a new note.
 */
export async function createNote(data: CreateNoteDTO) {
    const db = DatabaseClient.getInstance().getClient()
    return db.note.create({
        data: {
            title: data.title,
            content: data.content || '',
            metadata: data.metadata ? JSON.stringify(data.metadata) : undefined
        }
    })
}

/**
 * Get a note by ID.
 */
export async function getNote(id: string) {
    const db = DatabaseClient.getInstance().getClient()
    return db.note.findUnique({
        where: { id },
        include: {
            placements: {
                include: {
                    collection: true,
                    folder: true
                }
            },
            categories: true
        }
    })
}

/**
 * Update a note.
 */
export async function updateNote(id: string, data: UpdateNoteDTO) {
    const db = DatabaseClient.getInstance().getClient()
    // Prepare update data
    const updateData: any = { ...data }

    // If metadata is provided as object, stringify it
    if (data.metadata) {
        updateData.metadata = JSON.stringify(data.metadata)
    }

    return db.note.update({
        where: { id },
        data: updateData
    })
}

/**
 * Delete a note.
 */
export async function deleteNote(id: string) {
    const db = DatabaseClient.getInstance().getClient()
    return db.note.delete({
        where: { id }
    })
}

/**
 * Register notes API handlers.
 */
export function registerNotesApi(): void {
    ipcMain.handle(CHANNELS.NOTES.CREATE, async (_, data: CreateNoteDTO) => createNote(data))
    ipcMain.handle(CHANNELS.NOTES.READ, async (_, id: string) => getNote(id))
    ipcMain.handle(CHANNELS.NOTES.UPDATE, async (_, id: string, data: UpdateNoteDTO) => updateNote(id, data))
    ipcMain.handle(CHANNELS.NOTES.DELETE, async (_, id: string) => deleteNote(id))
}
