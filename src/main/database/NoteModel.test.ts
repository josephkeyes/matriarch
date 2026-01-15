
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { DatabaseClient } from './DatabaseClient'
import { app } from 'electron'
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'

// Mock Electron app
vi.mock('electron', () => ({
    app: {
        getPath: vi.fn(),
    },
}))

describe('NoteModel', () => {
    let tempDir: string

    beforeEach(async () => {
        // Create a temp directory for each test
        tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'matriarch-test-notes-'))
        vi.mocked(app.getPath).mockReturnValue(tempDir)

        // Reset the singleton instance for isolation
        // @ts-ignore
        DatabaseClient.instance = undefined

        // Initialize DB
        await DatabaseClient.getInstance().initialize()
    })

    afterEach(() => {
        // Cleanup temp dir
        try {
            fs.rmSync(tempDir, { recursive: true, force: true })
        } catch (e) {
            console.error('Failed to clean up temp dir', e)
        }
    })

    it('should create and retrieve a note', async () => {
        const client = DatabaseClient.getInstance().getClient()

        const note = await client.note.create({
            data: {
                title: 'My First Note',
                content: '# Hello World',
                metadata: JSON.stringify({ tags: ['test'] })
            }
        })

        expect(note.id).toBeDefined()
        expect(note.title).toBe('My First Note')

        const retrieved = await client.note.findUnique({
            where: { id: note.id }
        })

        expect(retrieved?.content).toBe('# Hello World')
    })

    it('should organize notes in collections and folders', async () => {
        const client = DatabaseClient.getInstance().getClient()

        // Create Collection
        const collection = await client.collection.create({
            data: { name: 'Personal' }
        })

        // Create Folder in Collection
        const folder = await client.folder.create({
            data: {
                name: 'Journal',
                collectionId: collection.id
            }
        })

        // Create Note
        const note = await client.note.create({
            data: {
                title: 'Daily Entry',
                content: 'Today was good.'
            }
        })

        // Place Note in Folder
        await client.notePlacement.create({
            data: {
                noteId: note.id,
                collectionId: collection.id,
                folderId: folder.id
            }
        })

        // Verify placement
        const savedFolder = await client.folder.findUnique({
            where: { id: folder.id },
            include: { placements: { include: { note: true } } }
        })

        expect(savedFolder?.placements).toHaveLength(1)
        expect(savedFolder?.placements[0].note.title).toBe('Daily Entry')
    })

    it('should handle categories', async () => {
        const client = DatabaseClient.getInstance().getClient()

        const category = await client.category.create({
            data: { name: 'idea' }
        })

        const note = await client.note.create({
            data: {
                title: 'Brainstorm',
                content: 'An idea',
                categories: {
                    connect: { id: category.id }
                }
            },
            include: { categories: true }
        })

        expect(note.categories).toHaveLength(1)
        expect(note.categories[0].name).toBe('idea')
    })
})
