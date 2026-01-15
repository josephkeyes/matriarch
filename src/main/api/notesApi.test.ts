
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createNote, getNote, updateNote, deleteNote } from './notesApi'
import { DatabaseClient } from '../database/DatabaseClient'
import { app } from 'electron'
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'

// Mock Electron app
vi.mock('electron', () => ({
    app: {
        getPath: vi.fn(),
    },
    ipcMain: {
        handle: vi.fn()
    }
}))

describe('Notes API', () => {
    let tempDir: string

    beforeEach(async () => {
        // Create a temp directory for each test
        tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'matriarch-test-api-notes-'))
        vi.mocked(app.getPath).mockReturnValue(tempDir)

        // Reset the singleton instance
        // @ts-ignore
        DatabaseClient.instance = undefined

        // Initialize DB
        await DatabaseClient.getInstance().initialize()
    })

    afterEach(() => {
        try {
            fs.rmSync(tempDir, { recursive: true, force: true })
        } catch (e) {
            console.error('Failed to clean up temp dir', e)
        }
    })

    it('should create a note', async () => {
        const note = await createNote({
            title: 'API Note',
            content: 'Created via API'
        })

        expect(note.id).toBeDefined()
        expect(note.title).toBe('API Note')
        expect(note.content).toBe('Created via API')
    })

    it('should get a note by id', async () => {
        const created = await createNote({
            title: 'To Retrieve',
            content: 'Content'
        })

        const retrieved = await getNote(created.id)
        expect(retrieved).toBeDefined()
        expect(retrieved?.id).toBe(created.id)
        expect(retrieved?.title).toBe('To Retrieve')
    })

    it('should update a note', async () => {
        const created = await createNote({
            title: 'Original Title',
            content: 'Original Content'
        })

        const updated = await updateNote(created.id, {
            title: 'Updated Title'
        })

        expect(updated.title).toBe('Updated Title')
        expect(updated.content).toBe('Original Content') // Should remain unchanged
    })

    it('should delete a note', async () => {
        const created = await createNote({
            title: 'To Delete'
        })

        await deleteNote(created.id)

        const retrieved = await getNote(created.id)
        expect(retrieved).toBeNull()
    })

    it('should create a note and place it in a collection', async () => {
        const client = DatabaseClient.getInstance().getClient()
        // Create a collection first
        const collection = await client.collection.create({
            data: { name: 'Test Collection' }
        })

        const note = await createNote({
            title: 'Placed Note',
            collectionId: collection.id
        })

        expect(note.id).toBeDefined()

        // Verify placement
        const savedNote = await getNote(note.id)
        expect(savedNote?.placements).toHaveLength(1)
        expect(savedNote?.placements[0].collectionId).toBe(collection.id)
    })
})
